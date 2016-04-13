/**
 *  StationMap - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _restaurantData  -- Business, inspection, and violation data for all businesses
 *  @param _boundaryData    -- Topojson data for SF boundaries
 */
Chloropleth = function(_parentElement, _restaurantData, _boundaryData) {
	this.parentElement = _parentElement;
	this.restaurantData = _restaurantData;
	this.boundaryData = _boundaryData;

	this.initVis();
}


/**
 * Initialize chloropleth map
 */
Chloropleth.prototype.initVis = function() {
	var vis = this;

	// svg drawing area
	var margin = {top: 40, right: 40, bottom: 40, left: 40};
	var width  = 1000 - margin.left - margin.right;
	var height = 600 - margin.top - margin.bottom;
	vis.svg = d3.select("#" + vis.parentElement).append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
		.append("g")
    	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // make projection

    // make path

    // apply paths
    
    // vis.svg.append("path")
    // 	.datum(topojson.feature(vis.boundaryData, vis.boundaryData.objects));
}