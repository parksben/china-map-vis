const fs = require('fs');
const path = require('path');
const request = require('request');

function download() {
  return new Promise(function(resolve, reject) {
    let start = 0;

    const writeStream = fs.createWriteStream(
      path.resolve(__dirname, '../json/china_city_contour.json')
    );

    request(
      'https://raw.githubusercontent.com/apache/incubator-echarts/master/map/json/china-cities.json'
    )
      .on('data', function() {
        start += 1;
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(
          `[Downloading ${'-\\|/'.slice(
            start % 4,
            (start % 4) + 1
          )}] ${new Array(start % 40).join('>')}`
        );
      })
      .on('close', function() {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
      })
      .on('error', function(err) {
        console.error(`Data download failed ==> ${err}`);
        process.exit(-1);
        reject(err);
      })
      .pipe(writeStream)
      .on('finish', function() {
        console.log('Data download complete.');
        process.exit();
        resolve();
      })
      .on('error', function(err) {
        console.error(`Data download failed ==> ${err}`);
        process.exit(-1);
        reject(err);
      });
  });
}

download();
