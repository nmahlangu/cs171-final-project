// data stores
var restaurantData;
var boundaryData;
var geoBoundaryData;
var chloroplethData;
var sfCoordinates = [37.761655, -122.442760];

// variable for chloropleth instance
var chloropleth;

queue()
	.defer(d3.json, "data/json/restaurant_data_formatted.json")
	.defer(d3.json, "data/geojson/sf_neighborhoods.geojson")
	.defer(d3.json, "data/json/chloropleth_data_formatted.json")

	.await(function(error, _restaurantData, _geoBoundaryData, _chloroplethData) {
		if (error) {
			throw error;
		}

		console.log("restaurantData: ")
		console.log(_restaurantData);

		console.log("geoBoundaryData: ");
		console.log(_geoBoundaryData);

		console.log("chloroplethData: ");
		console.log(_chloroplethData);

		restaurantData = _restaurantData;
		geoBoundaryData = _geoBoundaryData;
		chloroplethData = _chloroplethData;

		createVis();
	});

/**
 * Function to instantiate the visualization
 */
function createVis() {
	chloropleth = new Chloropleth("chloropleth", sfCoordinates, restaurantData, 
		geoBoundaryData, chloroplethData);
}