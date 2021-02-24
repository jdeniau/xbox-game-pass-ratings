import openDb from './db.mjs';
import { closeBrowser } from './jvcom.mjs';
import { getGame as getJvcomGame } from './jvcom.mjs';
import getAllXboxGames from './xbox.mjs';

const OFFSET = 0;
const LIMIT = null;
const WAIT_TIMEOUT = 1000;
const FETCH_JVCOM = true;

const db = openDb();

console.log(`Total games in db : ${db.getGameList().length}`);
console.log(`Fetched from jvcom : ${db.getJvcomGameList().length}`);

const gameList = await getAllXboxGames();

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * This function help re-process some games only
 */
function shouldForceJvcomGame(title) {
  return false;
  // return title.includes(':');
}

let waitTimeout = 0;
let fetchedJvGames = 0;
const promiseList = await gameList.map(async (game) => {
  const title = game.LocalizedProperties[0].ProductTitle;

  db.ensureGameIsPresent(title, game);

  if (
    FETCH_JVCOM &&
    (!db.hasJvcomGame(title) || shouldForceJvcomGame(title)) &&
    (fetchedJvGames <= LIMIT || !LIMIT)
  ) {
    fetchedJvGames++;
    waitTimeout += WAIT_TIMEOUT;

    console.log(`waiting : ${waitTimeout}ms`);

    await delay(waitTimeout);

    console.log(Date.now(), `fetch jvcom game : ${title}`);

    const jvcomGame = await getJvcomGame(title);

    db.addJvcomGame(title, jvcomGame);

    console.log(Date.now(), jvcomGame);
  }
});

console.log(promiseList.length);

await Promise.all(promiseList);

// TODO remove/mark the game that are not in the game pass anymore

db.save();

await closeBrowser();
