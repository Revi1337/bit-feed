export default defineEventHandler((event) => {
  const origin = getRequestHeader(event, 'origin')
  
  // 허용할 도메인 정규식 (localhost, revi1337.com, *.revi1337.com)
  const allowedOrigins = [
    /^http:\/\/localhost:\d+$/,
    /^https?:\/\/revi1337\.com$/,
    /^https?:\/\/([a-zA-Z0-9-]+\.)+revi1337\.com$/
  ]

  // origin이 존재하고 허용 목록에 매칭될 경우 CORS 헤더 추가
  if (origin && allowedOrigins.some(regex => regex.test(origin))) {
    setResponseHeaders(event, {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true'
    })
  }

  // Preflight(OPTIONS) 요청일 경우 바로 응답 (204 No Content)
  if (event.node.req.method === 'OPTIONS') {
    event.node.res.statusCode = 204
    event.node.res.end()
  }
})
