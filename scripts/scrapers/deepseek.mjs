import { unescapeHtml } from '../utils/scraper.mjs';
import { MAX_ARTICLES_PER_SOURCE, SUMMARY_LENGTH } from '../config/constants.mjs';

export async function scrapeDeepSeekNews(existingMap, runTime) {
  const deepseekNews = [];
  try {
    console.log(`Scraping DeepSeek Updates...`);
    const res = await fetch('https://api-docs.deepseek.com/updates');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    const sections = html.split('<h2 class="anchor anchorWithStickyNavbar_YAqC" id="date-');
    sections.shift();

    for (const section of sections.slice(0, MAX_ARTICLES_PER_SOURCE)) {
      const dateMatch = section.match(/Date:\s*([0-9\-]+)</);
      if (!dateMatch) continue;

      const id = `deepseek-${dateMatch[1]}`;
      if (existingMap.has(id)) continue;

      const pubDate = new Date(dateMatch[1]).toISOString();

      const h3Match = section.match(/<h3[^>]*>([^<]+)</);
      let title = 'DeepSeek Update';
      if (h3Match) {
        title = `DeepSeek Update: ${unescapeHtml(h3Match[1].trim())}`;
      }

      const pMatch = section.match(/<p>([\s\S]*?)<\/p>/);
      let content = 'DeepSeek model updates and API improvements.';
      if (pMatch) {
        content = pMatch[1].replace(/<[^>]*>?/gm, '').trim();
      }

      deepseekNews.push({
        id,
        title,
        summary: content.slice(0, SUMMARY_LENGTH),
        aiSummary: '',
        cleanContent: content,
        url: `https://api-docs.deepseek.com/updates#date-${dateMatch[1]}`,
        category: '인공지능',
        source: 'DeepSeek',
        author: 'DeepSeek AI',
        pubDate,
        fetchedAt: runTime,
        tags: ['DeepSeek', 'LLM', 'AI'],
      });
    }
  } catch (error) {
    console.error(`[ERROR] Failed to scrape DeepSeek:`, error.message);
  }
  return deepseekNews;
}
