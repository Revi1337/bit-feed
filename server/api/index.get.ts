export default defineEventHandler(async (event) => {
  const yaml = await useStorage('assets:server').getItem<string>('openapi.yml')
  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return yaml
})
