import fs from 'fs/promises';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { fetchAndExtractArticle } from './scraper.mjs';
import pLimit from 'p-limit';
import { AI_CONTENT_MAX_LENGTH, GEMINI_RATE_LIMIT_DELAY_MS } from '../config/constants.mjs';

export const sleep = ms => new Promise(r => setTimeout(r, ms));

export async function generateAISummary(title, content) {
  if (!process.env.GEMINI_API_KEY) return "API Key가 설정되지 않아 AI 요약을 생성할 수 없습니다.";
  if (!content || content.trim().length < 30) return "본문이 제공되지 않은 기사입니다.";

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

  // 9월 28일 이후 Google AI Pro 계정이 끝나기 때문에 다시 flash-lite 를 사용해야 함
  // let model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
  let model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
  const isFlash35 = model.model.includes("gemini-3.5-flash");

  if (isFlash35) {
    model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
      tools: [{
        functionDeclarations: [{
          name: "fetchUrlContent",
          description: "외부 하이퍼링크의 상세 텍스트 내용을 가져옵니다. 본문이 너무 짧거나, 'release notes', '자세히 보기' 등 구체적인 내용이 외부 링크에 있다고 명시된 경우 이 함수를 사용해 해당 링크의 내용을 긁어오세요. URL은 본문 내 괄호 안의 (https://...) 형태를 참고하세요.",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              url: { type: SchemaType.STRING, description: "가져올 절대 경로 URL" }
            },
            required: ["url"]
          }
        }]
      }]
    });
  }

  const prompt = `당신은 IT 뉴스 기사를 요약하는 전문 AI입니다.
다음 기사 제목과 본문을 바탕으로 핵심 내용을 한국어로 요약해 줘.

[엄격한 규칙]
1. "제공해주신 내용은...", "다음과 같습니다", "요약해 드리겠습니다", "요약:" 같은 대화형 문구, 인사말, 서론, 결론을 절대 포함하지 마라. 오직 요약 내용만 출력해라.
2. 마크다운 기호(**, #, *, - 등)를 절대 사용하지 말고, 오직 순수한 평문(Plain text)으로만 출력해라.
3. 기사의 분량과 심도에 비례하여 요약의 길이를 동적으로 조절해라. 가벼운 내용이라면 2~3문장으로 짧게, 기술적으로 깊고 방대한 내용이라면 줄바꿈과 여러 문단을 적극 활용하여 상세히 요약해라.
4. 모든 문장의 끝마맺음은 반드시 정중한 존댓말("~합니다.", "~입니다." 등)로 통일해라.
5. 고유명사(회사명, 모델명, 서비스명, 기술 용어 등)는 억지로 한국어로 발음 나는 대로 적지 말고 반드시 영문 원어 그대로 작성해라. (예: 오프너이 -> OpenAI, 앤스로픽 -> Anthropic, 제네이아이 -> Gemini, 딥식 -> DeepSeek, 올라마 -> Ollama, 엠시피 -> MCP)

제목: ${title}

본문:
${content.slice(0, AI_CONTENT_MAX_LENGTH)}
`;

  let attempt = 0;
  const maxRetries = 6;
  const baseDelay = 2000;

  while (attempt < maxRetries) {
    try {
      if (isFlash35) { // when "gemini-3.5-flash"
        const chat = model.startChat();
        let result = await chat.sendMessage(prompt);

        const calls = result.response.functionCalls();
        if (calls && calls.length > 0) {
          const call = calls[0];
          if (call.name === "fetchUrlContent") {
            console.log(`[AI Agent] Fetching external link for "${title}": ${call.args.url}`);
            const scrapedText = await fetchAndExtractArticle(call.args.url);

            result = await chat.sendMessage([{
              functionResponse: {
                name: 'fetchUrlContent',
                response: { content: scrapedText ? scrapedText.slice(0, AI_CONTENT_MAX_LENGTH) : "URL 본문 추출 실패" }
              }
            }]);
          }
        }
        return result.response.text();
      } else { // when "gemini-3.1-flash-lite"
        const result = await model.generateContent(prompt);
        return result.response.text();
      }
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

export async function processAiSummaries(newLatestNews, latestPath) {
  console.log('--- Phase 2: AI Summarization ---');
  const itemsToSummarize = newLatestNews.filter(n => !n.aiSummary);
  console.log(`Found ${itemsToSummarize.length} items needing AI summaries.`);

  const limit = pLimit(1); // 1 concurrent request

  let completed = 0;
  await Promise.all(itemsToSummarize.map(item => limit(async () => {
    console.log(`Generating AI summary for: ${item.title}`);
    item.aiSummary = await generateAISummary(item.title, item.cleanContent);
    completed++;
    if (completed % 10 === 0) {
      console.log(`Progress: ${completed}/${itemsToSummarize.length}`);
      const tempNews = [...newLatestNews];
      tempNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      await fs.writeFile(latestPath, JSON.stringify(tempNews, null, 2), 'utf-8');
    }
    await sleep(GEMINI_RATE_LIMIT_DELAY_MS); // Strict delay to align with 15 requests per minute limit
  })));

  // 루프가 끝난 뒤, 10으로 나누어 떨어지지 않아 미처 저장되지 못한 잔여 요약본 최종 저장
  if (completed > 0 && completed % 10 !== 0) {
    console.log(`Saving final ${completed % 10} remaining summaries...`);
    const tempNews = [...newLatestNews];
    tempNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    await fs.writeFile(latestPath, JSON.stringify(tempNews, null, 2), 'utf-8');
  }
}
