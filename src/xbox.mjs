import fetch from 'node-fetch';

const XBOX_CONSOLE_GAME_LIST_URL =
  'https://catalog.gamepass.com/sigls/v2?id=f6f1f99f-9b49-4ccd-b3bf-4d9767a77f5e&language=fr-fr&market=FR';
const XBOX_PCGAME_LIST_URL =
  'https://catalog.gamepass.com/sigls/v2?id=fdd9e2a7-0fee-49f6-ad69-4354098401ff&language=fr-fr&market=FR';

export default async function getAllXboxGames(offset = 0, limit = null) {
  const xboxConsoleGameListResponse = await fetch(XBOX_CONSOLE_GAME_LIST_URL);
  const xboxConsoleGameList = await xboxConsoleGameListResponse.json();

  const pcConsoleGameListResponse = await fetch(XBOX_PCGAME_LIST_URL);

  const pcConsoleGameList = await pcConsoleGameListResponse.json();

  // console.log(xboxConsoleGameList, pcConsoleGameList);

  const getGameId = (game) => game.id;

  const allGameList = new Set(
    [...xboxConsoleGameList, ...pcConsoleGameList]
      .map(getGameId)
      .filter((i) => !!i)
  );

  console.log(`Found ${allGameList.size} games in game pass`);

  let toFetchGames = [...allGameList];
  if (limit > 0) {
    toFetchGames = [...toFetchGames].splice(offset, limit);
  }

  console.log(toFetchGames);

  const fetchedGameDetailResponse = await fetch(
    `https://displaycatalog.mp.microsoft.com/v7.0/products?bigIds=${toFetchGames.join(
      ','
    )}&market=FR&languages=fr-fr&MS-CV=DGU1mcuYo0WMMp%20F.1`
  );
  const fetchedGameDetail = await fetchedGameDetailResponse.json();
  const gameList = fetchedGameDetail.Products;

  return gameList;
}
