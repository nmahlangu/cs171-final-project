// data stores
var restaurantData;
var boundaryData;

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

	.await(function(error, _restaurantData, _boundaryData) {
		if (error) {
			throw error;
		}

		console.log("restaurantData: ")
		console.log(_restaurantData);

		console.log("boundaryData: ");
		console.log(_boundaryData);

		restaurantData = _restaurantData;
		boundaryData = _boundaryData;

		createVis();
	});

/**
 * Function to instantiate the visualization
 */
function createVis() {
	chloropleth = new Chloropleth("chloropleth", restaurantData, boundaryData);
}