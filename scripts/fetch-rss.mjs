import fs from 'fs/promises';
import path from 'path';
import * as dotenv from 'dotenv';
import { FEEDS } from './config/feeds.mjs';
import { CUSTOM_SCRAPERS } from './config/scrapers.mjs';
import { fetchRssFeeds } from './utils/scraper.mjs';
import { processAiSummaries } from './utils/ai.mjs';
import { ROLLING_WINDOW_DAYS } from './config/constants.mjs';

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
    ...CUSTOM_SCRAPERS.map(fn => fn(existingMap, runTime)),
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
  newLatestNews.forEach(item => {
    if (item.aiSummary && !item.aiSummary.includes("AI 요약을 생성하는 중 오류가 발생했습니다")) {
      delete item.cleanContent;
    }
  });

  // Merge and sort ALL data
  const updatedAllNews = [...newLatestNews, ...existingNews];
  updatedAllNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // Save to all.json
  await fs.mkdir(path.dirname(newsPath), { recursive: true });
  await fs.writeFile(newsPath, JSON.stringify(updatedAllNews, null, 2), 'utf-8');
  console.log(`Successfully appended ${newLatestNews.length} articles to all.json. Total: ${updatedAllNews.length}`);

  // Save recent N days to latest.json
  const windowMs = ROLLING_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const recentItems = updatedAllNews.filter(item => {
    const pubTime = new Date(item.pubDate).getTime();
    return pubTime >= Date.now() - windowMs;
  });

  await fs.writeFile(latestPath, JSON.stringify(recentItems, null, 2), 'utf-8');
  console.log(`Successfully saved ${recentItems.length} recent articles (last ${ROLLING_WINDOW_DAYS} days) to public/data/latest.json`);

  // Remove temp file after successful save
  try { await fs.unlink(tempPath); } catch {}
}

async function main() {
  await fetchAllFeeds();
  process.exit(0);
}

main();
