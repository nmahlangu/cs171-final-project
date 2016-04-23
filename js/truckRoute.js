
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

    this.origTruckSize = 10;
    this.hoverTruckSize = 12;

    this.origTruckOpacity = 0.1;
    this.hoverTruckOpacity = 1.0;

    this.origTruckBorder = 1;
    this.hoverTruckBorder = 5;

    // width and height attributes
    this.width = 910;
    this.timelineHeight = 220;
    this.mapHeight = 350;
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

    function brushed() {
        var value = vis.brush.extent()[0];

        if (d3.event.sourceEvent) { // not a programmatic event
            value = vis.timeScale.invert(d3.mouse(this)[0]);
            vis.brush.extent([value, value]);
        }

        vis.handle.attr("x", timeScale(value));
        vis.handle.select('text').text(vis.dateFormat(value));
    }

    // scale function
    vis.timeScale = d3.time.scale()
        //.domain([new Date('2016-05-01'), new Date('2016-05-08')])
        .domain([new Date(2016, 4, 1), new Date(2016, 4, 8)])
        .range([vis.padding, vis.width-vis.padding])
        //.clamp(true);

    // initial value
    var startingValue = new Date(2016, 4, 1);
    //var startingValue = new Date('2016-05-01');
    var startValue = vis.timeScale(startingValue);

    // console.log(startingValue);

    // defines brush
    vis.brush = d3.svg.brush()
        .x(vis.timeScale)
        .extent([startingValue, startingValue])
        .on("brush", brushed);

    // date format for the timeline axis
    vis.dateFormat = d3.time.format('%a %I %p');

    // get the current day of the week and hour
    var curr_day = Math.floor(vis.hour / 24);
    var curr_hour = vis.hour % 24;

    // create SVG for timeline
    vis.timelineSVG = d3.select("#truck-timeline").append("svg")
        .attr('height', vis.timelineHeight)
        .attr("width", vis.width);

    // instantiate x-axis
    vis.timelineAxis = d3.svg.axis()
        .scale(vis.timeScale)
        .orient("bottom")
        .tickFormat(vis.dateFormat)
        .ticks(d3.time.hours, 24)
        .tickSize(10)
        .tickPadding(5);

    // create axis for timeline
    vis.timelineSVG.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (vis.timelineHeight / 2 + 20) +  ")")
        .call(vis.timelineAxis)
        //.select(".domain")
        //.select(function() {
        //    console.log(this);
        //    return this.parentNode.appendChild(this.cloneNode(true));
        //})
        //.attr("class", "halo")
        ;

    //vis.timelineSVG.selectAll("text")
        //.attr("transform", "rotate(90)")
        //.attr("transform", "translate(0,20")
        //.style("text-anchor", "start");

    // instantiate slider
    vis.slider = vis.timelineSVG.append("g")
        .attr("class", "slider")
        .call(vis.brush);

    vis.slider.selectAll(".extent,.resize")
        .remove();

    vis.slider.select(".background")
        .attr("height", 10);

    vis.handle = vis.slider.append("image")
        .attr("class", "handle")
        .attr("xlink:href", "img/truck3.png")
        .attr("transform", "translate(-50," + (vis.timelineHeight / 2 - 35) + ")")
        .attr("x",vis.timeScale(startingValue))
        //.attr("y",)
        .attr("width", "50")
        .attr("height", "50");

    vis.truckText = vis.slider.append('text')
        .text("Let's go!")
        .attr("x", vis.timeScale(startingValue) - vis.padding)
        .attr("y", vis.timelineHeight/2 - 40)
        ;

    // create map
    vis.map = L.map(vis.parentElement).setView(vis.mapPosition, 13);

    // images
    L.Icon.Default.imagePath = "img";

    // tile layer
    //L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    //  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>contributors'
    //}).addTo(vis.map);

    // black and white tile layer
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
            labels = ["Open", "Closed"];

        // add title to legend
        div.innerHTML = "<strong class='key-title'>Key</strong>";

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < status.length; i++) {
            div.innerHTML +=
                '<br><strong style="background:' + status[i] + '">' + "<br>" + labels[i] + '</strong><br><br><br>';
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
            if (info[2] > 0){
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
                .attr("fill", vis.hoverTruckColor)
                .attr('opacity', vis.hoverTruckOpacity)
                .attr('stroke-width', vis.hoverTruckBorder);

            // grab truck ID from index table
            var truckId = vis.index_to_truck[vis.timeTable.indexOf(d).toString()];

            var truck = vis.truckData[truckId.toString()];

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
                .attr("fill", function(d) {
                    try {
                        if (d[vis.hour][2] > 0) {
                            return vis.openTruckColor;
                        }
                        else { return vis.closeTruckColor; }
                    }
                    catch (err) {
                        console.log("TRUCK NOT FOUND");
                        return vis.closeTruckColor;
                    }
                })
                .attr("opacity", function(d){
                    try {
                        if (d[vis.hour][2] > 0) {
                            return vis.hoverTruckOpacity;
                        }
                        else { return vis.origTruckOpacity; }
                    }
                    catch (err) {
                        return vis.origTruckOpacity;
                    }
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

    console.log("Current Hour");
    console.log(vis.hour);

    d3.selectAll('.circle')
        .transition()  //select all the trucks and prepare for a transition to new values
        .duration(750)  // give it a smooth time period for the transition
        .attr('fill', function(d){
            var info = d[vis.hour];
            try {
                if (info[2] > 0){
                    return vis.openTruckColor;
                }
                else {
                    return vis.closeTruckColor;
                }
            }
            catch (error) {
                console.log("ANOTHER ERROR")
                return vis.closeTruckColor;
            }

        })
        .attr('opacity', function(d){
            var info = d[vis.hour];

            try{
                if (info[2] > 0){
                    return vis.hoverTruckOpacity;
                }
                else {
                    return vis.origTruckOpacity;
                }
            }
            catch(err){
                console.log(err);
                return vis.origTruckOpacity;
            }

        })
        ;

};

TruckMap.prototype.updateTimeline = function(){
    var vis = this;

    var curr_day = Math.floor(vis.hour / 24);
    var curr_hour = vis.hour % 24;

    var currTime = new Date(2016, 4, curr_day + 1, curr_hour, 0, 0, 0);

    vis.handle
        .transition()
        .duration(1000)
        .attr("x", vis.timeScale(currTime));

    vis.truckText
        .text(function(){
            var mealTime = Math.floor(vis.hour/24) == 12;
            if (mealTime == 12){
                return "LUNCH TIME!"
            }
            else if (mealTime == 18){
                return "DINNER TIME!"
            }
        })
        .attr("x", vis.timeScale(currTime))
        ;

};

TruckMap.prototype.animateTrucks = function(){

    var vis = this;

    var timer;

    var timeFormat = d3.time.format("%A %I %p");

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

                    var curr_day = Math.floor(vis.hour / 24);
                    var curr_hour = vis.hour % 24;
                    var currTime = new Date(2016, 4, curr_day + 1, curr_hour, 0, 0, 0);

                    d3.select('#clock').html(timeFormat(currTime));  // update the clock
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
