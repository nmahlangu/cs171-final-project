var allData = [];

// variable for chloropleth instance
var chloropleth;

// start application by loading the allData
loadData();

/**
 * Function to load all data
 */
function loadData() {
	d3.json("data/json/restaurant_data_formatted.json", function(error, restaurantData) {
		if (error) {
			throw error;
		}

		console.log(restaurantData);
	});
}

/**
 * Function to instantiate the visualization
 */
function createVis() {

}