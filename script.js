const fs = require('fs');
const svgTemplate = fs.readFileSync('badges_a7.svg', 'utf8');
const data = JSON.parse(fs.readFileSync('example.json'));
const outputDir = './output/';
if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir);
}
const dummyName = "{NAME} ";
const dummyPic = "../../../../Volumes/u267156.your-storagebox.de/illusUndArbeit/nix/nixcon_2024/avatar.jpg";

const jsonEntries = data.entries;
console.log('entries: ', jsonEntries);

jsonEntries.forEach((entry) => {
  const {name, pictureUrl} = entry;
  console.log(`${name}`);

  const output =
    svgTemplate
      .replace(dummyName, name)
      .replace(dummyPic, pictureUrl)
      ;

  const fileName = `${name.replace(/\//g, '_')}.svg`;
  const filePath = `${outputDir}${fileName}`;

  fs.writeFileSync(filePath, output);
});
