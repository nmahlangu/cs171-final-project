
/*
 *  StationMap - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _locationData    -- Array with coordinates for each food truck
 *  @param _restaurantData  -- Array with coordinates for each restaurant
 *  @param _mapPosition     -- Array with coordinates of city center
 */

HeatMap = function(_parentElement, _locationData, _restaurantData, _mapPosition) {
  this.parentElement = _parentElement;
  this.locationData = _locationData;
  this.restaurantData = _restaurantData;
  this.mapPosition = _mapPosition;

  this.initVis();
};


/*
 *  Initialize heat map
 */

HeatMap.prototype.initVis = function() {
  var vis = this;

  // create map
  vis.map = L.map(vis.parentElement).setView(vis.mapPosition, 13);

  // images
  L.Icon.Default.imagePath = "img";

  // tile layer
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>contributors'
  }).addTo(vis.map);

  // add heat later
  vis.heat = L.heatLayer(vis.locationData, {
    radius: 20,
    blur: 15,
    maxZoom: 17}).addTo(vis.map);

  // add event handler to dropdown
  vis.dropdown = document.getElementById("heatmap-dropdown");
  vis.dropdown.onchange = function() { vis.updateVis(); }

  vis.updateVis();

};

/*
 *  Update the visualization depending on dropdown value
 */

HeatMap.prototype.updateVis = function() {

  var vis = this;

  // get dropdown value
  var dropdownValue = $("#heatmap-dropdown").val();

  // remove current layer
  vis.map.removeLayer(vis.heat);

  // create layer for trucks or restaurants
  if (dropdownValue == "trucks") {
    vis.heat = L.heatLayer(vis.locationData, {
      radius: 20,
      blur: 15,
      maxZoom: 17}).addTo(vis.map);
  }
  else {
    vis.heat = L.heatLayer(vis.restaurantData, {
      radius: 20,
      blur: 20,
      maxZoom: 17}).addTo(vis.map);
  }

};
