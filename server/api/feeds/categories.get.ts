import { FEEDS } from '~~/scripts/config/feeds.mjs'

export default defineEventHandler((event) => {
  const categoriesSet = new Set<string>()
  
  FEEDS.forEach(feed => {
    if (feed.category) {
      categoriesSet.add(feed.category)
    }
  })

  const categories = Array.from(categoriesSet).sort()

  return {
    success: true,
    data: categories
  }
})
