const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cities = require('../json/china_city.json');

async function fetchReport(keyword) {
  try {
    const resp = await axios.get(
      `http://salarycalculator.sinaapp.com/report/${encodeURIComponent(
        keyword
      )}`
    );

    const html = resp.data.toString();
    fs.writeFileSync(
      path.resolve(__dirname, `../report_origin/${keyword}.txt`),
      html,
      'utf-8'
    );

    console.log(`Report of \`${keyword}\` download complete.`);
  } catch (err) {
    console.error(`Report of \`${keyword}\` download failed ==> ${err}`);
  }
}

async function execQueue(list) {
  const city = list.shift();

  if (list.length > 0) {
    try {
      await fetchReport(city.keyword);
      execQueue(list);
    } catch (err) {
      throw err;
    }
  } else {
    console.log('\n==> All reports download complete.');
  }
}

const queueList = cities.filter(x => !!x.keyword);
execQueue(queueList);

console.log('==> Salary reports download start...\n');
