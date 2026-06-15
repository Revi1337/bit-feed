import fs from 'fs/promises';
import path from 'path';
import * as dotenv from 'dotenv';
import { generateAISummary, sleep } from '../utils/ai.mjs';

dotenv.config();

/**
 * 누락된 AI 요약 복구 스크립트
 * 
 * [제작 배경]
 * 기존 파이프라인(fetch-rss.mjs)에서 예기치 못한 종료 등으로 `aiSummary`가 비어있는 항목들이 생겼을 때,
 * 전체 스크립트를 처음부터 다시 실행하지 않고 누락된 항목만 빠르게 복구하기 위해 제작되었습니다.
 * 
 * [용도]
 * 단일 진실 공급원인 `all.json` 파일을 읽어 `aiSummary`가 없거나 "요약하는 중입니다" 상태인 기사를 필터링한 후,
 * Gemini API를 호출하여 요약을 생성합니다. 이후 전체 데이터를 `all.json`에 덮어쓰고,
 * 최신 50개만 잘라내어 `latest.json`에도 동기화(Sync)합니다.
 */
async function fillMissing() {
  const allPath = path.resolve(process.cwd(), 'public/data/all.json');
  const latestPath = path.resolve(process.cwd(), 'public/data/latest.json');
  const data = JSON.parse(await fs.readFile(allPath, 'utf-8'));
  
  const missingItems = data.filter(item => !item.aiSummary || item.aiSummary.includes("요약하는 중입니다") || item.aiSummary.includes("오류가 발생했습니다"));
  console.log(`Found ${missingItems.length} items missing aiSummary.`);
  
  for (let i = 0; i < missingItems.length; i++) {
    const item = missingItems[i];
    console.log(`[${i+1}/${missingItems.length}] Generating summary for: ${item.title}`);
    item.aiSummary = await generateAISummary(item.title, item.cleanContent || item.summary);
    await sleep(4100);
  }
  
  if (missingItems.length > 0) {
    await fs.writeFile(allPath, JSON.stringify(data, null, 2), 'utf-8');
    const top50 = data.slice(0, 50);
    await fs.writeFile(latestPath, JSON.stringify(top50, null, 2), 'utf-8');
    console.log('Successfully updated all.json and latest.json with new summaries!');
  } else {
    console.log('No missing summaries found.');
  }
}

fillMissing();
