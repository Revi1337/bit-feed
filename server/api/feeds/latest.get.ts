export default defineEventHandler(async (event) => {
  try {
    // Nitro의 서버 스토리지 기능을 이용해 직접 읽어옵니다.
    const latestData = await useStorage('assets:data').getItem('latest.json') || []
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
