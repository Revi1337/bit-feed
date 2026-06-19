import { JSDOM } from 'jsdom';
import { createArticle } from '../utils/scraper.mjs';
import { MAX_ARTICLES_PER_SOURCE } from '../config/constants.mjs';

export async function scrapeCursorNews(existingMap, runTime) {
  const news = [];
  try {
    console.log(`Scraping Cursor News...`);
    const res = await fetch('https://www.cursor.com/changelog');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const articles = doc.querySelectorAll('article');
    const uniqueUrls = new Set();
    const items = [];
    for (const article of articles) {
      const link = article.querySelector('h1 a');
      if (!link) continue;
      const url = `https://www.cursor.com${link.getAttribute('href')}`;
      if (uniqueUrls.has(url)) continue;
      uniqueUrls.add(url);
      items.push({ article, url, title: link.textContent.trim() });
    }

    for (const item of items.slice(0, MAX_ARTICLES_PER_SOURCE)) {
      const { article, url, title } = item;
      const id = url;
      if (existingMap.has(id)) continue;

      const timeEl = article.querySelector('time');
      let pubDate = runTime;
      if (timeEl) {
        const dt = timeEl.getAttribute('dateTime') || timeEl.getAttribute('datetime');
        if (dt) {
          const parsed = new Date(dt);
          if (!isNaN(parsed.getTime())) pubDate = parsed.toISOString();
        }
      }

      const content = article.textContent.trim();

      news.push(createArticle({
        id, title, content, url,
        category: 'IDE & 개발 도구', source: 'Cursor Changelog', author: 'Cursor Team',
        pubDate, fetchedAt: runTime, tags: ['Cursor', 'Editor'],
      }));
    }
  } catch (error) { console.error(`[ERROR] Failed to scrape Cursor:`, error.message); }
  return news;
}
