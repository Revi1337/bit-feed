import fs from 'fs/promises';
import path from 'path';
import Parser from 'rss-parser';

const parser = new Parser();

const FEEDS = [
  // 프로그래밍 언어
  { name: 'The Go Blog', url: 'https://go.dev/blog/feed.atom', category: '프로그래밍 언어', tags: ['Go'] },
  
  // 프론트엔드
  { name: 'Vue.js Blog', url: 'https://blog.vuejs.org/feed.rss', category: '프론트엔드', tags: ['Vue'] },
  
  // 백엔드
  { name: 'Spring Blog', url: 'https://spring.io/blog.atom', category: '백엔드', tags: ['Spring', 'Java'] },
  
  // 인공지능
  { name: 'Google AI Blog', url: 'https://blog.google/technology/ai/rss/', category: '인공지능', tags: ['Google', 'AI'] },
  
  // 보안
  { name: 'Cloudflare Blog', url: 'https://blog.cloudflare.com/rss/', category: '보안', tags: ['Security', 'Cloudflare'] }
];

async function fetchAllFeeds() {
  const allNews = [];
  
  for (const feed of FEEDS) {
    try {
      console.log(`Fetching ${feed.name}...`);
      const parsed = await parser.parseURL(feed.url);
      
      const items = parsed.items.slice(0, 10).map(item => {
        // Fallback for ID and title
        const id = item.guid || item.id || item.link || Math.random().toString(36).substring(7);
        
        return {
          id,
          title: item.title || 'No Title',
          summary: (item.contentSnippet || item.content || '').replace(/(<([^>]+)>)/gi, "").slice(0, 200),
          url: item.link,
          category: feed.category,
          source: feed.name,
          author: item.creator || item.author || feed.name,
          pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
          tags: feed.tags
        };
      });
      
      allNews.push(...items);
    } catch (err) {
      console.error(`[ERROR] Failed to fetch ${feed.name} (${feed.url}): ${err.message}`);
      // Exception Handling Agent rule: Fallback to empty array or continue
      continue;
    }
  }

  // Sort by pubDate descending
  allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  
  const outputPath = path.resolve(process.cwd(), 'public/data/news.json');
  await fs.writeFile(outputPath, JSON.stringify(allNews, null, 2), 'utf-8');
  console.log(`Successfully saved ${allNews.length} articles to public/data/news.json`);
}

fetchAllFeeds();
