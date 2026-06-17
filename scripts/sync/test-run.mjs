import fs from 'fs/promises';
import path from 'path';
import * as dotenv from 'dotenv';
import { FEEDS } from '../config/feeds.mjs';
import { fetchRssFeeds, scrapeAnthropicNews, scrapeDeepSeekNews, scrapeViteNews, scrapeBabelNews, scrapeBunNews, scrapeCursorNews, scrapeSublimeNews } from '../utils/scraper.mjs';
import { processAiSummaries } from '../utils/ai.mjs';

dotenv.config();

/**
 * 중간 단계(데이터 수집 및 AI 요약) 안전 테스트용 스크립트
 * 
 * [제작 배경]
 * 메인 파이프라인(`fetch-rss.mjs`) 전체를 돌리기에는 시간이 오래 걸리기 때문에,
 * 수집 로직(Scraping)과 요약 로직(AI Summary)이 정상적으로 동작하는지만 
 * 빠르고 안전하게 확인하기 위해 파이프라인의 일부 로직만 추출하여 제작되었습니다.
 * 
 * [용도]
 * 롤링 윈도우(Rolling Window) 아키텍처 전환 이후, 테스트 도중 프로덕션 데이터인 `latest.json`이 
 * 훼손되는 것을 막기 위해 임시 파일(`temp.json`)에 요약본을 10개 단위로 저장하며 테스트합니다.
 * 주의: 끝까지 실행되어도 `all.json`과 `latest.json`은 갱신되지 않습니다.
 */
async function main() {
  const tempPath = path.resolve(process.cwd(), 'public/data/temp.json');
  const latestPath = path.resolve(process.cwd(), 'public/data/latest.json');
  const newsPath = path.resolve(process.cwd(), 'public/data/all.json');

  // 로컬 환경을 위해 기존 latest.json과 all.json을 모두 읽어와 existingMap 구성 (중복 방지)
  let existingNews = [];
  try {
    existingNews = JSON.parse(await fs.readFile(newsPath, 'utf-8'));
  } catch (e) {}

  let latestNewsData = [];
  try {
    latestNewsData = JSON.parse(await fs.readFile(latestPath, 'utf-8'));
  } catch (e) {}

  const existingMap = new Map();
  [...existingNews, ...latestNewsData].forEach(item => {
    existingMap.set(item.id, item);
  });

  const runTime = new Date().toISOString();

  console.log(`[임시 테스트] 1. scraper.mjs 를 통해 메모리로 수집 시작...`);
  const rssResults = await fetchRssFeeds(FEEDS, existingMap, runTime);
  const anthropicResults = await scrapeAnthropicNews(existingMap, runTime);
  const deepseekResults = await scrapeDeepSeekNews(existingMap, runTime);
  const viteResults = await scrapeViteNews(existingMap, runTime);
  const babelResults = await scrapeBabelNews(existingMap, runTime);
  const bunResults = await scrapeBunNews(existingMap, runTime);
  const cursorResults = await scrapeCursorNews(existingMap, runTime);
  const sublimeResults = await scrapeSublimeNews(existingMap, runTime);

  const newLatestNews = [...rssResults, ...anthropicResults, ...deepseekResults, ...viteResults, ...babelResults, ...bunResults, ...cursorResults, ...sublimeResults];

  console.log(`\n[임시 테스트] 수집 완료! 총 ${newLatestNews.length}개의 기사를 메모리(newLatestNews)에 보관했습니다.`);
  console.log(`[임시 테스트] 2. ai.mjs 로 넘겨서 요약 시작 (10개 단위로 temp.json에 중간 저장) \n`);

  // 최종 저장(4단계) 코드는 제외하고 딱 3단계까지만 실행
  await processAiSummaries(newLatestNews, tempPath);
  
  // 클린업(원문 제거) 처리
  newLatestNews.forEach(item => delete item.cleanContent);
  
  // 클린업된 최종 결과를 temp.json에 한 번 더 덮어쓰기
  await fs.writeFile(tempPath, JSON.stringify(newLatestNews, null, 2), 'utf-8');

  console.log('\n[임시 테스트] AI 요약 및 중간 저장 단계까지 완료되었습니다! 스크립트를 종료합니다.');
  process.exit(0);
}

main();
