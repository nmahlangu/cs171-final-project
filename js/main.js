// data stores
var restaurantData;
var boundaryData;
var geoBoundaryData;
var chloroplethData;

// variable for chloropleth instance
var chloropleth;

// start application by loading the allData
// loadData();

/**
 * Function to load all data
//  */
// function loadData() {
// 	d3.json("data/json/restaurant_data_formatted.json", function(error, restaurantData) {
// 		if (error) {
// 			throw error;
// 		}
// 		// Raw data
// 		restaurantData = restaurantData[0];
// 		console.log("Raw data");
// 		console.log(restaurantData);
// 	});
// }

queue()
	.defer(d3.json, "data/json/restaurant_data_formatted.json")
	.defer(d3.json, "data/topojson/sf_neighborhoods.json")
	.defer(d3.json, "data/geojson/sf_neighborhoods.geojson")
	.defer(d3.json, "data/json/chloropleth_data_formatted.json")

	.await(function(error, _restaurantData, _boundaryData, _geoBoundaryData, _chloroplethData) {
		if (error) {
			throw error;
		}

		console.log("restaurantData: ")
		console.log(_restaurantData);

		console.log("boundaryData: ");
		console.log(_boundaryData);

		console.log("geoBoundaryData: ");
		console.log(_geoBoundaryData);

		console.log("chloroplethData: ");
		console.log(_chloroplethData);

		restaurantData = _restaurantData;
		boundaryData = _boundaryData;
		geoBoundaryData = _geoBoundaryData;
		chloroplethData = _chloroplethData;

		createVis();
	});

/**
 * Function to instantiate the visualization
 */
function createVis() {
	chloropleth = new Chloropleth("chloropleth", restaurantData, boundaryData, geoBoundaryData, chloroplethData);
}