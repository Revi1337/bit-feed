import fs from 'fs/promises';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function generateAISummary(title, content) {
  if (!process.env.GEMINI_API_KEY) return "API Key가 설정되지 않아 AI 요약을 생성할 수 없습니다.";
  if (!content || content.trim().length < 30) return "본문이 제공되지 않은 기사입니다.";

  let attempt = 0;
  const maxRetries = 3;
  const baseDelay = 2000;

  while (attempt < maxRetries) {
    try {
      const prompt = `당신은 IT 뉴스 기사를 요약하는 전문 AI입니다. 
다음 기사 제목과 본문을 바탕으로 핵심 내용을 한국어로 요약해 줘.

[엄격한 규칙]
1. "제공해주신 내용은...", "다음과 같습니다", "요약해 드리겠습니다", "요약:" 같은 대화형 문구, 인사말, 서론, 결론을 절대 포함하지 마라. 오직 요약 내용만 출력해라.
2. 마크다운 기호(**, #, *, - 등)를 절대 사용하지 말고, 오직 순수한 평문(Plain text)으로만 출력해라.
3. 기사의 분량과 심도에 비례하여 요약의 길이를 동적으로 조절해라. 가벼운 내용이라면 2~3문장으로 짧게, 기술적으로 깊고 방대한 내용이라면 줄바꿈과 여러 문단을 적극 활용하여 상세히 요약해라.
4. 모든 문장의 끝마맺음은 반드시 정중한 존댓말("~합니다.", "~입니다." 등)로 통일해라.

제목: ${title}

본문:
${content.slice(0, 15000)}
`;
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      attempt++;
      console.error(`AI Summary failed for "${title}" (Attempt ${attempt}/${maxRetries}):`, error.message);

      if (attempt >= maxRetries) {
        return "AI 요약을 생성하는 중 오류가 발생했습니다.";
      }

      // Exponential backoff with jitter
      const jitter = Math.random() * 1000;
      const delay = (baseDelay * Math.pow(2, attempt - 1)) + jitter;
      console.log(`Waiting ${Math.round(delay)}ms before retry...`);
      await sleep(delay);
    }
  }
}

async function run() {
  const latestPath = path.resolve(process.cwd(), 'public/data/latest.json');
  let data = JSON.parse(await fs.readFile(latestPath, 'utf-8'));

  let count = 0;
  for (let i = 0; i < data.length; i++) {
    if (!data[i].aiSummary && data[i].summary && data[i].summary.trim().length > 30) {
      console.log(`Summarizing: ${data[i].title}`);
      data[i].aiSummary = await generateAISummary(data[i].title, data[i].summary);
      count++;
      await sleep(1000); 
    }
    if (count >= 5) break;
  }

  await fs.writeFile(latestPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Successfully generated summaries for ${count} items.`);
}

run();
