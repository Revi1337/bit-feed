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

  const results = await Promise.all([
    fetchRssFeeds(FEEDS, existingMap, runTime),
    scrapeAnthropicNews(existingMap, runTime),
    scrapeDeepSeekNews(existingMap, runTime),
    scrapeViteNews(existingMap, runTime),
    scrapeBabelNews(existingMap, runTime),
    scrapeBunNews(existingMap, runTime)
  ]);

  const newLatestNews = results.flat();

  if (newLatestNews.length === 0) {
    console.log(`[INFO] No new articles found. Exiting without updating files.`);
    return;
  }

  // 2. AI Summarization Phase
  const tempPath = path.resolve(process.cwd(), 'public/data/temp.json');
  await processAiSummaries(newLatestNews, tempPath);

  // 3. Cleanup and Save
  newLatestNews.forEach(item => delete item.cleanContent);

  // Merge and sort ALL data
  const updatedAllNews = [...newLatestNews, ...existingNews];
  updatedAllNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // Save to all.json
  await fs.mkdir(path.dirname(newsPath), { recursive: true });
  await fs.writeFile(newsPath, JSON.stringify(updatedAllNews, null, 2), 'utf-8');
  console.log(`Successfully appended ${newLatestNews.length} articles to all.json. Total: ${updatedAllNews.length}`);

  // Save Top 50 to latest.json
  const top50 = updatedAllNews.slice(0, 50);
  await fs.writeFile(latestPath, JSON.stringify(top50, null, 2), 'utf-8');
  console.log(`Successfully saved top 50 articles to public/data/latest.json`);
}

async function main() {
  await fetchAllFeeds();
  process.exit(0);
}

main();
