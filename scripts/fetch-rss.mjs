import fs from 'fs/promises';
import path from 'path';
import Parser from 'rss-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import pLimit from 'p-limit';

dotenv.config();

function unescapeHtml(text) {
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

const parser = new Parser();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

const FEEDS = [
  // 프로그래밍 언어
  { name: 'The Go Blog', url: 'https://go.dev/blog/feed.atom', category: '프로그래밍 언어', tags: ['Go'] },
  { name: 'Python Insider', url: 'https://blog.python.org/feeds/posts/default', category: '프로그래밍 언어', tags: ['Python'] },
  { name: 'Rust Blog', url: 'https://blog.rust-lang.org/feed.xml', category: '프로그래밍 언어', tags: ['Rust'] },
  { name: 'TypeScript Blog', url: 'https://devblogs.microsoft.com/typescript/feed/', category: '프로그래밍 언어', tags: ['TypeScript', 'JS'] },
  { name: 'Inside Java', url: 'https://inside.java/feed.xml', category: '프로그래밍 언어', tags: ['Java'] },
  { name: 'Ruby News', url: 'https://www.ruby-lang.org/en/feeds/news.rss', category: '프로그래밍 언어', tags: ['Ruby'] },
  { name: 'ISO C++', url: 'https://isocpp.org/blog/rss', category: '프로그래밍 언어', tags: ['C++'] },
  { name: 'PHP News', url: 'https://www.php.net/feed.atom', category: '프로그래밍 언어', tags: ['PHP'] },
  { name: '.NET Blog', url: 'https://devblogs.microsoft.com/dotnet/feed/', category: '프로그래밍 언어', tags: ['C#', '.NET'] },
  { name: 'Swift Blog', url: 'https://www.swift.org/atom.xml', category: '프로그래밍 언어', tags: ['Swift', 'Apple'] },
  { name: 'Flutter Blog', url: 'https://medium.com/feed/flutter', category: '프로그래밍 언어', tags: ['Flutter', 'Dart'] },

  // 프론트엔드
  { name: 'Vue.js Blog', url: 'https://blog.vuejs.org/feed.rss', category: '프론트엔드', tags: ['Vue'] },
  { name: 'React Blog', url: 'https://react.dev/rss.xml', category: '프론트엔드', tags: ['React'] },
  { name: 'Angular Blog', url: 'https://blog.angular.dev/feed', category: '프론트엔드', tags: ['Angular'] },
  { name: 'Next.js Blog', url: 'https://nextjs.org/feed.xml', category: '프론트엔드', tags: ['Next.js', 'React'] },
  { name: 'Svelte Blog', url: 'https://svelte.dev/blog/rss.xml', category: '프론트엔드', tags: ['Svelte'] },
  { name: 'Astro Blog', url: 'https://astro.build/rss.xml', category: '프론트엔드', tags: ['Astro'] },
  { name: 'Tailwind CSS', url: 'https://tailwindcss.com/feeds/feed.xml', category: '프론트엔드', tags: ['Tailwind', 'CSS'] },

  // 백엔드
  { name: 'Spring Engineering', url: 'https://spring.io/blog/category/engineering.atom', category: '백엔드', tags: ['Spring', 'Java'] },
  { name: 'Spring Releases', url: 'https://spring.io/blog/category/releases.atom', category: '백엔드', tags: ['Spring', 'Java'] },
  { name: 'Spring News', url: 'https://spring.io/blog/category/news.atom', category: '백엔드', tags: ['Spring', 'Java'] },
  { name: 'Node.js Blog', url: 'https://nodejs.org/en/feed/blog.xml', category: '백엔드', tags: ['Node.js', 'JS'] },
  { name: 'Django Weblog', url: 'https://www.djangoproject.com/rss/weblog/', category: '백엔드', tags: ['Django', 'Python'] },
  { name: 'Flask Blog (Pallets)', url: 'https://palletsprojects.com/blog/feed.xml', category: '백엔드', tags: ['Flask', 'Python'] },
  { name: 'FastAPI Releases', url: 'https://github.com/fastapi/fastapi/releases.atom', category: '백엔드', tags: ['FastAPI', 'Python'] },
  { name: 'NestJS Releases', url: 'https://github.com/nestjs/nest/releases.atom', category: '백엔드', tags: ['NestJS', 'Node.js', 'TS'] },
  { name: 'ASP.NET Core', url: 'https://devblogs.microsoft.com/dotnet/category/aspnet/feed/', category: '백엔드', tags: ['ASP.NET', 'C#', '.NET'] },
  { name: 'Laravel News', url: 'https://laravel-news.com/feed', category: '백엔드', tags: ['Laravel', 'PHP'] },
  { name: 'Ruby on Rails', url: 'https://rubyonrails.org/feed.xml', category: '백엔드', tags: ['Rails', 'Ruby'] },

  // 데이터베이스 (DBMS & NoSQL)
  { name: 'PostgreSQL News', url: 'https://www.postgresql.org/news.rss', category: '데이터베이스', tags: ['PostgreSQL', 'SQL'] },
  { name: 'MySQL Blog (Percona)', url: 'https://www.percona.com/blog/feed/', category: '데이터베이스', tags: ['MySQL', 'Database'] },
  { name: 'MongoDB Blog', url: 'https://www.mongodb.com/blog/rss', category: '데이터베이스', tags: ['MongoDB', 'NoSQL'] },
  { name: 'Redis Blog', url: 'https://redis.io/feed', category: '데이터베이스', tags: ['Redis', 'NoSQL', 'Cache'] },
  { name: 'Elastic Blog', url: 'https://www.elastic.co/blog/feed', category: '데이터베이스', tags: ['ElasticSearch', 'NoSQL'] },
  { name: 'Supabase Blog', url: 'https://supabase.com/rss.xml', category: '데이터베이스', tags: ['Supabase', 'PostgreSQL', 'BaaS'] },
  { name: 'Firebase Blog', url: 'https://firebase.blog/rss.xml', category: '데이터베이스', tags: ['Firebase', 'NoSQL', 'BaaS'] },
  { name: 'Apollo GraphQL', url: 'https://www.apollographql.com/blog/rss.xml', category: '데이터베이스', tags: ['GraphQL', 'Apollo'] },

  // 인프라 & 데브옵스
  { name: 'Docker Blog', url: 'https://www.docker.com/blog/feed/', category: '인프라', tags: ['Docker', 'Infra'] },
  { name: 'Kubernetes Blog', url: 'https://kubernetes.io/feed.xml', category: '인프라', tags: ['Kubernetes', 'Infra'] },

  // 인공지능
  { name: 'Google DeepMind', url: 'https://deepmind.google/blog/rss.xml', category: '인공지능', tags: ['DeepMind', 'Gemini', 'AI'] },
  { name: 'OpenAI News', url: 'https://openai.com/news/rss.xml', category: '인공지능', tags: ['OpenAI', 'LLM', 'AI'] },
  { name: 'Ollama Blog', url: 'https://ollama.com/blog/rss.xml', category: '인공지능', tags: ['Ollama', 'LLM', 'Local AI'] },
  { name: 'Qwen Blog', url: 'https://qwenlm.github.io/blog/index.xml', category: '인공지능', tags: ['Qwen', 'LLM', 'Alibaba'] }
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function generateAISummary(title, content) {
  if (!process.env.GEMINI_API_KEY) return "API Key가 설정되지 않아 AI 요약을 생성할 수 없습니다.";
  if (!content || content.trim().length < 30) return "본문이 제공되지 않은 기사입니다.";

  let attempt = 0;
  const maxRetries = 3;
  const baseDelay = 2000;

  while (attempt < maxRetries) {
    try {
      const prompt = `당신은 IT 뉴스 기사를 요약하는 전문 AI입니다. 
다음 기사 제목과 본문을 바탕으로 핵심 내용을 한국어로 요약해 줘.

[엄격한 규칙]
1. "제공해주신 내용은...", "다음과 같습니다", "요약해 드리겠습니다", "요약:" 같은 대화형 문구, 인사말, 서론, 결론을 절대 포함하지 마라. 오직 요약 내용만 출력해라.
2. 마크다운 기호(**, #, *, - 등)를 절대 사용하지 말고, 오직 순수한 평문(Plain text)으로만 출력해라.
3. 기사의 분량과 심도에 비례하여 요약의 길이를 동적으로 조절해라. 가벼운 내용이라면 2~3문장으로 짧게, 기술적으로 깊고 방대한 내용이라면 줄바꿈과 여러 문단을 적극 활용하여 상세히 요약해라.
4. 모든 문장의 끝마맺음은 반드시 정중한 존댓말("~합니다.", "~입니다." 등)로 통일해라.

제목: ${title}

본문:
${content.slice(0, 15000)}
`;
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      attempt++;
      console.error(`AI Summary failed for "${title}" (Attempt ${attempt}/${maxRetries}):`, error.message);

      if (attempt >= maxRetries) {
        return "AI 요약을 생성하는 중 오류가 발생했습니다.";
      }

      // Exponential backoff with jitter
      const jitter = Math.random() * 1000;
      const delay = (baseDelay * Math.pow(2, attempt - 1)) + jitter;
      console.log(`Waiting ${Math.round(delay)}ms before retry...`);
      await sleep(delay);
    }
  }
}

async function scrapeAnthropicNews(existingMap, runTime) {
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

      try {
        const articleRes = await fetch(url);
        const articleHtml = await articleRes.text();

        const titleMatch = articleHtml.match(/<title>(.*?)<\/title>/);
        if (titleMatch) {
          title = unescapeHtml(titleMatch[1].replace(' \\ Anthropic', '').replace('Newsroom \\ ', '').trim());
        }

        const pMatches = articleHtml.match(/<p[^>]*>(.*?)<\/p>/g);
        if (pMatches) {
          content = pMatches.map(p => p.replace(/(<([^>]+)>)/gi, "")).join(" ");
        }
      } catch (err) {
        console.error(`[ERROR] Failed to fetch Anthropic article ${url}`);
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
        pubDate: new Date().toISOString(),
        fetchedAt: runTime,
        tags: ['Anthropic', 'Claude', 'AI', 'LLM']
      });
    }
  } catch (err) {
    console.error(`[ERROR] Failed to scrape Anthropic: ${err.message}`);
  }
  return anthropicNews;
}

async function scrapeDeepSeekNews(existingMap, runTime) {
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

async function fetchAllFeeds() {
  const newsPath = path.resolve(process.cwd(), 'public/data/news.json');
  const latestPath = path.resolve(process.cwd(), 'public/data/latest.json');

  let existingNews = [];
  try {
    const fileData = await fs.readFile(newsPath, 'utf-8');
    existingNews = JSON.parse(fileData);
  } catch (e) {
    // File might not exist
  }

  let latestNewsData = [];
  try {
    const fileData = await fs.readFile(latestPath, 'utf-8');
    latestNewsData = JSON.parse(fileData);
  } catch (e) {
    // File might not exist
  }

  // 1. Merge latest into existingNews
  const mergedMap = new Map();
  [...existingNews, ...latestNewsData].forEach(item => {
    mergedMap.set(item.id, item);
  });
  existingNews = Array.from(mergedMap.values());
  existingNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // Save the merged news.json right away
  await fs.mkdir(path.dirname(newsPath), { recursive: true });
  await fs.writeFile(newsPath, JSON.stringify(existingNews, null, 2), 'utf-8');
  console.log(`Archived ${existingNews.length} articles to news.json`);

  // 2. Clear latest.json in memory and start fetching new items
  const newLatestNews = [];
  const existingMap = new Map(existingNews.map(n => [n.id, n]));
  const runTime = new Date().toISOString();

  // Phase 1: Fetch all RSS and HTML data quickly
  for (const feed of FEEDS) {
    try {
      console.log(`Fetching ${feed.name}...`);
      const parsed = await parser.parseURL(feed.url);
      const items = parsed.items.slice(0, 5);

      for (const item of items) {
        const id = item.guid || item.id || item.link || Math.random().toString(36).substring(7);

        if (existingMap.has(id)) {
          continue;
        }

        const title = unescapeHtml(item.title || 'No Title');
        const rawContent = unescapeHtml(item.contentSnippet || item.content || '');
        const cleanContent = rawContent.replace(/(<([^>]+)>)/gi, "");
        const summary = cleanContent.slice(0, 200);

        newLatestNews.push({
          id,
          title,
          summary,
          aiSummary: '',
          cleanContent, // temporary field
          url: item.link,
          category: feed.category,
          source: feed.name,
          author: item.creator || item.author || feed.name,
          pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
          fetchedAt: runTime,
          tags: feed.tags
        });
      }
    } catch (err) {
      console.error(`[ERROR] Failed to fetch ${feed.name} (${feed.url}): ${err.message}`);
      continue;
    }
  }

  const anthropicResults = await scrapeAnthropicNews(existingMap, runTime);
  newLatestNews.push(...anthropicResults);

  const deepseekResults = await scrapeDeepSeekNews(existingMap, runTime);
  newLatestNews.push(...deepseekResults);

  // Phase 2: Process AI Summaries with Concurrency Control
  console.log('--- Phase 2: AI Summarization ---');
  const itemsToSummarize = newLatestNews.filter(n => !n.aiSummary);
  console.log(`Found ${itemsToSummarize.length} items needing AI summaries.`);

  const limit = pLimit(1); // 1 concurrent request (Metronome strategy)

  let completed = 0;
  await Promise.all(itemsToSummarize.map(item => limit(async () => {
    console.log(`Generating AI summary for: ${item.title}`);
    item.aiSummary = await generateAISummary(item.title, item.cleanContent);
    completed++;
    if (completed % 10 === 0) {
      console.log(`Progress: ${completed}/${itemsToSummarize.length}`);
      // Incremental save so UI doesn't look blank
      const tempNews = [...newLatestNews];
      tempNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      await fs.writeFile(latestPath, JSON.stringify(tempNews, null, 2), 'utf-8');
    }
    await sleep(4100); // Strict 4.1s delay to perfectly align with 15 requests per minute limit
  })));

  // Cleanup temporary fields and sort
  newLatestNews.forEach(item => delete item.cleanContent);
  newLatestNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  await fs.writeFile(latestPath, JSON.stringify(newLatestNews, null, 2), 'utf-8');
  console.log(`Successfully saved ${newLatestNews.length} newly fetched articles to public/data/latest.json`);
}

main();

async function main() {
  await fetchAllFeeds();
  process.exit(0);
}
