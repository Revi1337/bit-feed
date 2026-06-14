import fs from 'fs/promises';
import path from 'path';
import * as dotenv from 'dotenv';
import { FEEDS } from './config/feeds.mjs';
import { fetchRssFeeds, scrapeAnthropicNews, scrapeDeepSeekNews } from './utils/scraper.mjs';
import { processAiSummaries } from './utils/ai.mjs';

dotenv.config();

async function fetchAllFeeds() {
  const newsPath = path.resolve(process.cwd(), 'public/data/all.json');
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

  // 1. Archiving
  const mergedMap = new Map();
  [...existingNews, ...latestNewsData].forEach(item => {
    mergedMap.set(item.id, item);
  });
  existingNews = Array.from(mergedMap.values());
  existingNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  await fs.mkdir(path.dirname(newsPath), { recursive: true });
  await fs.writeFile(newsPath, JSON.stringify(existingNews, null, 2), 'utf-8');
  console.log(`Archived ${existingNews.length} articles to all.json`);

  // 2. Fetching Phase
  const existingMap = new Map(existingNews.map(n => [n.id, n]));
  const runTime = new Date().toISOString();

  const now = new Date();
  const kstTime = now.getTime() + 9 * 60 * 60 * 1000;
  const kstDate = new Date(kstTime);
  const kstMidnightUTC = Date.UTC(kstDate.getUTCFullYear(), kstDate.getUTCMonth(), kstDate.getUTCDate()) - 9 * 60 * 60 * 1000;

  const rssResults = await fetchRssFeeds(FEEDS, existingMap, kstMidnightUTC, runTime);
  const anthropicResults = await scrapeAnthropicNews(existingMap, runTime, kstMidnightUTC);
  const deepseekResults = await scrapeDeepSeekNews(existingMap, runTime, kstMidnightUTC);
  
  const newLatestNews = [...rssResults, ...anthropicResults, ...deepseekResults];

  // 3. AI Summarization Phase
  await processAiSummaries(newLatestNews, latestPath);

  // 4. Cleanup and Save
  newLatestNews.forEach(item => delete item.cleanContent);
  newLatestNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  await fs.writeFile(latestPath, JSON.stringify(newLatestNews, null, 2), 'utf-8');
  console.log(`Successfully saved ${newLatestNews.length} newly fetched articles to public/data/latest.json`);
}

async function main() {
  await fetchAllFeeds();
  process.exit(0);
}

main();
