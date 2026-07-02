import Parser from 'rss-parser';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { MAX_ARTICLES_PER_SOURCE, SUMMARY_LENGTH, CLEAN_CONTENT_LENGTH, BLOCKED_KEYWORDS } from '../config/constants.mjs';

const parser = new Parser({
  customFields: {
    item: [['dc:subject', 'subject']]
  }
});

function annotateLinks(doc) {
  doc.querySelectorAll('a').forEach(a => {
    if (a.href && !a.textContent.includes(a.href)) {
      a.textContent = `${a.textContent} (${a.href})`;
    }
  });
}

export function createArticle({ id, title, content, url, category, source, author, pubDate, fetchedAt, tags }) {
  return {
    id,
    title,
    summary: content.slice(0, SUMMARY_LENGTH),
    aiSummary: '',
    cleanContent: content.slice(0, CLEAN_CONTENT_LENGTH),
    url,
    category,
    source,
    author,
    pubDate,
    fetchedAt,
    tags,
  };
}

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

export function stripHtmlAndPreserveLinks(html) {
  if (!html) return '';
  try {
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    annotateLinks(doc);
    return doc.body.textContent.trim();
  } catch (error) {
    return html.replace(/(<([^>]+)>)/gi, "").trim();
  }
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

    annotateLinks(doc.window.document);

    const reader = new Readability(doc.window.document);
    const article = reader.parse();
    return article ? article.textContent.trim() : null;
  } catch (error) {
    console.error(`[ERROR] Failed to fetch or extract article from ${url}:`, error.message);
    return null;
  }
}

export async function fetchRssFeeds(feeds, existingMap, runTime) {
  const newLatestNews = [];
  for (const feed of feeds) {
    console.log(`Fetching ${feed.name}...`);

    let parsed;
    try {
      parsed = await parser.parseURL(feed.url);
    } catch (err) {
      try {
        const res = await fetch(feed.url);
        if (res.headers.get('content-encoding')?.includes('gzip')) {
          console.log(`[INFO] Retrying ${feed.name} with gzip fallback...`);
          parsed = await parser.parseString(await res.text());
        } else {
          console.error(`[ERROR] Failed to fetch ${feed.name} (${feed.url}): ${err.message}`);
          continue;
        }
      } catch (innerErr) {
        console.error(`[ERROR] Failed to fetch ${feed.name} (${feed.url}): ${innerErr.message}`);
        continue;
      }
    }

    try {
      let items = parsed.items;
      if (feed.allowedCategories) {
        items = items.filter(item => {
          let itemCategories = item.categories || [];
          if (item.subject) {
            const subjects = item.subject.split(',').map(s => s.trim()).filter(Boolean);
            itemCategories = itemCategories.concat(subjects);
          }
          return itemCategories.some(cat => {
            const catStr = typeof cat === 'string' ? cat : String(cat._ || cat);
            return feed.allowedCategories.some(allowed => catStr.toLowerCase() === allowed.toLowerCase());
          });
        });
      }
      items = items.slice(0, MAX_ARTICLES_PER_SOURCE);

      for (const item of items) {
        const id = item.guid || item.id || item.link || Math.random().toString(36).substring(7);

        if (existingMap.has(id)) {
          continue;
        }

        let itemPubDate = item.pubDate || item.isoDate || runTime;
        let pubTime = new Date(itemPubDate).getTime();
        if (isNaN(pubTime) || pubTime > new Date(runTime).getTime()) {
          itemPubDate = runTime;
        }
        itemPubDate = new Date(itemPubDate).toISOString();

        const title = unescapeHtml(item.title || 'No Title');
        const titleLower = title.toLowerCase();

        if (BLOCKED_KEYWORDS.some(kw => kw instanceof RegExp ? kw.test(title) : titleLower.includes(kw))) {
          console.log(`[INFO] Skipping noise article: "${title}"`);
          continue;
        }

        const rawContent = unescapeHtml(item.contentSnippet || item.content || '');
        const cleanContent = stripHtmlAndPreserveLinks(rawContent);
        let summary = cleanContent.slice(0, SUMMARY_LENGTH);
        let finalContent = cleanContent;

        if (cleanContent.trim().length < 30) {
          console.log(`[INFO] Content too short for "${title}", attempting to crawl original link: ${item.link}`);
          const extractedText = await fetchAndExtractArticle(item.link);
          if (extractedText && extractedText.trim().length >= 30) {
            finalContent = extractedText;
            summary = finalContent.slice(0, SUMMARY_LENGTH);
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
          cleanContent: finalContent,
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
      console.error(`[ERROR] Failed to process ${feed.name}: ${err.message}`);
    }
  }
  return newLatestNews;
}
