// create map instance
var map = new mapboxgl.Map({
  container: 'map',
  style: MAPBOX_STYLE,
  center: [112.652471, 36.137402],
  zoom: 4.4,
  minZoom: 3.5,
  maxZoom: 7,
  pitch: 55,
  bearing: -40,
});

// mouse cursor on map
map.getCanvas().style.cursor = 'crosshair';

// add fullscreen control
map.addControl(new mapboxgl.FullscreenControl());

// add navigation control
map.addControl(new mapboxgl.NavigationControl());

// Create a popup, but don't add it to the map yet.
var popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false,
});

// hover state
var hoveredStateId = null;

// location of the feature, with description HTML from its properties
map.on('mouseenter', 'map_data_indices', function(e) {
  // Change opacity of index
  if (e.features.length > 0) {
    if (hoveredStateId) {
      map.setFeatureState(
        { source: 'map_data', id: hoveredStateId },
        { hover: false }
      );
    }
    hoveredStateId = e.features[0].id;
    map.setFeatureState(
      { source: 'map_data', id: hoveredStateId },
      { hover: true }
    );
  }

  var point = JSON.parse(e.features[0].properties.cp.slice());
  var coordinates = {
    lng: point[0],
    lat: point[1],
  };
  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
  }

  var description =
    '<strong>' +
    e.features[0].properties.name +
    ' - ￥' +
    e.features[0].properties.avg_countup +
    '</strong>';

  popup
    .setLngLat(coordinates)
    .setHTML(description)
    .addTo(map);
});

// Change it back to a pointer when it leaves.
map.on('mouseleave', 'map_data_indices', function() {
  popup.remove();

  // Change opacity of index
  if (hoveredStateId) {
    map.setFeatureState(
      { source: 'map_data', id: hoveredStateId },
      { hover: false }
    );
  }
  hoveredStateId = null;
});
