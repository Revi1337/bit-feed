import { unescapeHtml, createArticle } from '../utils/scraper.mjs';
import { MAX_ARTICLES_PER_SOURCE } from '../config/constants.mjs';

export async function scrapeAnthropicNews(existingMap, runTime) {
  const anthropicNews = [];
  try {
    console.log(`Scraping Anthropic News...`);
    const res = await fetch('https://www.anthropic.com/news');
    const html = await res.text();

    const linkMatches = html.match(/href="\/news\/([^"]+)"/g);
    if (!linkMatches) return [];

    const slugs = Array.from(new Set(linkMatches.map(m => m.replace('href="/news/', '').replace('"', '')))).slice(0, MAX_ARTICLES_PER_SOURCE);

    for (const slug of slugs) {
      const url = `https://www.anthropic.com/news/${slug}`;
      const id = url;

      if (existingMap.has(id)) continue;

      let title = 'No Title';
      let content = '';
      let parsedDate = null;

      try {
        const articleRes = await fetch(url);
        const articleHtml = await articleRes.text();

        const titleMatch = articleHtml.match(/<title>(.*?)<\/title>/);
        if (titleMatch) {
          title = unescapeHtml(titleMatch[1].replace(' \\ Anthropic', '').replace('Newsroom \\ ', '').trim());
        }

        const dateMatch = articleHtml.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2}, \d{4}/i);
        if (dateMatch) {
          const parsed = new Date(dateMatch[0]);
          if (!isNaN(parsed.getTime())) {
            parsedDate = parsed.toISOString();
          }
        }

        const pMatches = articleHtml.match(/<p[^>]*>(.*?)<\/p>/g);
        if (pMatches) {
          content = pMatches.map(p => p.replace(/(<([^>]+)>)/gi, "")).join(" ");
        }
      } catch (err) {
        console.error(`[ERROR] Failed to fetch Anthropic article ${url}`);
        continue;
      }

      anthropicNews.push(createArticle({
        id,
        title,
        content,
        url,
        category: '인공지능',
        source: 'Anthropic News',
        author: 'Anthropic',
        pubDate: parsedDate || new Date().toISOString(),
        fetchedAt: runTime,
        tags: ['Anthropic', 'Claude', 'AI', 'LLM'],
      }));
    }
  } catch (err) {
    console.error(`[ERROR] Failed to scrape Anthropic: ${err.message}`);
  }
  return anthropicNews;
}
