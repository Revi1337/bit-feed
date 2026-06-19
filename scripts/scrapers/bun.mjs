import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { createArticle } from '../utils/scraper.mjs';
import { MAX_ARTICLES_PER_SOURCE } from '../config/constants.mjs';

export async function scrapeBunNews(existingMap, runTime) {
  const news = [];
  try {
    console.log(`Scraping Bun News...`);
    const res = await fetch('https://bun.sh/blog');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const links = doc.querySelectorAll('a[href^="/blog/"]');

    const uniqueUrls = new Set();
    const items = [];
    for (const a of links) {
      if (uniqueUrls.has(a.href)) continue;
      uniqueUrls.add(a.href);
      items.push(a);
    }

    for (const a of items.slice(0, MAX_ARTICLES_PER_SOURCE)) {
      const url = `https://bun.sh${a.href}`;
      let title = a.textContent.trim().split('\n')[0];
      const id = url;
      if (existingMap.has(id)) continue;

      const contentHtmlRes = await fetch(url);
      if (!contentHtmlRes.ok) continue;
      const contentHtml = await contentHtmlRes.text();
      const contentDom = new JSDOM(contentHtml, { url });
      const contentDoc = contentDom.window.document;

      const timeEl = contentDoc.querySelector('time');
      const pubDate = timeEl && timeEl.getAttribute('datetime') ? new Date(timeEl.getAttribute('datetime')).toISOString() : new Date().toISOString();

      const reader = new Readability(contentDoc);
      const article = reader.parse();
      const content = article ? article.textContent.trim() : null;
      if (!content) continue;

      if (article && article.title) title = article.title;

      news.push(createArticle({
        id, title, content, url,
        category: '웹 생태계 & 브라우저', source: 'Bun Blog', author: 'Bun Team',
        pubDate, fetchedAt: runTime, tags: ['Bun', 'Runtime', 'Build Tool'],
      }));
    }
  } catch (error) { console.error(`[ERROR] Failed to scrape Bun:`, error.message); }
  return news;
}
