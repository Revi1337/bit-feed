import fs from 'fs/promises';
import path from 'path';
import * as dotenv from 'dotenv';
import { FEEDS } from '../config/feeds.mjs';
import { fetchRssFeeds, scrapeAnthropicNews, scrapeDeepSeekNews } from '../utils/scraper.mjs';
import { processAiSummaries } from '../utils/ai.mjs';

dotenv.config();

/**
 * 중간 단계(요약 및 임시 저장) 테스트용 스크립트
 * 
 * [제작 배경]
 * 메인 파이프라인(`fetch-rss.mjs`) 전체를 돌리기에는 시간이 오래 걸리기 때문에,
 * 수집 및 요약(1~3단계)이 정상적으로 동작하는지, 10개 단위로 파일에 중간 저장되는지만 
 * 빠르고 안전하게 확인하기 위해 파이프라인의 일부 로직만 추출하여 제작되었습니다.
 * 
 * [용도]
 * 4단계(불필요한 데이터 삭제 및 전체 덮어쓰기) 최종 저장 로직을 고의로 생략하여,
 * 오직 메모리 수집 후 AI 요약을 수행하며 10개 단위마다 임시 저장하는 로직의 동작성능만을 테스트합니다.
 * 주의: 끝까지 실행되어도 마지막 자투리 요약은 파일에 저장되지 않습니다.
 */
async function main() {
  const latestPath = path.resolve(process.cwd(), 'public/data/latest.json');

  // 기존 데이터 없이 전부 새로 수집한다고 가정
  const existingMap = new Map();
  const runTime = new Date().toISOString();

  const now = new Date();
  const kstTime = now.getTime() + 9 * 60 * 60 * 1000;
  const kstDate = new Date(kstTime);
  const kstMidnightUTC = Date.UTC(kstDate.getUTCFullYear(), kstDate.getUTCMonth(), kstDate.getUTCDate()) - 9 * 60 * 60 * 1000;

  console.log(`[임시 테스트] 1. scraper.mjs 를 통해 메모리로 수집 시작...`);
  const rssResults = await fetchRssFeeds(FEEDS, existingMap, kstMidnightUTC, runTime);
  const anthropicResults = await scrapeAnthropicNews(existingMap, runTime, kstMidnightUTC);
  const deepseekResults = await scrapeDeepSeekNews(existingMap, runTime, kstMidnightUTC);

  const newLatestNews = [...rssResults, ...anthropicResults, ...deepseekResults];

  console.log(`\n[임시 테스트] 수집 완료! 총 ${newLatestNews.length}개의 기사를 메모리(newLatestNews)에 보관했습니다.`);
  console.log(`[임시 테스트] 2. ai.mjs 로 넘겨서 요약 시작 (10개 단위로 latest.json에 중간 저장) \n`);

  // 최종 저장(4단계) 코드는 제외하고 딱 3단계까지만 실행
  await processAiSummaries(newLatestNews, latestPath);

  console.log('\n[임시 테스트] AI 요약 및 중간 저장 단계까지 완료되었습니다! 스크립트를 종료합니다.');
  process.exit(0);
}

main();
