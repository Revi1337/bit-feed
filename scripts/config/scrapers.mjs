import { scrapeAnthropicNews } from '../scrapers/anthropic.mjs';
import { scrapeDeepSeekNews } from '../scrapers/deepseek.mjs';
import { scrapeViteNews } from '../scrapers/vite.mjs';
import { scrapeBabelNews } from '../scrapers/babel.mjs';
import { scrapeBunNews } from '../scrapers/bun.mjs';
import { scrapeCursorNews } from '../scrapers/cursor.mjs';
import { scrapeSublimeNews } from '../scrapers/sublime.mjs';
import { scrapeAntigravityChangelog } from '../scrapers/antigravity.mjs';

// 새 커스텀 스크래퍼는 scrapers/ 에 파일 추가 후 여기 import + 배열에 한 줄만 추가
export const CUSTOM_SCRAPERS = [
  scrapeAnthropicNews,
  scrapeDeepSeekNews,
  scrapeViteNews,
  scrapeBabelNews,
  scrapeBunNews,
  scrapeCursorNews,
  scrapeSublimeNews,
  scrapeAntigravityChangelog,
];
