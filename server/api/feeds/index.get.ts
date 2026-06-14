export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 20
  const category = query.category as string
  const source = query.source as string
  const q = query.q as string

  try {
    // 내부 $fetch를 사용하여 전체 데이터 로드
    let allData = await $fetch<any[]>('/data/all.json')

    // 필터링 적용
    if (category) {
      allData = allData.filter(item => item.category?.toLowerCase() === category.toLowerCase())
    }
    if (source) {
      allData = allData.filter(item => item.sourceName?.toLowerCase() === source.toLowerCase())
    }
    if (q) {
      const keyword = q.toLowerCase()
      allData = allData.filter(item => 
        item.title?.toLowerCase().includes(keyword) || 
        item.contentSnippet?.toLowerCase().includes(keyword) ||
        item.summary?.toLowerCase().includes(keyword)
      )
    }

    const total = allData.length
    const totalPages = Math.ceil(total / limit)
    
    // 페이지네이션 적용
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedData = allData.slice(startIndex, endIndex)

    return {
      success: true,
      meta: {
        total,
        page,
        limit,
        totalPages
      },
      data: paginatedData
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load feeds'
    })
  }
})
