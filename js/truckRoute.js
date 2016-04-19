
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

    // create map
    vis.map = L.map(vis.parentElement).setView(vis.mapPosition, 13);

    // images
    L.Icon.Default.imagePath = "img";

    // tile layer
    //L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    //  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>contributors'
    //}).addTo(vis.map);

    // black and white background
    L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abcd',
        minZoom: 0,
        maxZoom: 20,
        ext: 'png'}).addTo(vis.map);

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
        .attr('r', 5)
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
                return 'black';
            }
            else {
                return 'yellow';
            }
        })
        .attr('stroke', 'black')
        .attr('opacity', function(d){
            var info = d[vis.hour];
            if (info[2] == 1){
                return 1.0;
            }
            else {
                return 0.3;
            }
        })
        .on('mouseover', function(d) {

            var truck_id = vis.index_to_truck[vis.timeTable.indexOf(d).toString()];

            var truck = vis.truckData[truck_id.toString()];

            div.transition()
                .duration(200)
                .style("opacity", .9);
            div	.html(truck.info.name + "<br/>" + "Cold Truck:" + truck.info.cold_truck + "<br/>" + truck.info.desc)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on('mouseout', function(d) {
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
                return 'black'
            }
            else {
                return 'yellow'
            }
        })
        .attr('opacity', function(d){
            var info = d[vis.hour];
            if (info[2] == 1){
                return 1.0
            }
            else {
                return 0.3
            }
        })
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
