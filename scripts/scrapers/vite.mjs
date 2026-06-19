import { JSDOM } from 'jsdom';
import { fetchAndExtractArticle, createArticle } from '../utils/scraper.mjs';
import { MAX_ARTICLES_PER_SOURCE } from '../config/constants.mjs';

export async function scrapeViteNews(existingMap, runTime) {
  const news = [];
  try {
    console.log(`Scraping Vite News...`);
    const res = await fetch('https://vite.dev/blog/');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const links = doc.querySelectorAll('main a[href^="/blog/"]');

    const uniqueUrls = new Set();
    const items = [];
    for (const a of links) {
      if (uniqueUrls.has(a.href)) continue;
      uniqueUrls.add(a.href);
      items.push(a);
    }

    for (const a of items.slice(0, MAX_ARTICLES_PER_SOURCE)) {
      const url = `https://vite.dev${a.href}`;
      const title = a.textContent.trim();
      const id = url;
      if (existingMap.has(id)) continue;

      const timeEl = a.closest('div, article, section')?.querySelector('time');
      const pubDate = timeEl && timeEl.getAttribute('datetime') ? new Date(timeEl.getAttribute('datetime')).toISOString() : new Date().toISOString();

      const content = await fetchAndExtractArticle(url);
      if (!content) continue;

      news.push(createArticle({
        id, title, content, url,
        category: '프론트엔드', source: 'Vite Blog', author: 'Vite Team',
        pubDate, fetchedAt: runTime, tags: ['Vite', 'Build'],
      }));
    }
  } catch (error) { console.error(`[ERROR] Failed to scrape Vite:`, error.message); }
  return news;
}
