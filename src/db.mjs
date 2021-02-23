import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = resolve(__dirname, '../db.json');

class DB {
  constructor() {
    if (!existsSync(DB_PATH)) {
      this.gameList = [];
    } else {
      this.gameList = JSON.parse(readFileSync(DB_PATH));
    }
  }

  getGameList() {
    return this.gameList;
  }

  getJvcomGameList() {
    return this.gameList.filter(
      (game) => !!game.jvcom?.url || game.jvcom?.error
    );
  }

  hasGame(title) {
    return !!this.gameList.find((game) => game.title === title);
  }

  getGame(title) {
    return this.gameList.find((game) => game.title === title);
  }

  getGameWithIndex(title) {
    const index = this.gameList.findIndex((game) => game.title === title);

    return {
      index,
      game: this.gameList[index],
    };
  }

  addGame(title, game) {
    this.gameList.push({
      title,
      releaseDate: game.MarketProperties[0].OriginalReleaseDate,
    });
  }

  ensureGameIsPresent(title, game) {
    if (!this.hasGame(title)) {
      this.addGame(title, game);
    }
  }

  hasJvcomGame(title) {
    const game = this.getGame(title);

    return game && (game.jvcom?.url || game.jvcom?.error);
  }

  addJvcomGame(title, jvcomGame) {
    const { index, game } = this.getGameWithIndex(title);

    game.jvcom = jvcomGame;

    this.gameList[index] = game;
  }

  save() {
    writeFileSync(DB_PATH, JSON.stringify(this.gameList, null, 2));
  }
}

export default DB;
