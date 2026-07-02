export default defineEventHandler(async (event) => {
  const yaml = await useStorage('assets:server').getItem<string>('openapi.yml')
  setResponseHeader(event, 'Content-Type', 'application/yaml')
  return yaml
})
