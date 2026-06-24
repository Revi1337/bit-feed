/**
 * 특정 스크래퍼만 단독으로 실행해 AI 요약까지 포함된 JSON을 저장합니다.
 *
 * 사용법: node scripts/sync/scraper-tester.mjs <스크래퍼 이름>
 * 예시:   node scripts/sync/scraper-tester.mjs antigravity
 *         node scripts/sync/scraper-tester.mjs anthropic
 *         node scripts/sync/scraper-tester.mjs cursor
 *
 * 결과 파일: public/data/scraper-{이름}.json
 */
import fs from 'fs/promises';
import path from 'path';
import * as dotenv from 'dotenv';
import { processAiSummaries } from '../utils/ai.mjs';

dotenv.config();

const name = process.argv[2];
if (!name) {
  console.error('사용법: node scripts/sync/scraper-tester.mjs <스크래퍼 이름>');
  console.error('예시:   node scripts/sync/scraper-tester.mjs antigravity');
  process.exit(1);
}

const modulePath = path.resolve(`scripts/scrapers/${name}.mjs`);
let scraperFn;
try {
  const mod = await import(modulePath);
  scraperFn = Object.values(mod).find(v => typeof v === 'function');
  if (!scraperFn) throw new Error('함수를 찾을 수 없습니다.');
} catch (e) {
  console.error(`[ERROR] scripts/scrapers/${name}.mjs 로드 실패:`, e.message);
  process.exit(1);
}

const tempPath = path.resolve(`public/data/scraper-${name}.json`);
const runTime = new Date().toISOString();

console.log(`[Scraper Tester] "${name}" 스크래퍼 실행 중...`);
const articles = await scraperFn(new Map(), runTime);
console.log(`[Scraper Tester] ${articles.length}개 수집 완료`);

if (articles.length === 0) {
  console.log('[Scraper Tester] 수집된 기사가 없습니다. 종료합니다.');
  process.exit(0);
}

console.log('[Scraper Tester] AI 요약 시작...');
await processAiSummaries(articles, tempPath);

articles.forEach(item => delete item.cleanContent);
await fs.writeFile(tempPath, JSON.stringify(articles, null, 2), 'utf-8');

console.log(`\n[Scraper Tester] 완료! → ${tempPath}`);
process.exit(0);
