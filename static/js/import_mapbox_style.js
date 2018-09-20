// NOTICE: `CHINA_MAP_SOURCE` & `CHINA_CITY_SALARY` defined by `import_full_data.js`

var MAPBOX_STYLE = {
  version: 8,
  sources: {
    china_map: {
      type: 'geojson',
      data: CHINA_MAP_SOURCE,
    },
    china_city_map: {
      type: 'geojson',
      data: CITY_MAP_SOURCE,
    },
    map_data: {
      type: 'geojson',
      data: MAP_DATA_SOURCE,
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#000',
      },
    },
    {
      id: 'china_area',
      type: 'fill',
      source: 'china_map',
      filter: ['==', '$type', 'Polygon'],
      layout: {},
      paint: {
        'fill-color': '#222',
      },
    },
    {
      id: 'china_contour',
      type: 'line',
      source: 'china_map',
      filter: ['==', '$type', 'Polygon'],
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#0cf',
        'line-width': 2,
        'line-opacity': 0.8,
      },
    },
    {
      id: 'map_data_indices',
      type: 'fill-extrusion',
      source: 'map_data',
      filter: ['==', '$type', 'Polygon'],
      layout: {},
      paint: {
        'fill-extrusion-color': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          '#f00',
          '#0cf',
        ],
        'fill-extrusion-height': ['get', 'height'],
        'fill-extrusion-base': 0,
        'fill-extrusion-opacity': 1,
      },
    },
  ],
};
