<template>
  <div class="min-h-screen flex flex-col font-sans bg-canvas-soft text-ink">
    <NavBar />

    <main class="flex-1 max-w-[1400px] w-full mx-auto px-md md:px-lg py-[48px] flex flex-col md:flex-row gap-xl md:gap-4xl">
      <!-- Sidebar -->
      <aside class="w-full md:w-[240px] flex flex-col gap-xl shrink-0">
        <!-- Categories -->
        <div class="flex flex-col gap-sm">
          <h3 class="font-mono text-[12px] uppercase text-hairline-strong tracking-widest flex items-center justify-between">
            Categories
            <button v-if="selectedCategories.length > 0" @click="selectedCategories = []" class="text-[10px] text-link hover:underline">Clear</button>
          </h3>
          <div class="flex flex-col gap-2">
            <label v-for="cat in availableCategories" :key="cat" class="flex items-center gap-sm cursor-pointer group">
              <input type="checkbox" :value="cat" v-model="selectedCategories" class="accent-primary w-4 h-4 rounded-sm border-hairline bg-canvas cursor-pointer" />
              <span class="text-[14px] text-body group-hover:text-ink transition-colors">{{ cat }}</span>
            </label>
          </div>
        </div>

        <!-- Tags -->
        <div class="flex flex-col gap-sm">
          <h3 class="font-mono text-[12px] uppercase text-hairline-strong tracking-widest flex items-center justify-between">
            Tags
            <button v-if="selectedTags.length > 0" @click="selectedTags = []" class="text-[10px] text-link hover:underline">Clear</button>
          </h3>
          <div class="flex flex-wrap gap-2">
            <UiBadge 
              v-for="tag in availableTags" 
              :key="tag" 
              :variant="selectedTags.includes(tag) ? 'primary' : 'secondary'"
              class="cursor-pointer hover:border-hairline-strong transition-colors py-[2px]"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </UiBadge>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <section class="flex-1 flex flex-col gap-md">
        <!-- Header -->
        <div class="flex items-center justify-between mb-lg">
          <h1 class="text-[32px] font-semibold tracking-[-1.28px]">Latest Updates</h1>
          <span class="text-body text-[14px]">Showing {{ filteredNews.length }} items</span>
        </div>

        <!-- News List Grid -->
        <div v-if="filteredNews.length > 0" class="grid grid-cols-1 xl:grid-cols-2 gap-lg">
          <NewsCard v-for="news in filteredNews" :key="news.id" :news="news" />
        </div>
        <div v-else class="py-xl text-center text-mute border border-hairline border-dashed rounded-md">
          No articles match your selected filters.
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import NavBar from '~/components/NavBar.vue'
import NewsCard from '~/components/NewsCard.vue'
import UiBadge from '~/components/ui/Badge.vue'

const { data: newsList } = await useFetch('/data/news.json', { default: () => [] })

// Filter State
const selectedCategories = ref([])
const selectedTags = ref([])

// Extracted metadata for filters
const availableCategories = computed(() => {
  const cats = new Set(newsList.value.map(n => n.category).filter(Boolean))
  return Array.from(cats).sort()
})

const availableTags = computed(() => {
  const tags = new Set(newsList.value.flatMap(n => n.tags || []))
  return Array.from(tags).sort()
})

// Toggle tag selection
const toggleTag = (tag) => {
  const idx = selectedTags.value.indexOf(tag)
  if (idx === -1) selectedTags.value.push(tag)
  else selectedTags.value.splice(idx, 1)
}

// Filtered List
const filteredNews = computed(() => {
  return newsList.value.filter(news => {
    // 1. Category Filter (OR logic within categories)
    const matchCategory = selectedCategories.value.length === 0 || selectedCategories.value.includes(news.category)
    
    // 2. Tag Filter (OR logic within tags)
    const matchTag = selectedTags.value.length === 0 || (news.tags && news.tags.some(t => selectedTags.value.includes(t)))
    
    return matchCategory && matchTag
  })
})
</script>
