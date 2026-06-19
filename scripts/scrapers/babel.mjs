import { JSDOM } from 'jsdom';
import { fetchAndExtractArticle, createArticle } from '../utils/scraper.mjs';
import { MAX_ARTICLES_PER_SOURCE } from '../config/constants.mjs';

export async function scrapeBabelNews(existingMap, runTime) {
  const news = [];
  try {
    console.log(`Scraping Babel News...`);
    const res = await fetch('https://babeljs.io/blog/');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const articles = doc.querySelectorAll('article');

    for (const article of Array.from(articles).slice(0, MAX_ARTICLES_PER_SOURCE)) {
      const a = article.querySelector('h2 a, h1 a');
      if (!a) continue;

      const url = `https://babeljs.io${a.href}`;
      const title = a.textContent.trim();
      const id = url;
      if (existingMap.has(id)) continue;

      const timeEl = article.querySelector('time');
      const pubDate = timeEl && timeEl.getAttribute('datetime') ? new Date(timeEl.getAttribute('datetime')).toISOString() : new Date().toISOString();

      const content = await fetchAndExtractArticle(url);
      if (!content) continue;

      news.push(createArticle({
        id, title, content, url,
        category: '프론트엔드', source: 'Babel Blog', author: 'Babel Team',
        pubDate, fetchedAt: runTime, tags: ['Babel', 'Build'],
      }));
    }
  } catch (error) { console.error(`[ERROR] Failed to scrape Babel:`, error.message); }
  return news;
}
