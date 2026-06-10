<template>
  <div class="min-h-screen flex flex-col font-sans bg-canvas-soft text-ink">
    <NavBar />

    <main class="flex-1 max-w-[1400px] w-full mx-auto px-md md:px-lg py-[48px] flex flex-col md:flex-row gap-xl md:gap-4xl">
      <Sidebar />

      <section class="flex-1 flex flex-col gap-md">
        <!-- Header -->
        <div class="flex items-center justify-between mb-lg">
          <h1 class="text-[32px] font-semibold tracking-[-1.28px]">Latest Updates</h1>
          <span class="text-body text-[14px]">Showing {{ newsList.length }} items</span>
        </div>

        <!-- News List Grid -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-lg">
          <NewsCard v-for="news in newsList" :key="news.id" :news="news" />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import NavBar from '~/components/NavBar.vue'
import Sidebar from '~/components/Sidebar.vue'
import NewsCard from '~/components/NewsCard.vue'

const newsList = ref([])

onMounted(async () => {
  try {
    const response = await fetch('/data/news.json')
    newsList.value = await response.json()
  } catch (error) {
    console.error('Failed to fetch mock data:', error)
  }
})
</script>
