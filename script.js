// This isn't necessary but it keeps the editor from thinking L and carto are typos
/* global L, carto */

var map = L.map("map", {
  center: [40.728, -73.915],
  zoom: 11
});

L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", {
  maxZoom: 18
}).addTo(map);

// Initialize Carto
var client = new carto.Client({
  apiKey: "default_public",
  username: "larainnep"
});

/* Here is Layer 1 */
// Initialize source data
var boroughSource = new carto.source.SQL("SELECT * FROM borough_boundaries");

// Create style for the data
var boroughStyle = new carto.style.CartoCSS(`
#layer {
  polygon-fill: #f5f1dc;
  polygon-opacity: 0.5;
}
#layer::outline {
  line-width: 2;
  line-color: #898686;
  line-opacity: 0.75;
}
#layer::labels {
  text-name: [boro_name];
  text-face-name: 'DejaVu Sans Book';
  text-size: 12;
  text-fill: #FFFFFF;
  text-label-position-tolerance: 0;
  text-halo-radius: 1;
  text-halo-fill: #6F808D;
  text-dy: -10;
  text-allow-overlap: true;
  text-placement: point;
  text-placement-type: dummy;
}
`);

// Add style to the data
var boroughLayer = new carto.layer.Layer(boroughSource, boroughStyle);

/* Here is Layer 2 */
// Initialize source data
var condomSource = new carto.source.SQL(
  "SELECT * FROM nyc_condom_availability_program_hiv_condom_distribution_locatio"
);

// Create style for the data
var condomStyle = new carto.style.CartoCSS(`
#layer {
  marker-width: 7;
  marker-fill: ramp([partnertype], (#c75a64, #e49059, #f6e471, #58a655, #9eedf3, #4f7bd7, #a96ccc, #f4b7da, #aed920, #f484b1, #B3B3B3), ("Business", "Community-Based Organization/Non-Profit", "Community Health Center", "Hospital", "Government", "Private Practice", "Education", "Sexual Health Clinics (NYC DOHMH)", "Pharmacy", "Faith-Based Organization"), "=");
  marker-fill-opacity: 1;
  marker-allow-overlap: true;
  marker-line-width: 1;
  marker-line-color: #FFFFFF;
  marker-line-opacity: 1;
  [zoom > 12] {marker-width: 15}
  [zoom > 14] {marker-width: 25}
}
`);

// Add style to the data
var condomLayer = new carto.layer.Layer(condomSource, condomStyle, {
 featureClickColumns: ['facilityname', 'partnertypedetailed', 'address']
});

// Pop ups
condomLayer.on('featureClicked', function (event) {
  
  var content = '<h2>' + event.data['facilityname'] + '</h2>';
  content += '<div>Facility type: ' + event.data['partnertypedetailed'] + '</div>';
  content += '<div>Address: ' + event.data['address'] + '</div>';
  
  console.log(event.data);
  
  var popup = L.popup();
  popup.setContent(content);
  
  popup.setLatLng(event.latLng);
  popup.openOn(map);
});

client.addLayer(boroughLayer);
client.addLayer(condomLayer);
client.getLeafletLayer().addTo(map);

// Listen for changes on the layer picker

var layerPicker = document.querySelector(".layer-picker");

layerPicker.addEventListener("change", function(e) {
  var partnerType = e.target.value;

  if (partnerType === "all") {
    condomSource.setQuery(
      "SELECT * FROM nyc_condom_availability_program_hiv_condom_distribution_locatio"
    );
  } else {
    condomSource.setQuery(
      "SELECT * FROM nyc_condom_availability_program_hiv_condom_distribution_locatio WHERE partnertype = '" +
        partnerType +
        "'"
    );
  }

  console.log('Dropdown changed to "' + partnerType + '"');
});