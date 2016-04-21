
/*
 *  TruckMap - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array with all truck locations and opening indicator, indexed by hour
 */

TruckMap = function(_parentElement, _timeTable, _truckData, _truck_to_index, _index_to_truck, _mapPosition) {
    this.parentElement = _parentElement;
    this.timeTable = _timeTable;
    this.truckData = _truckData;
    this.truck_to_index = _truck_to_index;
    this.index_to_truck = _index_to_truck;
    this.mapPosition = _mapPosition;

    // define attributes for truck circles
    this.closeTruckColor = 'black';
    this.openTruckColor = 'yellow';
    this.hoverTruckColor = 'red';

    this.origTruckSize = 5;
    this.hoverTruckSize = 8;

    this.origTruckOpacity = 0.1;
    this.hoverTruckOpacity = 1.0;

    this.origTruckBorder = 1;
    this.hoverTruckBorder = 5;

    this.width = 1000;
    this.timelineHeight = 200;
    this.mapHeight = 750;
    this.padding = 50;

    this.initVis();
};

/*
 *  Initialize station map
 */

TruckMap.prototype.initVis = function() {
    var vis = this;

    // initialize playing indicator
    vis.playing = false;

    // initialize hour to Sunday midnight
    vis.hour = 0;

    //vis.timeline = d3.slider().axis(true).min(0).max(168).step(1);

    //d3.select("#truck-timeline").call(vis.timeline);

    function brushed() {
        var value = vis.brush.extent()[0];

        if (d3.event.sourceEvent) { // not a programmatic event
            value = vis.timeScale.invert(d3.mouse(this)[0]);
            vis.brush.extent([value, value]);
        }

        vis.handle.attr("x", timeScale(value));
        vis.handle.select('text').text(vis.date_format(value));
    }

    // scale function
    vis.timeScale = d3.time.scale()
        .domain([new Date('2016-05-01'), new Date('2016-05-08')])
        .range([vis.padding, vis.width - vis.padding])
        .clamp(true);


    // initial value
    var startValue = vis.timeScale(new Date('2016-05-01'));
    startingValue = new Date('2016-05-01');

    // defines brush
    vis.brush = d3.svg.brush()
        .x(vis.timeScale)
        .extent([startingValue, startingValue])
        .on("brush", brushed);

    // date format for the timeline axis
    vis.date_format = d3.time.format('%a %I%p');

    // get the current day of the week and hour
    var curr_day = Math.floor(vis.hour / 24);
    var curr_hour = vis.hour % 24;

    // create SVG for timeline
    vis.timelineSVG = d3.select("#truck-timeline").append("svg")
        .attr('height', vis.timelineHeight)
        .attr("width", vis.width);

    // create axis for timeline
    vis.timelineSVG.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + vis.timelineHeight / 2 + ")")
        .call(d3.svg.axis()
            .scale(vis.timeScale)
            .orient("top")
            .tickFormat(function(){
                return vis.date_format(new Date(2016, 4, curr_day + 1, curr_hour, 0, 0, 0));
            })
            .tickSize(0)
            .tickPadding(12)
            .tickValues([vis.timeScale.domain()[0],
                vis.date_format(new Date(2016, 4, curr_day + 2, curr_hour, 0, 0, 0)),
                vis.date_format(new Date(2016, 4, curr_day + 3, curr_hour, 0, 0, 0)),
                vis.date_format(new Date(2016, 4, curr_day + 4, curr_hour, 0, 0, 0)),
                vis.date_format(new Date(2016, 4, curr_day + 5, curr_hour, 0, 0, 0)),
                vis.date_format(new Date(2016, 4, curr_day + 6, curr_hour, 0, 0, 0)),
                //vis.date_format(new Date(2016, 4, curr_day + 7, curr_hour, 0, 0, 0)
                vis.timeScale.domain()[1]]))
        //)
        .select(".domain")
        .select(function() {
            console.log(this);
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "halo");

    // instantiate slider
    vis.slider = vis.timelineSVG.append("g")
        .attr("class", "slider")
        .call(vis.brush);

    vis.slider.selectAll(".extent,.resize")
        .remove();

    //vis.slider.select(".background")
    //    .attr("height", 100);

    vis.handle = vis.slider.append("image")
        .attr("class", "handle")
        .attr("xlink:href", "img/truck3.png")
        .attr("transform", "translate(0," + (vis.timelineHeight / 2) + ")")
        .attr("x",vis.timeScale(startingValue))
        //.attr("y",)
        .attr("width", "40")
        .attr("height", "40");


    //slider
    //    .call(brush.event)
    //    .transition()
    //    .duration(750)
    //    .call(brush.extent([]))

    vis.handle.append('text')
        .text(startingValue)
        .attr("transform", "translate(" + (-18) + " ," + (vis.timelineHeight / 2 - 25) + ")");


    // create map
    vis.map = L.map(vis.parentElement).setView(vis.mapPosition, 13);

    // images
    L.Icon.Default.imagePath = "img";

    // tile layer
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>contributors'
    }).addTo(vis.map);

    // black and white background
    L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abcd',
        minZoom: 0,
        maxZoom: 20,
        ext: 'png'}).addTo(vis.map);

    // add a legend to the map
    vis.legend = L.control({position: 'topleft'});

    vis.legend.onAdd = function(map) {
        var div = L.DomUtil.create('div', 'info truck-legend'),
            status = ["yellow", "black"],
            labels = ["open", "closed"];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < status.length; i++) {
            div.innerHTML +=
                '<i style="background:' + status[i] + '"></i> ' +
                labels[i] + '<br>';
        }

        return div;
    };

    vis.legend.addTo(vis.map);

    // we will be appending the SVG to the Leaflet map pane
    // g (group) element will be inside the svg
    vis.svg = d3.select(vis.map.getPanes().overlayPane).append("svg");

    // if you don't include the leaflet-zoom-hide when a
    // user zooms in or out you will still see the phantom
     // original SVG
    vis.g = vis.svg.append("g").attr("class", "leaflet-zoom-hide");

    // Setting the size and location of the overall SVG container
    vis.svg.attr("width", 2000)
        .attr("height", 2000);
    //.style("left", topLeft[0] - 50 + "px")
    //.style("top", topLeft[1] - 50 + "px");

    // Define the div for the tooltip
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // draw circles for each truck
    vis.trucks = vis.svg.selectAll(".circle")
        .data(vis.timeTable)
        .enter()
        .append('circle')
        .attr('class', 'circle')
        .attr('r', vis.origTruckSize)
        .attr('cx', function(d){
            var position = d[vis.hour];
            return vis.map.latLngToLayerPoint(new L.LatLng(position[0], position[1]))['x'];
        })
        .attr('cy', function(d){
            var position = d[vis.hour];
            return vis.map.latLngToLayerPoint(new L.LatLng(position[0], position[1]))['y'];
        })
        .attr('fill', function(d){
            var info = d[vis.hour];
            if (info[2] == 1){
                return vis.openTruckColor;
            }
            else {
                return vis.closeTruckColor;
            }
        })
        .attr('stroke', 'black')
        .attr('opacity', function(d){
            var info = d[vis.hour];
            if (info[2] == 1){
                return vis.hoverTruckOpacity;
            }
            else {
                return vis.origTruckOpacity;
            }
        })
        .on('mouseover', function(d) {

            d3.select(this)
                .attr("r", vis.hoverTruckSize)
                .style("fill", vis.hoverTruckColor)
                .attr('opacity', vis.hoverTruckOpacity)
                .attr('stroke-width', vis.hoverTruckBorder);

            var truck_id = vis.index_to_truck[vis.timeTable.indexOf(d).toString()];

            var truck = vis.truckData[truck_id.toString()];

            // MAKE TOOLTIP APPEAR
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div	.html("Name: " + truck.info.name + "<br/> <br/>" + "Cold Truck: " + truck.info.cold_truck + "<br/><br/>" + "Description: " + truck.info.desc)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on('mouseout', function(d) {

            d3.select(this)
                .attr("r", vis.origTruckSize)
                .style("fill", function(d) {
                    console.log(d[vis.hour]);
                    if (d[vis.hour][2] == 1) {
                        return vis.openTruckColor;
                    }
                    else { return vis.closeTruckColor; }
                })
                .attr("opacity", function(d){
                    if (d[vis.hour][2] == 1) {
                        return vis.hoverTruckOpacity;
                    }
                    else { return vis.origTruckOpacity; }
                })
                .attr("stroke-width", vis.origTruckBorder);

            //TOOLTIP DISAPPEARS
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });

    vis.map.on("viewreset", function(){
        vis.trucks
            .attr('cx', function(d){
                var position = d[vis.hour];
                return vis.map.latLngToLayerPoint(new L.LatLng(position[0], position[1]))['x'];
            })
            .attr('cy', function(d){
                var position = d[vis.hour];
                return vis.map.latLngToLayerPoint(new L.LatLng(position[0], position[1]))['y'];
            })
    });

    vis.animateTrucks();

};

TruckMap.prototype.updateTrucks = function(){

    var vis = this;

    d3.selectAll('.circle')
        .transition()  //select all the trucks and prepare for a transition to new values
        .duration(750)  // give it a smooth time period for the transition
        .attr('fill', function(d){
            var info = d[vis.hour];
            if (info[2] == 1){
                return vis.openTruckColor;
            }
            else {
                return vis.closeTruckColor;
            }
        })
        .attr('opacity', function(d){
            var info = d[vis.hour];
            if (info[2] == 1){
                return vis.hoverTruckOpacity;
            }
            else {
                return vis.origTruckOpacity;
            }
        })
};


//d3.select('#slider3').call(d3.slider()
//    .axis(true).min(minDate).max(maxDate)
//    .on("slide", function(evt, value) {
//        sliderDate = moment(value,"x").utc().format("YYYY-MM-DD");
//        newDataS = site_dataS.features.filter(function(d){
//
//            //sliderDate = moment(value,"x").utc().format("YYYY-MM-DD");
//            dataDate = d.properties.Date;
//            //dataDateStampS = moment(dataDate).unix();
//
//            if (dataDate == sliderDate) {
//                return dpS(dataDate);
//            }
//        });
//        displaySitesS(newDataS);
//    })
//);


TruckMap.prototype.updateTimeline = function(){
    var vis = this;

    var date_format = d3.time.format('%a %I%p');

    var curr_day = Math.floor(vis.hour / 24);
    var curr_hour = vis.hour % 24;


    console.log(date_format(new Date(2016, 4, curr_day + 1, curr_hour, 0, 0, 0)))


    vis.handle
        .transition()
        .attr("x", vis.timeScale(new Date(2016, 4, curr_day + 1, curr_hour, 0, 0, 0)));

    //d3.selectAll('.timeline-marker')
    //    .transition()
    //    .duration(1000)
    //    .attr("cx", vis.positionScale(vis.hour))

    //vis.timeline.value(vis.hour);
};

TruckMap.prototype.animateTrucks = function(){

    var vis = this;
    var timer;
    d3.select("#play")
        .on('click', function(){

            console.log(vis.playing);

            // if the map is currently playing
            if (vis.playing == false){
                timer = setInterval(function(){
                    if(vis.hour < 168){
                        vis.hour += 1;
                    }
                    else {
                        vis.hour = 0;
                    }
                    vis.updateTrucks();
                    vis.updateTimeline();
                    d3.select('#clock').html(vis.hour);  // update the clock
                }, 1000);

                d3.select(this).html('stop');  // change the button label to stop
                vis.playing = true;   // change the status of the animation
            }
            else {    // else if is currently playing
                clearInterval(timer);   // stop the animation by clearing the interval
                d3.select(this).html('play');   // change the button label to play
                vis.playing = false;   // change the status again
            }
        })
};


/*
 *  Data wrangling
 */

TruckMap.prototype.wrangleData = function() {
  var vis = this;

  // add a marker for San Francisco
  var city_center = L.marker(vis.mapPosition).addTo(vis.map);

  // Update the visualization
  vis.updateVis();
};


/*
 *  The drawing function
 */

TruckMap.prototype.updateVis = function() {

};
