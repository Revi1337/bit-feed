import latestDataRaw from '~~/public/data/latest.json'

export default defineEventHandler(async (event) => {
  try {
    // Vite 빌드 시 JSON을 JS 번들에 직접 포함
    const latestData = latestDataRaw as any[]
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
