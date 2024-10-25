import fs from 'fs';
import 'dotenv/config';
import axios from 'axios';
// async file operations
const svgTemplate = fs.readFileSync('./badges_a7.svg', { encoding: 'utf8' });
const badgesDir = './output/badges';
const ordersDir = './output/orders';
const usersDir = './output/users';
// ensure folder exists
if (!fs.existsSync(badgesDir)){
  fs.mkdirSync(badgesDir, { recursive: true });
}
if (!fs.existsSync(ordersDir)){
  fs.mkdirSync(ordersDir, { recursive: true });
}
if (!fs.existsSync(usersDir)){
  fs.mkdirSync(usersDir, { recursive: true });
}
// dummy data
const dummyPic = "avatar.png"
const dummyName = "{NAME}";

// ---- functions ----
async function getAllPretixOrdersEntries() {
  const { ORGANIZER: organizer, EVENT: event, TOKEN: token } = process.env;
  const url=`https://pretix.eu/api/v1/organizers/${organizer}/events/${event}/orders/`;
  try {
    let allOrders = [];
    let nextUrl = url;

    // fetch paginated response
    while (nextUrl) {
      console.info('url:', nextUrl);
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

async function pretixOrdersToNames(allOrders) {
  try {
    const attendeeNames = allOrders.map(order => {
      return (order.positions||[]).map(position => {
        const gitHubAnswer = position.answers?.find(answer => answer.question == 121956);
        const answeredGitHubName = gitHubAnswer ? sanitizeName(gitHubAnswer.answer) : null;
        const name = gitHubAnswer?.answer || position.attendee_name || `order #${position.order}/${position.positionid}`;
        return { name, answeredGitHubName };
      });
    });
  return attendeeNames.flat(2);
   // .filter((attendee) => {
   //   return attendee.name?.startsWith('@');
   // })
   // .slice(1)
  } catch (error) {
    console.error('poor error message: ', error.message);
    throw error;
  }
}

function sanitizeName(name) {
  return name
    .replace(/^.*\//, '')
    .replace(/^@/, '')
    ;
}

async function writeBadges(attendeeNames) {
  try {
    await Promise.all(attendeeNames.map(async (entry) => {
      const { name, gitHubName, gitHubHandle, pictureUrl } = entry;
      const displayName = gitHubName || gitHubHandle || name;
      const output =
        svgTemplate
          .replace(dummyName, displayName)
          .replace(dummyPic, pictureUrl)
          ;

      // TODO use unique basename (GitHub handle?) so the for-loop below isn't necessary
      const basename = name.replace(/\//g, '_');
      let badgePath = `${badgesDir}/${basename}.svg`;
      for (let i = 2; fs.existsSync(badgePath); i++) {
        badgePath = `${badgesDir}/${basename}-${i}.svg`;
      };

      console.info(`write badge ${badgePath} (GitHub handle: ${gitHubHandle})`);
      fs.writeFileSync(badgePath, output);
    }));
  } catch (error) {
    console.error('error writing badges:', error.message);
  }
};

async function enrichNamesWithAvatarAndHandle(attendeeNames) {
  try {
    return await Promise.all(attendeeNames.map(async (attendee) => {
      const dummyData = { gitHubHandle: null, avatar_url: "" };
      const userPath = `${usersDir}/${attendee.answeredGitHubName}.json`;
      const userData = fs.existsSync(userPath) ? JSON.parse(fs.readFileSync(userPath)) : dummyData;

      return {
        ...attendee,
        gitHubHandle: userData.login,
        gitHubName: userData.name,
        pictureUrl: userData.avatar_url,
      };
    }));
  } catch (error) {
    console.error('error enrichNamesWithAvatarAndHandle:', error.message);
  }
}

//TODO cut url parts from name
//     fetch for gitHub display names and avatars https://avatars.githubusercontent.com/<username>
async function fetchUser(gitHubName) {
  const githubToken = process.env.GITHUB_TOKEN;
  const userUrl = `https://api.github.com/users/${gitHubName}`;
  const userPath = `${usersDir}/${gitHubName}.json`;
  try {
    console.info("fetching", userUrl);
    const response = await axios.get(userUrl, {
      headers: {
        'Authorization': `token ${githubToken}`
      }
    });
    console.info("write user", userPath);
    return fs.writeFileSync(userPath, JSON.stringify(response.data));
  } catch (error) {
    console.error(`error fetching github API for ${gitHubName}`, error.response?.data || error.message);
  }
}

// set to false to skip
const doFetchOrders = true;
const doFetchUsers = true;

if (doFetchOrders) {
  const allOrders = await getAllPretixOrdersEntries();
  allOrders.forEach(order => {
    const orderPath = `${ordersDir}/${order.code}.json`;
    console.info("write order", orderPath);
    fs.writeFileSync(orderPath, JSON.stringify(order));
  });
}

const allOrders = fs.readdirSync(ordersDir).map(orderBasename => JSON.parse(fs.readFileSync(`${ordersDir}/${orderBasename}`, { encoding: 'utf8' })));
console.info("order count:", allOrders.length)

const attendeeNames = await pretixOrdersToNames(allOrders);
console.info("attendee count:", attendeeNames.length)

if (doFetchUsers) {
  const gitHubNames = attendeeNames.map(attendeeName => attendeeName.answeredGitHubName).filter(gitHubName => !!gitHubName);
  await Promise.all(gitHubNames.map(fetchUser));
}

const enrichedAttendeeNames = await enrichNamesWithAvatarAndHandle(attendeeNames);

writeBadges(enrichedAttendeeNames);
