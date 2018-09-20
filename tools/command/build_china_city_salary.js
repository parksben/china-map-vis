const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const cities = require('../json/china_city.json');

const REPORT_DIR = path.resolve(__dirname, '../report_origin/');

const result = cities.map(x => Object.assign({}, x));

function resolveData(keyword) {
  const filePath = `${REPORT_DIR}/${keyword}.txt`;

  if (fs.existsSync(filePath)) {
    const html = fs.readFileSync(filePath);
    const $ = cheerio.load(html);

    const resultCell = result.find(x => x.keyword === keyword);

    // 平均工资
    resultCell.avg_countup =
      Number(
        $('#avg-countup')
          .html()
          .trim()
      ) || -1;

    // 工资分布比例
    resultCell.level_list = $('.level-list li div')
      .map(function(i, el) {
        return $(this)
          .text()
          .trim();
      })
      .get()
      .filter(x => !!x);

    // 从table解析数据的方法
    const resolveListFromTable = selector =>
      $(selector)
        .map(function(i, el) {
          return $(this)
            .text()
            .trim();
        })
        .get()
        .filter((x, i) => i % 3 !== 0)
        .map((x, i) => {
          if (i % 2 !== 0) {
            return Number(x.replace(/\s*?￥\s*?/, ''));
          }
          return x;
        });

    // 岗位工资排名
    resultCell.job_list = resolveListFromTable(
      '.col-md-offset-1 + .col-md-6 table td'
    );

    // 行业工资排名
    resultCell.industry_list = resolveListFromTable(
      '.col-md-offset-1 + .col-md-6 + .col-md-6 table td'
    );

    // 地区工资排名(用以补充其他地区缺失的数据)
    const otherAreaAvg = resolveListFromTable(
      '.city-report .row:last-child .col-md-6 table td'
    );
    otherAreaAvg.forEach((x, i) => {
      if (typeof x === 'string') {
        const otherCell = result.find(cell => cell.keyword === x);

        if (otherCell) {
          otherCell.avg_countup = otherAreaAvg[i + 1];
        }
      }
    });
  }
}

function execQueue(list) {
  const kw = list.shift(list);

  if (list.length > 0) {
    resolveData(kw);
    execQueue(list);
  } else {
    fs.writeFileSync(
      path.resolve(__dirname, '../json/china_city_salary.json'),
      JSON.stringify(result),
      'utf-8'
    );

    console.log('==> City salary data resolved.');
  }
}

const keywordList = cities.filter(x => !!x.keyword).map(x => x.keyword);
execQueue(keywordList);
