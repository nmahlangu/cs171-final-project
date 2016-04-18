
/*
 *  StationMap - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array with all stations of the bike-sharing network
 */

HeatMap = function(_parentElement, _locationData, _mapPosition) {
  this.parentElement = _parentElement;
  this.locationData = _locationData;
  this.mapPosition = _mapPosition;

  this.initVis();
};

/*
 * Helper function for styling lines
 */

/*
 *  Initialize station map
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

  vis.heat = L.heatLayer(vis.locationData, {
    radius: 20,
    blur: 15,
    maxZoom: 17}).addTo(vis.map);
  
  vis.wrangleData();
};


/*
 *  Data wrangling
 */

HeatMap.prototype.wrangleData = function() {
  var vis = this;

  // add a marker for Maxwell Dworkin
  var maxwellDworkin = L.marker(vis.mapPosition).addTo(vis.map);

  // Update the visualization
  vis.updateVis();
};


/*
 *  The drawing function
 */

HeatMap.prototype.updateVis = function() {

};
