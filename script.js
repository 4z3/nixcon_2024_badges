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
async function pretixOrdersToNames() {
  try {
    const data = await getAllPretixOrdersEntries();
    const attendeeNames = data.map((x) => {
      let name = null;
      let gitHubName = null;
      let gitHubHandle = null;
      let order = x.positions;


      for (const part of order) {
        if (part.answers) {
          const gitHubAnswer = part.answers?.find(answer => answer.question == 121956);
          if (gitHubAnswer) {
            gitHubName = gitHubAnswer.answer;
            name = gitHubAnswer.answer;
            break;
          }
        }
        if (part.attendee_name) {
          name = part.attendee_name;
        }
      }
      if (!name) {
        name = `order nr. ' + ${order[0].order}`;
      }

        return {
        name,
        gitHubName,
        pictureUrl: dummyPic,
      };
    });
  return attendeeNames;
  } catch (error) {
    console.error('poor error message: ', error.message);
    throw error;
  }
}


  fs.writeFileSync(filePath, output);
});
