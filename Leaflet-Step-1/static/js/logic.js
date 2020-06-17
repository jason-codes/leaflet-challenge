// Store API endpoint
var queryUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';


// Function to determine radius (meters) according to magnitude
function scaleRadius(magnitude) {
    return magnitude * 5
};


// Function to determine color according to magnitude, green-red ascending scale
function chooseColor(magnitude) {
    switch(true) {
        case magnitude <= 1:
            return 'rgb(0,255,0)';
        case magnitude <= 2:
            return 'rgb(102,255,0)';
        case magnitude <= 3:
            return 'rgb(204,255,0)';
        case magnitude <= 4:
            return 'rgb(255,204,0)';
        case magnitude <= 5:
            return 'rgb(255,102,0)';
        default:
            return 'rgb(255,0,0)';
            //return '#FF0000'
    }
};


// Perform get request
d3.json(queryUrl, function(data) {
    console.log(data);
    // Create GeoJSON layer and add to map
    createFeatures(data.features);
});


// Create circle layer
function createFeatures(features) {
    // onEachFeature will be a function called on each feature in features
    function onEachFeature(feature, layer) {
        // Bind a popup with details about the clicked-on earthquake
        layer.bindPopup('<h3>' + feature.properties.place + '</h3><hr>' +
            '<p> Magnitude: ' + feature.properties.mag + '</p>' +
            '<p> Time: ' + new Date(feature.properties.time) + '</p>');
    };
    // Create geoJSON layer
    var earthquakes = L.geoJSON(features, {
        onEachFeature: onEachFeature,
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                // Set marker options
                radius: scaleRadius(feature.properties.mag),
                fillColor: chooseColor(feature.properties.mag),
                color: 'black',
                weight: 0.5,
                opacity: 0.75,
                fillOpacity: 0.75
            });
        }
    });
    // Run function to create map overlay layer(s)
    createMap(earthquakes);
};


function createMap(earthquakes) {
    // Define streetmap layer
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    });
    // Define baseMaps object to hold all base layers
    var baseMaps = {
        'Street': streetmap
    };
    // Define overlay object to hold all overlay layers
    var overlayMaps = {
        Earthquakes: earthquakes
    };
    // Create map
    var myMap = L.map('map', {
        center: [39.8283, -98.5795],
        zoom: 4,
        layers: [streetmap, earthquakes]
    });
    // Create layer control containing baseMaps and overlayMaps
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
    // Set up legend (Reference - https://leafletjs.com/examples/choropleth/)
    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function(myMap) {
        var div = L.DomUtil.create('div', 'info legend');
        var magnitudes = [0, 1, 2, 3, 4, 5];
        var labels = [];
        // Loop through magnitude intervals and generate a label with a colored square for each interval
        for (var i = 0; i < magnitudes.length; i++) {
            div.innerHTML += '<i style="background:' + chooseColor(magnitudes[i] + 1) + '"></i> ' +
                magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap);

};