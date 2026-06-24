import fs from 'fs/promises';
import path from 'path';
import * as dotenv from 'dotenv';
import { generateAISummary, sleep } from '../utils/ai.mjs';
import { GEMINI_RATE_LIMIT_DELAY_MS } from '../config/constants.mjs';

dotenv.config();

/**
 * 누락된 AI 요약 복구 스크립트
 *
 * [제작 배경]
 * 기존 파이프라인(fetch-rss.mjs)에서 예기치 못한 종료 등으로 `aiSummary`가 비어있는 항목들이 생겼을 때,
 * 전체 스크립트를 처음부터 다시 실행하지 않고 누락된 항목만 빠르게 복구하기 위해 제작되었습니다.
 *
 * [용도]
 * 기존 `all.json`과 `latest.json` 파일에서 "AI 요약을 생성하는 중 오류가 발생했습니다" 상태인 기사만 필터링한 후,
 * Gemini API를 호출하여 요약을 생성합니다. 이후 각 파일을 제자리에서 갱신(In-place Update)합니다.
 */
async function fillMissing() {
  const allPath = path.resolve(process.cwd(), 'public/data/all.json');
  const latestPath = path.resolve(process.cwd(), 'public/data/latest.json');
  
  let allData = [];
  try {
    allData = JSON.parse(await fs.readFile(allPath, 'utf-8'));
  } catch (e) {
    console.log('all.json not found or invalid.');
  }

  let latestData = [];
  try {
    latestData = JSON.parse(await fs.readFile(latestPath, 'utf-8'));
  } catch (e) {
    console.log('latest.json not found or invalid.');
  }

  const hasError = (item) => !item.aiSummary || item.aiSummary.includes("AI 요약을 생성하는 중 오류가 발생했습니다");

  const missingItemsAll = allData.filter(hasError);
  
  // 중복 생성을 막기 위해 ID 기준으로 맵을 구성
  const targetMap = new Map();
  missingItemsAll.forEach(item => targetMap.set(item.id, item));
  
  latestData.filter(hasError).forEach(item => {
    if (!targetMap.has(item.id)) {
      targetMap.set(item.id, item);
    }
  });

  const missingItems = Array.from(targetMap.values());
  console.log(`Found ${missingItems.length} items with errors across both files.`);

  for (let i = 0; i < missingItems.length; i++) {
    const item = missingItems[i];
    console.log(`[${i+1}/${missingItems.length}] Generating summary for: ${item.title}`);
    
    const newSummary = await generateAISummary(item.title, item.cleanContent || `${item.summary} (${item.url})`);
    
    // 양쪽 배열에 해당 아이템이 존재하면 각각 업데이트
    const itemInAll = allData.find(x => x.id === item.id);
    if (itemInAll) itemInAll.aiSummary = newSummary;

    const itemInLatest = latestData.find(x => x.id === item.id);
    if (itemInLatest) itemInLatest.aiSummary = newSummary;

    await sleep(GEMINI_RATE_LIMIT_DELAY_MS);
  }

  if (missingItems.length > 0) {
    await fs.writeFile(allPath, JSON.stringify(allData, null, 2), 'utf-8');
    await fs.writeFile(latestPath, JSON.stringify(latestData, null, 2), 'utf-8');
    console.log('Successfully updated all.json and latest.json with new summaries!');
  } else {
    console.log('No errors found to fix.');
  }
}

fillMissing();
