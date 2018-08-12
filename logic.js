// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
// var circle;
// var radii;

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  earthquakes = createCircleFeatures(data);
  //earthquakes = createChoroplethFeatures(data);
  // Sending our earthquakes layer to the createMap function
  myMap = createMap(earthquakes);

});

function createCircleFeatures(earthquakeData) {
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array

  var earthquakes = L.geoJSON (earthquakeData, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, style(feature))
    },
    onEachFeature: onEachFeature
  });

  function style (feature) {
    var myRadius = feature.properties.mag * 7; //scaled radius make the circles larger

    return {
      radius: myRadius,
      //fillColor: "#ff7800",
      fillColor: chooseColor(feature.properties.mag),
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8,
    }
  }

  function chooseColor (mag) {

    var colorCode = "";
    if  (mag< 1) {colorCode="green";}
    else if (mag < 2) {colorCode="yellow";}
    else if (mag < 3) {colorCode="orange";}
    else if (mag < 4) {colorCode="red";}
    else if (mag < 5) {colorCode="violet";}
    else if (mag < 6) {colorCode="purple";}
    else if (mag < 7) {colorCode="blue";}
    else if (mag < 8) {colorCode="brown";}
    else {colorCode="black";}

    return colorCode;
  }
  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h2>" + "Magnitude: " + feature.properties.mag + "</h2><hr><h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  return earthquakes;
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Light Map": lightmap,
    "Street Map": streetmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    // Radius: radii
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 3,
    layers: [lightmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  
  // Setting up the legend
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    // console.log('hello');
    var div = L.DomUtil.create("div", "info legend");
    var limits = [0,1,2,3,4,5,6,7,8];
    var colors = ['green','yellow','orange','red','violet','purple','blue','brown','black'];
    //var labels = ['<1','1-2','2-3','3-4','4-5','5-6','6-7','7-8','>8'];
    var labels = [];

    // Add min & max
    var legendInfo = "<h1>Earthquake Magnitude</h1>" +
      "<div class=\"labels\">" +
        "<div class=\"min\">" + limits[0] + "</div>" +
        "<div class=\"max\">" + ">" + limits[limits.length - 1] + "</div>" +
      "</div>";
    
    console.log(legendInfo);

    div.innerHTML = legendInfo;

    limits.forEach(function(limit, index) {
      labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
    });

    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
  };

  // Adding legend to the map
  legend.addTo(myMap);

  return myMap;
}
