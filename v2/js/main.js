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
var truckData;
var truck_to_index;
var index_to_truck;

queue()
	.defer(d3.json, "data/json/restaurant_data_formatted.json")
	.defer(d3.json, "data/geojson/sf_neighborhoods.geojson")
	.defer(d3.json, "data/json/chloropleth_data_formatted.json")
	.defer(d3.json, "data/json/truck_data.json")
	.defer(d3.json, "data/json/truck_to_index.json")
	.defer(d3.json, "data/json/index_to_truck.json")
	.defer(d3.csv, 'data/csv/time_table.csv')

	.await(function(error, _restaurantData, _geoBoundaryData, _chloroplethData, _truckData, _truck_to_index, _index_to_truck, _timeData) {
		if (error) {
			throw error;
		}

		// debug
		console.log("restaurantData: ");
		console.log(_restaurantData);
		console.log("geoBoundaryData: ");
		console.log(_geoBoundaryData);
		console.log("chloroplethData: ");
		console.log(_chloroplethData);
		console.log("truckData: ");
		console.log(_truckData);
		console.log("truck_to_index: ");
		console.log(_truck_to_index);
		console.log("index_to_truck: ");
		console.log(_index_to_truck);
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

		truckData = _truckData;
		truck_to_index = _truck_to_index;
		index_to_truck = _index_to_truck;

	    //****************************** Heatmap ******************************//

	    // create the visualization
	    createVis();
    });

/**
 * Function to instantiate the visualization
 */
function createVis() {
	chloropleth = new Chloropleth("chloropleth", sfCoordinates, restaurantData, geoBoundaryData, chloroplethData);
	truckMap = new TruckMap("truck-route-map", timeTable, truckData, truck_to_index, index_to_truck, sfCoordinates);
 //    heatMap = new HeatMap("heat-map", truckLocations, [37.774929, -122.419416]);
}