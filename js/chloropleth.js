/**
 *  StationMap - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _restaurantData  -- Business, inspection, and violation data for all businesses
 *  @param _boundaryData    -- Topojson data for SF boundaries
 */
Chloropleth = function(_parentElement, _restaurantData, _boundaryData, _geoBoundaryData) {
	this.parentElement = _parentElement;
	this.restaurantData = _restaurantData;
	this.boundaryData = _boundaryData;
	this.geoBoundaryData = _geoBoundaryData;

	this.initVis();
}

/**
 * Initialize chloropleth map
 */
Chloropleth.prototype.initVis = function() {
	var vis = this;

	// // svg drawing area
	var margin = {top: 40, right: 40, bottom: 40, left: 40};
	var width  = 1300 - margin.left - margin.right;
	var height = 700 - margin.top - margin.bottom;
	vis.svg = d3.select("#" + vis.parentElement).append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
		.append("g")
    	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // make projection
    // vis.projection = d3.geo.albers()
    // 	.center([37.761655, -122.442760])
    // 	.scale(10000)
    // 	.translate([600000,11500]);

    vis.projection = d3.geo.albers();

    // make path
    vis.path = d3.geo.path()
    	.projection(vis.projection);

    vis.paths = vis.svg.selectAll("path")
    	.data(topojson.feature(vis.boundaryData, vis.boundaryData.objects.collection).features);

    vis.paths
    	.enter()
    	.append("path")
    	.attr("d", vis.path)
    	.style("fill", function(d) { return "red" });

    // apply paths
    // vis.svg.append("path")
    // 	.datum(topojson.feature(vis.boundaryData, vis.boundaryData.objects.collection).features);

 	// /////////////////////// ATTEMPT #2 ////////////////////////////
 	// // create map
 	// // vis.map = L.map(vis.parentElement).setView([37.761655, -122.442760], 13);
 	// vis.map = L.map(vis.parentElement).setView([37.761655, -122.442760], 13);

 	// // images
 	// L.Icon.Default.imagePath = "img";

  //   // tile layer
  //   L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  //   	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>contributors'
  //   }).addTo(vis.map);

  //   // geo-json data
  //   vis.neighorhoods = L.geoJson(vis.geoBoundaryData, {
  //     style: function(f) { return {color: "red"} },
  //     weight: 3,
  //     fillOpacity: 0.2
  //   }).addTo(vis.map);

}

Chloropleth.prototype.updateVis = function() {

}