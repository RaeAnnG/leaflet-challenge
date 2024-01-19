// Pull Data from USGS - Using last 30 days - all earthquakes - create a variable
const USGS = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";
const RADIUS_MIN = 5;
const RADIUS_MULT = 10;

// Perform a GET request to the query URL/
d3.json(USGS).then(function (data) {
  console.log(data);
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
  });

  //Create a function for the marker size
  function markerSize(magnitude) {
    let calcRadius = magnitude * RADIUS_MULT;
    let clampRadius = Math.max(calcRadius, RADIUS_MIN)
    return clampRadius;
  }

  //Set the color scale for the markers
  function choosecolor(depth) {
    switch(true) {
      case depth > 90: return "red";
      case depth > 70: return "orangered";
      case depth > 50: return "orange"; 
      case depth > 30: return "gold"; 
      case depth > 10: return "yellow"; 
      default: return "green";                    
    }
  }

  //Set up the Create Features function
  function createFeatures(earthquakeData) {

    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the place and time of the earthquake.
    function onEachFeature(feature, layer) {
      layer.bindPopup(`<h3>Location: ${feature.properties.place}
      </h3><hr><p>Date: ${new Date(feature.properties.time)}
      </p><p>Magnitude: ${feature.properties.mag}
      </p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    }

    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    var earthquakes = L.geoJSON(earthquakeData, {
      onEachFeature: onEachFeature,
  //});

  //Point to layer used to alter markers
      pointToLayer: function(feature, latlng) {

    //Set the style of the markers based on the properties
        var style = {
          radius: markerSize(feature.properties.mag),
            fillColor: choosecolor(feature.geometry.coordinates[2]),
            fillOpacity: 0.1,
            color: "black",
            stroke: true,
            weight: .5
        }
        return L.circleMarker(latlng,style);
      }
    });

    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);
  }

  //Set up createMap function to add the layers to the map
  function createMap(earthquakes) {

    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
  
    // Create a baseMaps object.
    let baseMaps = {
      "Street Map": street,
      "Topographic Map": topo
    };
  
    // Create an overlay object to hold our overlay.
    let overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [street, earthquakes]
    });

// //Add Legend
var legend = L.control({position: "bottomright"});

legend.onAdd = function () {
  var div = L.DomUtil.create("div", "info legend"),
  depth = [-10,10,30,50,70,90];

  div.innerHTML += "<h3 style='text-align: center'>Depth</h3>"

// Loop through the intervals to generate labels with colored squares
  for (var i = 0; i < depth.length; i++) {
    div.innerHTML +=
      '<i style="background:' + choosecolor(depth[i] + 1) + ';">&emsp;</i> ' +
      depth[i] + (depth[i + 1] ? '&ndash;' + depth[i +1] + '<br>' : '+');
  }
  return div;
  };
  legend.addTo(myMap);
  // Create a layer control.
  // Pass it to baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

}


