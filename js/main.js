// chloropleth
var chloropleth;

var restaurantData;
var boundaryData;
var geoBoundaryData;
var chloroplethData;
var sfCoordinates = [37.761655, -122.442760];

// animation
var truckMap;

var timeTable = [];
var truckLocations = [];

queue()
	.defer(d3.json, "data/json/restaurant_data_formatted.json")
	.defer(d3.json, "data/geojson/sf_neighborhoods.geojson")
	.defer(d3.json, "data/json/chloropleth_data_formatted.json")
	.defer(d3.csv, 'data/csv/time_table.csv')

	.await(function(error, _restaurantData, _geoBoundaryData, _chloroplethData, _timeData) {
		if (error) {
			throw error;
		}

		// debug
		console.log("restaurantData: ")
		console.log(_restaurantData);
		console.log("geoBoundaryData: ");
		console.log(_geoBoundaryData);
		console.log("chloroplethData: ");
		console.log(_chloroplethData);
		console.log("timeData: ");
		console.log(_timeData);

		//****************************** Chloropleth ******************************//
		restaurantData = _restaurantData[0];
		geoBoundaryData = _geoBoundaryData;
		chloroplethData = _chloroplethData;

		//******************************* Animation *******************************//
	   	for (var i in _timeData) {
	       	var truckTimes = _timeData[i];
	       	var truckTimesList = [];
	       	for (var hour = 1; hour <= 168; hour++){
	          	truckTimesList.push(JSON.parse(truckTimes[hour.toString()]))
	       	}
	      	timeTable.push(truckTimesList);
	   	}
	    // create list of truck locations for heat map
	    for (var i = 0; i < timeTable.length; i++) {
	        truckLocations.push([timeTable[i][0][0], timeTable[i][0][1], 1.0]);
	    }

	    //****************************** Heatmap ******************************//



	    // create the visualization
	    createVis();
    });

/**
 * Function to instantiate the visualization
 */
function createVis() {
	chloropleth = new Chloropleth("chloropleth", sfCoordinates, restaurantData, geoBoundaryData, chloroplethData);
	truckMap = new TruckMap("truck-route-map", timeTable, [37.774929, -122.419416]);
    heatMap = new HeatMap("heat-map", truckLocations, [37.774929, -122.419416]);
}