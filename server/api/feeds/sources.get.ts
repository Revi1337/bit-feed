import { FEEDS } from '~~/scripts/config/feeds.mjs'

export default defineEventHandler((event) => {
  const sourcesSet = new Set<string>()
  
  FEEDS.forEach(feed => {
    if (feed.name) {
      sourcesSet.add(feed.name)
    }
  })

  // 만약 SPA 크롤러 등 feeds.mjs에 없는 추가 출처가 있을 수 있다면,
  // 차후에 all.json에서도 읽어와 병합하는 로직을 추가할 수 있습니다.
  const sources = Array.from(sourcesSet).sort()

  return {
    success: true,
    data: sources
  }
})
