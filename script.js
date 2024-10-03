const fs = require('fs');
const cheerio = require('cheerio');
const data = JSON.parse(fs.readFileSync('example.json'));
const svgTemplate = fs.readFileSync('badges_a7.svg', 'utf8');
const outputDir = './output/';
if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir);
}
const jsonEntries = data.entries;
console.log('entries: ', jsonEntries);

jsonEntries.forEach((entry) => {
  const {name, pictureUrl} = entry;
  console.log(`${name}`);
  const $ = cheerio.load(svgTemplate, {xmlMode: false});
  const nameElement = $('#name text');
  const pictureUrlElement = $('image[width="386"][height="386"]');

  // update <text> element
  nameElement.text(name);
  // update <image> element
  pictureUrlElement.attr("href", pictureUrl);

  // replace spaces and create filename
  const fileName = `${name.replace(/\s+/g, '_')}.svg`;
  const filePath = `${outputDir}${fileName}`;

  fs.writeFileSync(filePath, $.xml());
  console.log(`file created: ${filePath}`);
});
