const fs = require('fs');
const path = require('path');
const rewind = require('geojson-rewind');
const chinaGeo = require('../json/china_geo.json');
const cityContour = require('../json/china_city_contour.json');
const salaries = require('../json/china_city_salary.json');

function decodePolygon(coordinate, encodeOffsets) {
  var result = [];
  var prevX = encodeOffsets[0];
  var prevY = encodeOffsets[1];

  for (var i = 0; i < coordinate.length; i += 2) {
    var x = coordinate.charCodeAt(i) - 64;
    var y = coordinate.charCodeAt(i + 1) - 64;
    // ZigZag decoding
    x = (x >> 1) ^ -(x & 1);
    y = (y >> 1) ^ -(y & 1);
    // Delta deocding
    x += prevX;
    y += prevY;

    prevX = x;
    prevY = y;
    // Dequantize
    result.push([x / 1024, y / 1024]);
  }

  return result;
}

function decode(json) {
  if (!json.UTF8Encoding) {
    return json;
  }
  var features = json.features;

  for (var f = 0; f < features.length; f++) {
    var feature = features[f];
    var geometry = feature.geometry;
    var coordinates = geometry.coordinates;
    var encodeOffsets = geometry.encodeOffsets;

    for (var c = 0; c < coordinates.length; c++) {
      var coordinate = coordinates[c];

      if (geometry.type === 'Polygon') {
        coordinates[c] = decodePolygon(coordinate, encodeOffsets[c]);
      } else if (geometry.type === 'MultiPolygon') {
        for (var c2 = 0; c2 < coordinate.length; c2++) {
          var polygon = coordinate[c2];
          coordinate[c2] = decodePolygon(polygon, encodeOffsets[c][c2]);
        }
      }
    }
  }
  // Has been decoded
  json.UTF8Encoding = false;
  return json;
}

const chinaGeojson = rewind(decode(chinaGeo), true);

const chinaCityGeojson = rewind(decode(cityContour), true);

const cityData = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../json/china_city_contour.json'))
);
const cityIndices = rewind(decode(cityData), true);
cityIndices.features.forEach(f => {
  const citySalary = salaries.find(
    x => x.keyword === f.properties.name && !!x.avg_countup
  );
  if (citySalary) {
    f.properties.avg_countup = citySalary.avg_countup;
    f.properties.level_list = citySalary.level_list;
    f.properties.job_list = citySalary.job_list;
    f.properties.industry_list = citySalary.industry_list;

    // f.properties.height = 2 ** (~~citySalary.avg_countup / 1000) * 1000;
    f.properties.height = ~~citySalary.avg_countup * 50;

    const point = f.properties.cp;
    const radius = 0.3;
    f.geometry = rewind(
      {
        type: 'Polygon',
        coordinates: [
          [
            [point[0] - radius, point[1] - radius * 0.85],
            [point[0] + radius, point[1] - radius * 0.85],
            [point[0] + radius, point[1] + radius * 0.85],
            [point[0] - radius, point[1] + radius * 0.85],
            [point[0] - radius, point[1] - radius * 0.85],
          ],
        ],
      },
      true
    );
  }
});
cityIndices.features = cityIndices.features.filter(
  f => !!f.properties.avg_countup
);

const salaryData = salaries.filter(x => !!x.keyword && !!x.avg_countup);

const jsFileContent = [
  `var CHINA_MAP_SOURCE = ${JSON.stringify(chinaGeojson)};\n`,
  `var CITY_MAP_SOURCE = ${JSON.stringify(chinaCityGeojson)};\n`,
  `var MAP_DATA_SOURCE = ${JSON.stringify(cityIndices)};\n`,
  `var CHINA_CITY_SALARY = ${JSON.stringify(salaryData)};\n`,
].join('\n');

fs.writeFileSync(
  path.resolve(__dirname, '../../static/js/import_full_data.js'),
  jsFileContent,
  'utf-8'
);

console.log('==> Browser-side js file created.');
