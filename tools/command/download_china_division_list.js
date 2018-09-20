const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function generateJsonData() {
  try {
    const resp = await axios.get(
      'http://www.mca.gov.cn/article/sj/tjbz/a/2017/201801/201801151447.html'
    );

    const html = resp.data.toString();
    const pattOfCode = /\<td[^\>]+\>(\d{6})\<\/td\>(\s|\n)*?\<td[^\>]+\>([^\s\<]+)\<\/td\>/gi;
    const tdList = html.match(pattOfCode).map(s => ({
      code: s.replace(pattOfCode, '$1'),
      name: s.replace(pattOfCode, '$3'),
    }));

    fs.writeFileSync(
      path.join(__dirname, '../json/china_division.json'),
      JSON.stringify(tdList),
      'utf-8'
    );

    console.log('Data download complete.');
  } catch (err) {
    console.error(`Data download failed ==> ${err}`);
  }
}

generateJsonData();
