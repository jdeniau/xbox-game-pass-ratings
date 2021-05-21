import fetch from 'node-fetch';
import { chromium, devices } from 'playwright';
import { stripTags } from './utils/string.mjs';

const DEBUG = false;

const browser = await chromium.launch({ headless: !DEBUG, devtools: DEBUG });
const device = devices['iPad Pro 11 landscape'];
const context = await browser.newContext({
  ...device,
  locale: 'fr-FR',
});

async function getGauge(url) {
  const page = await context.newPage();
  await page.goto(url);
  // await page.screenshot({ path: `example-${Date.now()}.png` });

  const gauge = await page.textContent('.gameCharacteristicsMain__gaugeText');

  // Create pages, interact with UI elements, assert values
  await page.close();
  // await browser.close();

  return gauge;
}

export async function closeBrowser() {
  await browser.close();
}

function cleanTitle(str) {
  return (
    str
      // remove unhandled utf-8 char
      .replace(/(™|©|®)/g, '')

      // add space between ":"
      .replace(/([^\s]):/, '$1 :')
  );
}

export async function getGame(title) {
  try {
    const searchUrl = new URL('https://www.jeuxvideo.com/rechercher.php?a=5');
    searchUrl.searchParams.set('q', cleanTitle(title));

    const searchResultResponse = await fetch(searchUrl);

    const searchResult = await searchResultResponse.json();
    const firstResult = searchResult.result.filter(
      (i) => i.mastertag_nom === 'Jeu' && !!i.url
    )[0];

    if (!firstResult) {
      throw new Error(`Unable to find ${title} on jvcom`);
    }

    const url = firstResult.url;
    const searchTitle = firstResult.titre_avec_correspondances_en_gras;

    const jvcomUrl = `https://www.jeuxvideo.com${url}`;
    const gauge = await getGauge(jvcomUrl);

    return {
      searchTitle,
      gauge,
      url: jvcomUrl,
    };
  } catch (e) {
    console.error(e);

    return {
      error: typeof e === 'object' ? e.message : e,
    };
  }
}
