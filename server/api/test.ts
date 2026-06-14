export default defineEventHandler(async () => {
  const keys = await useStorage('assets:data').getKeys()
  return { keys }
})
