import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../public/data');
const newsPath = path.join(DATA_DIR, 'news.json');
const latestPath = path.join(DATA_DIR, 'latest.json');

const testNewsPath = path.join(DATA_DIR, 'test-news.json');
const testLatestPath = path.join(DATA_DIR, 'test-latest.json');

async function testArchive() {
  console.log('--- 테스트 스크립트 시작 ---');

  // 1. 원본 파일 복사 (안전을 위해)
  try {
    const newsData = await fs.readFile(newsPath, 'utf-8');
    await fs.writeFile(testNewsPath, newsData, 'utf-8');
    
    const latestData = await fs.readFile(latestPath, 'utf-8');
    await fs.writeFile(testLatestPath, latestData, 'utf-8');
    console.log('✅ 원본 JSON 파일들을 test- 접두사로 복사했습니다.');
  } catch (err) {
    console.error('파일 복사 실패:', err.message);
    return;
  }

  // 2. 파일 읽기 및 상태 출력
  let existingNews = JSON.parse(await fs.readFile(testNewsPath, 'utf-8'));
  let latestNews = JSON.parse(await fs.readFile(testLatestPath, 'utf-8'));

  console.log(`\n[병합 전 상태]`);
  console.log(`- test-news.json (All Updates) 기사 수: ${existingNews.length}개`);
  console.log(`- test-latest.json (What's New) 기사 수: ${latestNews.length}개`);

  // 3. 병합 (Archiving Logic)
  console.log('\n[병합 진행 중...] (최신 기사를 전체 아카이브로 이동합니다)');
  existingNews.push(...latestNews);

  const mergedMap = new Map();
  existingNews.forEach(item => {
    // 중복 제거
    mergedMap.set(item.id, item);
  });

  existingNews = Array.from(mergedMap.values());
  existingNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // 4. 결과 저장
  await fs.writeFile(testNewsPath, JSON.stringify(existingNews, null, 2), 'utf-8');
  
  // fetch-rss.mjs 에서는 이후 새로운 RSS 피드를 돌면서 새로운 기사만 newLatestNews 배열에 담아 latest.json을 덮어씁니다.
  // 여기서는 스크립트 실행 직후(새 기사를 긁어오기 전)의 상태를 시뮬레이션하기 위해 빈 배열로 덮어씁니다.
  await fs.writeFile(testLatestPath, JSON.stringify([], null, 2), 'utf-8');

  // 5. 최종 결과 확인
  const finalNews = JSON.parse(await fs.readFile(testNewsPath, 'utf-8'));
  const finalLatest = JSON.parse(await fs.readFile(testLatestPath, 'utf-8'));

  console.log(`\n[병합 완료 후 상태]`);
  console.log(`- test-news.json (All Updates) 기사 수: ${finalNews.length}개 (중복 제거됨)`);
  console.log(`- test-latest.json (What's New) 기사 수: ${finalLatest.length}개 (완전히 비워짐, 이후 새 기사 수집 대기)`);
  
  console.log('\n--- 테스트 스크립트 종료 ---');
}

testArchive();
