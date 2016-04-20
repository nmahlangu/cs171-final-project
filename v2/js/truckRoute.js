
/*
 *  TruckMap - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array with all truck locations and opening indicator, indexed by hour
 */

TruckMap = function(_parentElement, _timeTable, _mapPosition) {
  this.parentElement = _parentElement;
  this.timeTable = _timeTable;
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
        });


    //vis.map.on("viewreset", reset);


    vis.animateTrucks();


    //reset();
    //transition();

    //function reset() {
  //    var bounds = d3path.bounds(data),
  //        topLeft = bounds[0],
  //        bottomRight = bounds[1];
  //
  //
  //    text.attr("transform",
  //        function(d) {
  //          return "translate(" +
  //              applyLatLngToLayer(d).x + "," +
  //              applyLatLngToLayer(d).y + ")";
  //        });
  //
  //    begend.attr("transform",
  //        function(d) {
  //          return "translate(" +
  //              applyLatLngToLayer(d).x + "," +
  //              applyLatLngToLayer(d).y + ")";
  //        });
  //
  //    vis.trucks
  //        .attr("transform",
  //        function(d) {
  //          return "translate(" +
  //              applyLatLngToLayer(d).x + "," +
  //              applyLatLngToLayer(d).y + ")";
  //        });

      //vis.trucks.attr("transform",
      //    function() {
      //      //var position = vis.timeTable[0]
      //      return "translate(" +
      //          vis.map.latLngToLayerPoint(new L.LatLng(y, x)).x + "," +
      //          vis.map.latLngToLayerPoint(new L.LatLng(y, x)).y + ")";
      //    });
  //
  //    svg.attr("width", bottomRight[0] - topLeft[0] + 120)
  //        .attr("height", bottomRight[1] - topLeft[1] + 120)
  //        .style("left", topLeft[0] - 50 + "px")
  //        .style("top", topLeft[1] - 50 + "px");
  //
  //    linePath.attr("d", toLine)
  //    // ptPath.attr("d", d3path);
  //    g.attr("transform", "translate(" + (-topLeft[0] + 50) + "," + (-topLeft[1] + 50) + ")");
  //
  //  }
  //
  //  function transition() {
  //    linePath.transition()
  //        .duration(7500)
  //        .attrTween("stroke-dasharray", tweenDash)
  //        .each("end", function() {
  //          d3.select(this).call(transition);// infinite loop
  //        });
  //  }

  //
  //  function projectPoint(x, y) {
  //    var point = vis.map.latLngToLayerPoint(new L.LatLng(y, x));
  //    this.stream.point(point.x, point.y);
  //  }
  //
  //  });
  //
  //function applyLatLngToLayer(d) {
  //  var y = d.geometry.coordinates[1]
  //  var x = d.geometry.coordinates[0]
  //  return vis.map.latLngToLayerPoint(new L.LatLng(y, x))
  //
  //
  //}

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
