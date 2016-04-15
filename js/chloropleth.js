/**
 *  StationMap - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _restaurantData  -- Business, inspection, and violation data for all businesses
 *  @param _boundaryData    -- Topojson data for SF boundaries
 */
Chloropleth = function(_parentElement, _visCenter, _restaurantData, _geoBoundaryData, _chloroplethData) {
	this.parentElement = _parentElement;
	this.restaurantData = _restaurantData;
	this.geoBoundaryData = _geoBoundaryData;
	this.chloroplethData = _chloroplethData;
	this.center = _visCenter;

	this.initVis();
}

/**
 * Initialize chloropleth map
 */
Chloropleth.prototype.initVis = function() {
	var vis = this;

    // color scales
	vis.colorScale = d3.scale.quantize()
		.range(colorbrewer.Reds[9]);

	// set domain to be inspection scores
	var colorScaleDomain = Object.keys(vis.chloroplethData).reduce(function(prev, key) {
		return prev.concat(vis.chloroplethData[key].avg_inspection_score);
	}, []);
	colorScaleDomain = colorScaleDomain.sort(function(a,b) { return a - b; });
	vis.colorScale
		.domain([colorScaleDomain[0], colorScaleDomain[colorScaleDomain.length - 1]]);

 	// create map
 	vis.map = L.map(vis.parentElement).setView(vis.center, 13);

 	// images
 	L.Icon.Default.imagePath = "img";

    // tile layer
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>contributors'
    }).addTo(vis.map);

    // add default geo-json layer
    vis.neighorhoods = L.geoJson(vis.geoBoundaryData, {
      style: function(f) {
      	var inspectionScore = vis.chloroplethData[f.properties.name].avg_inspection_score;
      	var colorShade = vis.colorScale(inspectionScore);
      	return {color: colorShade};
      },
      weight: 3,
      fillOpacity: 0.6
    }).addTo(vis.map);

    // add event handler to dropdown
    vis.dropdown = document.getElementById("chloropleth-dropdown");
    vis.dropdown.onchange = function() {
    	vis.updateChloropleth();
    }

    // add legend
    vis.legend = L.control({position: 'bottomleft'});
    vis.legend.onAdd = function(map) {
    	var div = L.DomUtil.create('div', 'info legend');
    	var base = vis.colorScale.domain()[0];
    	var diff = vis.colorScale.domain()[1] - vis.colorScale.domain()[0];
    	var categories = [];
    	var mults = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
    	for (var i = 0; i < 9; i++) {
    		categories.push(base + (diff * mults[i]));
    	}
	    for (var i = 0; i < categories.length; i++) {
	        div.innerHTML += '<i style="background: ' + vis.colorScale(categories[i]) + '"></i> ' + categories[i].toFixed(2) + "</br>";
	    }
	    return div;
    };
    vis.legend.addTo(vis.map);
}

Chloropleth.prototype.updateChloropleth = function() {
	var vis = this;

	// get dropdown value
	var dropdownValue = $("#chloropleth-dropdown").val();

	// update color scale domain
	var colorScaleDomain = Object.keys(vis.chloroplethData).reduce(function(prev, key) {
		switch(dropdownValue) {
			case "inspections":
				return prev.concat(vis.chloroplethData[key].avg_inspection_score);
				break;
			case "violations":
				return prev.concat(vis.chloroplethData[key].avg_violation_score);
				break;
		}
	}, []);
	colorScaleDomain = colorScaleDomain.sort(function(a,b) { return a - b; });
	vis.colorScale
		.domain([colorScaleDomain[0], colorScaleDomain[colorScaleDomain.length - 1]]);

	// remove previous geo-json layer
	vis.map.removeLayer(vis.neighorhoods);
	
	// add new geo-json layer
    vis.neighorhoods = L.geoJson(vis.geoBoundaryData, {
      style: function(f) {
      	var score;
      	switch(dropdownValue) {
      		case "inspections":
      			score = vis.chloroplethData[f.properties.name].avg_inspection_score;
      			break;
      		case "violations":
      			score = vis.chloroplethData[f.properties.name].avg_violation_score;
      			break;
      	}
      	var colorShade = vis.colorScale(score);
      	return {color: colorShade};
      },
      weight: 3,
      fillOpacity: 0.6
    }).addTo(vis.map);

    // remove previous legend
    vis.map.removeControl(vis.legend);

    // add new legend
    vis.legend = L.control({position: 'bottomleft'});
    vis.legend.onAdd = function(map) {
    	var div = L.DomUtil.create('div', 'info legend');

    	var base = vis.colorScale.domain()[0];
    	var diff = vis.colorScale.domain()[1] - vis.colorScale.domain()[0];
    	var categories = [];
    	var mults = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];

    	for (var i = 0; i < 9; i++) {
    		categories.push(base + (diff * mults[i]));
    	}
	    for (var i = 0; i < categories.length; i++) {
	        div.innerHTML += '<i style="background: ' + vis.colorScale(categories[i]) + '"></i> ' + categories[i].toFixed(2) + "</br>";
	    }
	    return div;
    };
    vis.legend.addTo(vis.map);
}