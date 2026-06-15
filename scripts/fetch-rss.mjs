import fs from 'fs/promises';
import path from 'path';
import * as dotenv from 'dotenv';
import { FEEDS } from './config/feeds.mjs';
import { fetchRssFeeds, scrapeAnthropicNews, scrapeDeepSeekNews, scrapeViteNews, scrapeBabelNews, scrapeBunNews } from './utils/scraper.mjs';
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

  // 1. Fetching Phase
  const existingMap = new Map(existingNews.map(n => [n.id, n]));
  const runTime = new Date().toISOString();

  const now = new Date();
  const kstTime = now.getTime() + 9 * 60 * 60 * 1000;
  const kstDate = new Date(kstTime);
  const kstMidnightUTC = Date.UTC(kstDate.getUTCFullYear(), kstDate.getUTCMonth(), kstDate.getUTCDate()) - 9 * 60 * 60 * 1000;

  const results = await Promise.all([
    fetchRssFeeds(FEEDS, existingMap, kstMidnightUTC, runTime),
    scrapeAnthropicNews(existingMap, runTime, kstMidnightUTC),
    scrapeDeepSeekNews(existingMap, runTime, kstMidnightUTC),
    scrapeViteNews(existingMap, runTime, kstMidnightUTC),
    scrapeBabelNews(existingMap, runTime, kstMidnightUTC),
    scrapeBunNews(existingMap, runTime, kstMidnightUTC)
  ]);

  const newLatestNews = results.flat();

  if (newLatestNews.length === 0) {
    console.log(`[INFO] No new articles found. Exiting without updating files.`);
    return;
  }

  // 2. AI Summarization Phase
  await processAiSummaries(newLatestNews, latestPath);

  // 3. Cleanup and Save
  newLatestNews.forEach(item => delete item.cleanContent);
  newLatestNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // Save to latest.json
  await fs.writeFile(latestPath, JSON.stringify(newLatestNews, null, 2), 'utf-8');
  console.log(`Successfully saved ${newLatestNews.length} newly fetched articles to public/data/latest.json`);

  // Append to all.json
  const updatedAllNews = [...newLatestNews, ...existingNews];
  updatedAllNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  await fs.mkdir(path.dirname(newsPath), { recursive: true });
  await fs.writeFile(newsPath, JSON.stringify(updatedAllNews, null, 2), 'utf-8');
  console.log(`Successfully appended ${newLatestNews.length} articles to all.json. Total: ${updatedAllNews.length}`);
}

async function main() {
  await fetchAllFeeds();
  process.exit(0);
}

main();
