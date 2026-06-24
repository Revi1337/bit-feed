import { createArticle } from '../utils/scraper.mjs';
import { MAX_ARTICLES_PER_SOURCE } from '../config/constants.mjs';

function extractChangelogData(bundle) {
  const marker = '{title:"Google Antigravity Changelog",buttons:[';
  const start = bundle.indexOf(marker);
  if (start === -1) return null;

  let depth = 0, end = start;
  for (let i = start; i < bundle.length; i++) {
    if (bundle[i] === '{') depth++;
    else if (bundle[i] === '}') {
      depth--;
      if (depth === 0) { end = i + 1; break; }
    }
  }

  return new Function('return ' + bundle.slice(start, end))();
}

export async function scrapeAntigravityChangelog(existingMap, runTime) {
  const news = [];
  try {
    console.log('Scraping Antigravity Changelog...');

    const indexRes = await fetch('https://antigravity.google/');
    if (!indexRes.ok) throw new Error(`HTTP ${indexRes.status}`);
    const indexHtml = await indexRes.text();

    const scriptMatch = indexHtml.match(/src="(main-[A-Z0-9]+\.js)"/);
    if (!scriptMatch) throw new Error('Could not find main JS bundle');

    const bundleRes = await fetch(`https://antigravity.google/${scriptMatch[1]}`);
    if (!bundleRes.ok) throw new Error(`Bundle HTTP ${bundleRes.status}`);
    const bundle = await bundleRes.text();

    const changelogData = extractChangelogData(bundle);
    if (!changelogData) throw new Error('Could not locate changelogData in bundle');

    const sections = [
      ...changelogData.engineSections.slice(0, MAX_ARTICLES_PER_SOURCE).map(s => ({ ...s, isIde: false })),
      ...changelogData.ideSections.slice(0, MAX_ARTICLES_PER_SOURCE).map(s => ({ ...s, isIde: true })),
    ];

    for (const section of sections) {
      const [versionNum, dateStr = ''] = section.version.split('<br>');
      const id = `antigravity-${section.isIde ? 'ide' : 'engine'}-${versionNum.trim()}`;
      if (existingMap.has(id)) continue;

      let pubDate = runTime;
      const parsed = new Date(dateStr.trim());
      if (!isNaN(parsed.getTime())) pubDate = parsed.toISOString();

      const title = `Antigravity ${versionNum.trim()}: ${section.description}`;
      const url = 'https://antigravity.google/changelog';

      const rawChanges = (section.accordion?.changes || '').replace(/<[^>]*>/g, '').trim();
      const itemLines = (section.accordion?.items || [])
        .flatMap(item => [
          `${item.title}:`,
          ...(item.accordion_items || []).map(ai => `- ${ai.text}`),
        ])
        .join('\n');
      const content = rawChanges + (itemLines ? '\n\n' + itemLines : '');

      news.push(createArticle({
        id, title, content, url,
        category: section.isIde ? 'IDE & 개발 도구' : '인공지능',
        source: 'Antigravity Changelog',
        author: 'Google',
        pubDate, fetchedAt: runTime,
        tags: section.isIde ? ['Antigravity', 'IDE', 'AI'] : ['Antigravity', 'AI', 'LLM'],
      }));
    }
  } catch (error) {
    console.error('[ERROR] Failed to scrape Antigravity Changelog:', error.message);
  }
  return news;
}
