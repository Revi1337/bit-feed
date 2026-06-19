import { JSDOM } from 'jsdom';
import { fetchAndExtractArticle, createArticle } from '../utils/scraper.mjs';
import { MAX_ARTICLES_PER_SOURCE } from '../config/constants.mjs';

export async function scrapeSublimeNews(existingMap, runTime) {
  const news = [];
  try {
    console.log(`Scraping Sublime Text News...`);
    const res = await fetch('https://www.sublimetext.com/blog');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const links = doc.querySelectorAll('.post h2 a, article h2 a');

    const uniqueUrls = new Set();
    const items = [];
    for (const a of links) {
      if (uniqueUrls.has(a.href)) continue;
      uniqueUrls.add(a.href);
      items.push(a);
    }

    for (const a of items.slice(0, MAX_ARTICLES_PER_SOURCE)) {
      const url = `https://www.sublimetext.com${a.href}`;
      const title = a.textContent.trim();
      const id = url;
      if (existingMap.has(id)) continue;

      const content = await fetchAndExtractArticle(url);
      if (!content) continue;

      const dateEl = a.closest('article, .post')?.querySelector('.date, time');
      let pubDate = runTime;
      if (dateEl) {
        const parsed = new Date(dateEl.getAttribute('datetime') || dateEl.textContent.trim());
        if (!isNaN(parsed.getTime())) pubDate = parsed.toISOString();
      }

      news.push(createArticle({
        id, title, content, url,
        category: 'IDE & 개발 도구', source: 'Sublime Text Blog', author: 'Sublime HQ',
        pubDate, fetchedAt: runTime, tags: ['Sublime Text', 'Editor'],
      }));
    }
  } catch (error) { console.error(`[ERROR] Failed to scrape Sublime Text:`, error.message); }
  return news;
}
