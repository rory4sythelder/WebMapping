// 1. Initialize the map centered on the continental US
const map = L.map('map').setView([39.8283, -98.5795], 4);

// 2. Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// 3. Build the Overpass query: all nodes/ways/relations tagged tourism=ski_resort in the USA
const overpassQuery = `
[out:json][timeout:25];
area["name"="United States"]["admin_level"="2"]->.us;
(
  node["tourism"="ski_resort"](area.us);
  way["tourism"="ski_resort"](area.us);
  relation["tourism"="ski_resort"](area.us);
);
out center;
`;

// 4. Fetch from Overpass API, convert to GeoJSON, and add to Leaflet
fetch('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  body: overpassQuery
})
  .then(res => res.json())
  .then(osmData => {
    const geojson = osmtogeojson(osmData);
    // style all markers as small blue circles
    L.geoJSON(geojson, {
      pointToLayer: (feature, latlng) => 
        L.circleMarker(latlng, { radius: 5, fillOpacity: 0.7, color: '#0074D9' }),
      onEachFeature: (feature, layer) => {
        const name = feature.properties.tags && feature.properties.tags.name
          ? feature.properties.tags.name
          : 'Unnamed resort';
        layer.bindPopup(`<strong>${name}</strong>`);
      }
    }).addTo(map);
  })
  .catch(err => {
    console.error('Error loading ski resorts:', err);
    alert('Failed to load ski-resort data. See console for details.');
  });
