import Parser from 'rss-parser';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

const parser = new Parser();

export function unescapeHtml(text) {
  if (!text) return text;
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8217;/g, '’')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”');
}

export async function fetchAndExtractArticle(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) return null;
    const html = await res.text();
    const doc = new JSDOM(html, { url });
    const reader = new Readability(doc.window.document);
    const article = reader.parse();
    return article ? article.textContent.trim() : null;
  } catch (error) {
    console.error(`[ERROR] Failed to fetch or extract article from ${url}:`, error.message);
    return null;
  }
}

export async function fetchRssFeeds(feeds, existingMap, kstMidnightUTC, runTime) {
  const newLatestNews = [];
  for (const feed of feeds) {
    try {
      console.log(`Fetching ${feed.name}...`);
      const parsed = await parser.parseURL(feed.url);
      const items = parsed.items.slice(0, 5);

      for (const item of items) {
        const id = item.guid || item.id || item.link || Math.random().toString(36).substring(7);

        if (existingMap.has(id)) {
          continue;
        }

        const itemPubDate = item.pubDate || item.isoDate || new Date().toISOString();
        if (new Date(itemPubDate).getTime() >= kstMidnightUTC) {
          console.log(`[INFO] Skipping today's article: ${item.title || 'No Title'}`);
          continue;
        }

        const title = unescapeHtml(item.title || 'No Title');
        const rawContent = unescapeHtml(item.contentSnippet || item.content || '');
        const cleanContent = rawContent.replace(/(<([^>]+)>)/gi, "");
        let summary = cleanContent.slice(0, 200);
        let finalContent = cleanContent;

        if (cleanContent.trim().length < 30) {
          console.log(`[INFO] Content too short for "${title}", attempting to crawl original link: ${item.link}`);
          const extractedText = await fetchAndExtractArticle(item.link);
          if (extractedText && extractedText.trim().length >= 30) {
            finalContent = extractedText;
            summary = finalContent.slice(0, 200);
            console.log(`[INFO] Successfully extracted ${extractedText.length} characters from original link.`);
          } else {
            console.log(`[WARN] Failed to extract meaningful content from original link or content is still too short.`);
          }
        }

        newLatestNews.push({
          id,
          title,
          summary,
          aiSummary: '',
          cleanContent: finalContent, // temporary field
          url: item.link,
          category: feed.category,
          source: feed.name,
          author: item.creator || item.author || feed.name,
          pubDate: itemPubDate,
          fetchedAt: runTime,
          tags: feed.tags
        });
      }
    } catch (err) {
      console.error(`[ERROR] Failed to fetch ${feed.name} (${feed.url}): ${err.message}`);
      continue;
    }
  }
  return newLatestNews;
}

export async function scrapeAnthropicNews(existingMap, runTime, kstMidnightUTC) {
  const anthropicNews = [];
  try {
    console.log(`Scraping Anthropic News...`);
    const res = await fetch('https://www.anthropic.com/news');
    const html = await res.text();

    const linkMatches = html.match(/href="\/news\/([^"]+)"/g);
    if (!linkMatches) return [];

    const slugs = Array.from(new Set(linkMatches.map(m => m.replace('href="/news/', '').replace('"', '')))).slice(0, 5);

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

      const itemTime = parsedDate ? new Date(parsedDate).getTime() : new Date().getTime();
      if (kstMidnightUTC && itemTime >= kstMidnightUTC) {
        console.log(`[INFO] Skipping today's article: ${title}`);
        continue;
      }

      const cleanContent = content.slice(0, 3000);
      const summary = cleanContent.slice(0, 200);

      anthropicNews.push({
        id,
        title,
        summary,
        aiSummary: '', // might be empty string, will be populated later if needed
        cleanContent, // temporary field for summary generation
        url,
        category: '인공지능',
        source: 'Anthropic News',
        author: 'Anthropic',
        pubDate: parsedDate || new Date().toISOString(),
        fetchedAt: runTime,
        tags: ['Anthropic', 'Claude', 'AI', 'LLM']
      });
    }
  } catch (err) {
    console.error(`[ERROR] Failed to scrape Anthropic: ${err.message}`);
  }
  return anthropicNews;
}

export async function scrapeDeepSeekNews(existingMap, runTime, kstMidnightUTC) {
  const deepseekNews = [];
  try {
    console.log(`Scraping DeepSeek Updates...`);
    const res = await fetch('https://api-docs.deepseek.com/updates');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    const sections = html.split('<h2 class="anchor anchorWithStickyNavbar_YAqC" id="date-');
    sections.shift();

    for (const section of sections.slice(0, 5)) {
      const dateMatch = section.match(/Date:\s*([0-9\-]+)</);
      if (!dateMatch) continue;

      const id = `deepseek-${dateMatch[1]}`;
      if (existingMap.has(id)) continue;

      const pubDate = new Date(dateMatch[1]).toISOString();
      if (kstMidnightUTC && new Date(pubDate).getTime() >= kstMidnightUTC) {
        console.log(`[INFO] Skipping today's update: deepseek-${dateMatch[1]}`);
        continue;
      }

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

      const summary = content.slice(0, 200);

      deepseekNews.push({
        id,
        title,
        summary,
        aiSummary: '',
        cleanContent: content, // temporary field
        url: `https://api-docs.deepseek.com/updates#date-${dateMatch[1]}`,
        category: '인공지능',
        source: 'DeepSeek',
        author: 'DeepSeek AI',
        pubDate,
        fetchedAt: runTime,
        tags: ['DeepSeek', 'LLM', 'AI']
      });
    }
  } catch (error) {
    console.error(`[ERROR] Failed to scrape DeepSeek:`, error.message);
  }
  return deepseekNews;
}
