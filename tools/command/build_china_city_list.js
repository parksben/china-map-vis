const fs = require('fs');
const path = require('path');
const divisions = require('../json/china_division.json');

// 过滤掉县级区域
let cities = divisions.filter(x => x.code.slice(4) === '00');

// 市级区域提取关键字
cities = cities.map(x => {
  const pattern = /(市|地区|盟|(.族|朝鲜族|土家族|布依族|哈尼族|景颇族|傈僳族|蒙古族|蒙古|柯尔克孜|哈萨克)*自治州)$/;

  if (pattern.test(x.name)) {
    x.keyword = x.name.replace(pattern, '');
  } else {
    x.keyword = '';
  }

  return x;
});

try {
  fs.writeFileSync(
    path.join(__dirname, '../json/china_city.json'),
    JSON.stringify(cities),
    'utf-8'
  );
  console.log('Data transition complete.');
} catch (err) {
  console.error(`Data transition faled: ${err}`);
}
