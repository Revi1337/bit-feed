export default defineEventHandler(async (event) => {
  try {
    // 내부 $fetch를 사용하여 public/data/latest.json 호출 (정적 파일)
    const latestData = await $fetch('/data/latest.json')
    return {
      success: true,
      data: latestData
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load latest feeds'
    })
  }
})
