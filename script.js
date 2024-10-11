import fs from 'fs';
import { promises as fsPromises } from 'fs';
import 'dotenv/config';
import axios from 'axios';
// async file operations
const svgTemplate = await fsPromises.readFile('./badges_a7.svg', 'utf8');
const outputDir = './output/';
if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir);
}
const dummyName = "{NAME} ";
const dummyPic = "../../../../Volumes/u267156.your-storagebox.de/illusUndArbeit/nix/nixcon_2024/avatar.jpg";

const jsonEntries = data.entries;
console.log('entries: ', jsonEntries);
async function getAllPretixOrdersEntries() {
  const { ORGANIZER: organizer, EVENT: event, TOKEN: token } = process.env;
  const url=`https://pretix.eu/api/v1/organizers/${organizer}/events/${event}/orders/`;
  try {
    let allOrders = [];
    let nextUrl = url;

    // fetch paginated response
    while (nextUrl) {
      console.log('url:', nextUrl);
      const response = await axios.get(nextUrl, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });

      const data = response.data
      nextUrl = data.next;
      allOrders = allOrders.concat(data.results);
    }
    return allOrders;
  } catch (error) {
    if (error.response) {
      console.error('error:', error.response.status, error.response.data);
    } else {
      console.error('error:', error.message);
    }
  }
};

  const fileName = `${name.replace(/\//g, '_')}.svg`;
  const filePath = `${outputDir}${fileName}`;

  fs.writeFileSync(filePath, output);
});
