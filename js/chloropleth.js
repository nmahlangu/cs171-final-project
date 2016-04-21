/**
 *  Chloropleth - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _restaurantData  -- Business, inspection, and violation data for all businesses
 *  @param _geoBoundaryData -- Topojson data for SF boundaries
 *  @param _chloroplethData -- Shading values for the chloropleth
 */
Chloropleth = function(_parentElement, _visCenter, _restaurantData, _geoBoundaryData, _chloroplethData) {
	this.parentElement = _parentElement;
	this.restaurantData = _restaurantData;
	this.geoBoundaryData = _geoBoundaryData;
	this.chloroplethData = _chloroplethData;
	this.center = _visCenter;

  // initialize visualization
  this.initVis();
}

/**
 * Return all inspection data for a specific neighborhood
 * @param:string: neighborhood -- a neighborhood name
 */
Chloropleth.prototype.getAllInspections = function(neighborhood) {
	var vis = this;

	var results = [];
	Object.keys(vis.restaurantData).forEach(function(business_id) {
		var business_data = vis.restaurantData[business_id]["business_data"];
		if (business_data["neighborhood"] == neighborhood) {
			var inspection_data = vis.restaurantData[business_id]["inspection_data"];
			inspection_data = inspection_data.sort(function(a,b) { return a.date - b.date; });
			inspection_data = inspection_data.filter(function(a) { return a.Score != null });
			if (inspection_data.length > 0) {
				obj = inspection_data[0];
				obj["name"] = business_data["name"];
				results.push(inspection_data[0]);
			}
		}

	});
	return results;
}

/**
 * Return all violation data for each specific neighborhood
 * @param:string: neighborhood -- a neighborhood name
 */
Chloropleth.prototype.getAllViolations = function(neighborhood) {
  var vis = this;

  var results = [];
  Object.keys(vis.restaurantData).forEach(function(business_id) {
    var business_data = vis.restaurantData[business_id]["business_data"];
    if (business_data["neighborhood"] == neighborhood) {
      var violation_data = vis.restaurantData[business_id]["violation_data"];
      if (violation_data.length > 0) {
        violation_data = violation_data.sort(function(a,b) { return a.date - b.date; });
        violation_data.forEach(function(d) {
          d["name"] = business_data["name"];
          results.push(d);
        });
      }
    }
  });
  return results;
}

/**
 * Set the domain of the chloropleth's color scale
 * @param:string: dropdownValue -- value of the drop down above the visualization
 */
Chloropleth.prototype.setColorScaleDomain = function(dropdownValue) {
  var vis = this;

  // update the domain of the chloropleth's color scale
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
}

/**
 * Update a neighborhood's html
 * @param:object: feature       -- Leaflet feature object
 * @param:object: layer         -- Leaflet layer object
 * @param:string: dropdownValue -- value of the drop down above the visualization
 */
Chloropleth.prototype.updateTooltipInfo = function(feature, layer, dropdownValue) {
  var vis = this;

  // change table info on click
  layer.on('click', function(e) {
    var html = "";

    // update neighborhood being shown
    var neighbodhoodDiv = $("#neighborhood_being_show");
    neighbodhoodDiv.html(feature.properties.name);

    // header
    var div = $("#chloropleth-tooltip-box");
    // html += "<h1 class='chloropleth-tooltip-header'>" + feature.properties.name + "</h1>";

    // start table
    html += "<table class='CSSTableGenerator'>";

    switch(dropdownValue) {
      // add inspection data
      case "inspections":
        html += "<tr>";
        html += "<td style='width: 280px'>" + "Restaurant Name" + "</td>";
        html += "<td style='width: 280px'>" + "Date" + "</td>";
        html += "<td style='width: 280px'>" + "Inspection Type" + "</td>";
        html += "<td >" + "Inspection Score" + "</td>";
        html += "</tr>";

        var inspections = vis.getAllInspections(feature.properties.name);
        inspections.forEach(function(d) {
          html += "<tr>";
          html += "<td>" + d["name"] + "</td>";
          html += "<td>" + d["date"] + "</td>";
          html += "<td>" + d["type"] + "</td>";
          html += "<td>" + d["Score"] + "</td>";
          html += "</tr>";
        });
        break;

      // add violation data
      case "violations":
        html += "<tr>";
        html += "<td>" + "Restaurant Name" + "</td>";
        html += "<td>" + "Violation Risk Level" + "</td>";
        html += "</tr>";

        var violations = vis.getAllViolations(feature.properties.name);
        violations.forEach(function(d) {
          html += "<tr>";
          html += "<td>" + d["name"] + "</td>";
          html += "<td>" + d["risk_category"] + "</td>";
        });
        break;
    }

    // close table
    html += "</table>";

    // update displayed html
    div.html(html);
  });
}

/**
 * Create a legend for the map
 */
Chloropleth.prototype.updateMapLegend = function() {
  var vis = this;

  // remove old legend, if it exists
  if (vis.legend) {
    vis.map.removeControl(vis.legend);
  }

  // create new legend
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

  // add new legend
  vis.legend.addTo(vis.map);
}

/**
 * Initialize chloropleth map
 */
Chloropleth.prototype.initVis = function() {
	var vis = this;

  // color scale
	vis.colorScale = d3.scale.quantize()
		.range(colorbrewer.Reds[9]);

  // set domain of the color scale
  vis.setColorScaleDomain("inspections");

 	// create map
 	vis.map = L.map(vis.parentElement).setView(vis.center, 13);

 	// images
 	L.Icon.Default.imagePath = "img";

  // tile layer
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>contributors'
  }).addTo(vis.map);

<<<<<<< HEAD
    // add default geo-json layer
    vis.neighorhoods = L.geoJson(vis.geoBoundaryData, {
     	style: function(f) {
      		var inspectionScore = vis.chloroplethData[f.properties.name].avg_inspection_score;
      		var colorShade = vis.colorScale(inspectionScore);
      		return {color: colorShade};
      	},
      	weight: 3,
      	fillOpacity: 0.6,
        onEachFeature: function (feature, layer) {
        	layer.on('mouseover', function(e) {
        		var html = "";

        		// header
        		var div = $("#chloropleth-tooltip-box");
        		html += "<h1 class='chloropleth-tooltip-header'>" + feature.properties.name + "</h1>";

        		// start table
        		html += "<table>";

        		// inspections
        		var inspections = vis.getAllInspections(feature.properties.name);
        		inspections.forEach(function(d) {
        			html += "<tr>";
        			html += "<td>" + d["name"] + "</td>";
        			html += "<td>" + d["Score"] + "</td>";
        			html += "</tr>";
        		});

        		// close table
        		html += "</table>";

        		div.html(html);
        	});
      	}
    }).addTo(vis.map);
=======
  // add default geo-json layer
  vis.neighorhoods = L.geoJson(vis.geoBoundaryData, {
   	style: function(f) {
    		var inspectionScore = vis.chloroplethData[f.properties.name].avg_inspection_score;
    		var colorShade = vis.colorScale(inspectionScore);
    		return {color: colorShade};
    	},
    	weight: 3,
    	fillOpacity: 0.6,
      onEachFeature: function (feature, layer) {
        vis.updateTooltipInfo(feature, layer, "inspections");
    	}
  }).addTo(vis.map);
>>>>>>> nick

  // add event handler to dropdown
  vis.dropdown = document.getElementById("chloropleth-dropdown");
  vis.dropdown.onchange = function() {
  	vis.updateChloropleth();
  }

  // create map legend
  vis.updateMapLegend();
}

/**
 * Update visualization components when dropdown is clicked
 */
Chloropleth.prototype.updateChloropleth = function() {
	var vis = this;

	// get dropdown value
	var dropdownValue = $("#chloropleth-dropdown").val();

	// update color scale domain
  vis.setColorScaleDomain(dropdownValue);

	// remove previous geo-json layer
	vis.map.removeLayer(vis.neighorhoods);
	
	// add new geo-json layer
<<<<<<< HEAD
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
      fillOpacity: 0.6,
      /** TODO: make it alternate between inspections and violations in final version **/
      onEachFeature: function (feature, layer) {
        layer.on('mouseover', function(e) {
          // TODO: update div with all inspections / violations
          var html = "";

          // header
          var div = $("#chloropleth-tooltip-box");
          html += "<h1 class='chloropleth-tooltip-header'>" + feature.properties.name + "</h1>";

          // start table
          html += "<table>";

          // inspections
          var inspections = vis.getAllInspections(feature.properties.name);
          inspections.forEach(function(d) {
            // TODO: 
            html += "<tr>";
            html += "<td>" + d["name"] + "</td>";
            html += "<td>" + d["Score"] + "</td>";
            html += "</tr>";
          });

          // close table
          html += "</table>";

          div.html(html);
        });
=======
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
    fillOpacity: 0.6,
      onEachFeature: function (feature, layer) {
        vis.updateTooltipInfo(feature, layer, dropdownValue);
>>>>>>> nick
      }
    }).addTo(vis.map);

    // update map legend
    vis.updateMapLegend();
}