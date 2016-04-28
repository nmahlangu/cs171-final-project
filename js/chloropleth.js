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
 * Prettifies the name of a business (removes extraneous caps)
 * @param:string: name - name of a business
 */
Chloropleth.prototype.prettifyBusinessName = function(name) {
  var words = name.split(" ").map(function(word) { return word.toLowerCase(); });
  result = [];
  words.forEach(function(word) {
    var code = word.charCodeAt(0);
    // it is a letter
    if (((code >= 65) && (code <= 90)) || ((code >= 97) && (code <= 122))) {
      newWord = word.slice(0,1).toUpperCase() + word.slice(1,word.length);
      result.push(newWord);
    }
  });
  return result.join(" ");
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
				obj["name"] = vis.prettifyBusinessName(business_data["name"]);
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
          d["name"] = vis.prettifyBusinessName(business_data["name"]);
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
  colorScaleDomain = colorScaleDomain.filter(function(d) { return d != 0; });
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

    // update neighborhood being shown
    $("#chloropleth_h3_heading").html(feature.properties.name);

    // inspection data variables
    var inspecRestaurantColWidth = 160;
    var inspecDateColWidth = 100;
    var inspecScoreWidth = 60;

    // violation data variables
    var vioRestaurantColWidth = 100;
    var vioDateColWidth = 100;
    var vioLevelColWidth = 100;

    // create new table headers
    var html = "";
    html += "<table id='chloropleth_table_header' class='table table-bordered'>";

    switch(dropdownValue) {
      case "inspections":
        html += "<thead>"
        html += "<tr>";
        html += "<th style='width: " + inspecRestaurantColWidth + "px; text-align: center'>" + "Restaurant" + "</td>";
        html += "<th style='width: " + inspecDateColWidth + "px; text-align: center'>" + "Date" + "</td>";
        html += "<th style='width: " + inspecScoreWidth + "px; text-align: center'>" + "Score" + "</td>";
        html += "</tr>";
        html += "</thead>";
        break;

      // add violation data
      case "violations":
        html += "<thead>"
        html += "<tr>";
        html += "<td style='width: " + vioRestaurantColWidth + "px; text-align: center'>" + "Restaurant" + "</td>";
        html += "<th style='width: " + vioDateColWidth + "px; text-align: center'>" + "Date" + "</td>";
        html += "<td style='width: " + vioLevelColWidth + "px; text-align: center'>" + "Level" + "</td>";
        html += "</tr>";
        html += "</thead>";
        break;
    }

    // close table
    html += "</table>";

    // update table headers
    $("#chloropleth-tooltip-header").html(html);

    switch(dropdownValue) {
      // add inspection data
      case "inspections":
        var inspections = vis.getAllInspections(feature.properties.name);
        if (inspections.length > 0) {
          // create new table body
          html = "";
          html += "<table class='table table-striped table-bordered table-hover' style='table-layout: fixed'>";
          html += "<tbody>";
          inspections.forEach(function(d) {
            html += "<tr>";
            html += "<td style='width: " + inspecRestaurantColWidth + "px'>" + d["name"] + "</td>";
            var month = Math.floor(((d["date"] % 10000) / 100)).toString();
            var day = (d["date"] % 100).toString()
            var year = Math.floor((d["date"] / 10000)).toString();
            html += "<td style='width: " + inspecDateColWidth + "px; text-align: center'>" + month + "/" + day + "/" + year + "</td>";
            html += "<td style='width: " + inspecScoreWidth + "px; text-align: center'>" + d["Score"] + "</td>";
            html += "</tr>";
          });
          html += "</tbody>";
          // close table
          html += "</table>";
        }
        else {
          html = "</br><p style='text-align: center; font-size: 18px'>No data to show</p>";
        }
        break;

      // add violation data
      case "violations":
        var violations = vis.getAllViolations(feature.properties.name);
        if (violations.length > 0) {
          // create new table body
          html = "";
          html += "<table class='table table-striped table-bordered table-hover' style='table-layout: fixed'>";
          violations.forEach(function(d) {
            html += "<tr>";
            html += "<td style='width: " + vioRestaurantColWidth + "px;'>" + d["name"] + "</td>";
            var month = Math.floor(((d["date"] % 10000) / 100)).toString();
            var day = (d["date"] % 100).toString()
            var year = Math.floor((d["date"] / 10000)).toString();
            html += "<td style='width: " + vioDateColWidth + "px; text-align: center'>" + month + "/" + day + "/" + year + "</td>";
            html += "<td style='width: " + vioLevelColWidth + "px; text-align: center'>" + d["risk_category"] + "</td>";
          });
          // close table
          html += "</table>";
        }
        else {
          html = "</br><p style='text-align: center; font-size: 18px'>No data to show</p>";
        }
        break;
    }

    // update table body
    $("#chloropleth-tooltip-box").html(html);
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
      }
    }).addTo(vis.map);

    // update map legend
    vis.updateMapLegend();
}