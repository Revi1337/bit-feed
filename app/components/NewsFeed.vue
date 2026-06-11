<template>
  <main class="flex-1 max-w-[1400px] w-full mx-auto px-md md:px-lg py-[48px] flex flex-col md:flex-row gap-xl md:gap-2xl">
    <!-- Mobile Filter Backdrop -->
    <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-300" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="mobileFilterOpen" @click="mobileFilterOpen = false" class="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"></div>
    </Transition>

    <!-- Sidebar -->
    <aside :class="[
      'flex flex-col gap-xl shrink-0 transition-transform duration-300 ease-in-out',
      'fixed inset-y-0 right-0 z-50 w-[280px] p-xl bg-canvas overflow-y-auto border-l border-t-0 border-r-0 border-b-0 border-hairline',
      'md:static md:w-[200px] md:order-last md:p-0 md:border-none md:bg-transparent md:z-auto md:overflow-visible',
      mobileFilterOpen ? 'translate-x-0 shadow-[-10px_0_40px_rgba(0,0,0,0.08)]' : 'translate-x-full md:translate-x-0'
    ]">
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
        <h1 class="text-[32px] font-semibold tracking-[-1.28px]">
          {{ mode === 'latest' ? 'What\'s New' : 'All Updates' }}
        </h1>
        <span class="text-body text-[14px]">Showing {{ filteredNews.length }} items</span>
      </div>

      <!-- News List Grid -->
      <div v-if="filteredNews.length > 0" class="flex flex-col gap-lg">
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-lg">
          <NewsCard v-for="news in paginatedNews" :key="news.id" :news="news" @select="openArticle" />
        </div>
        
        <!-- Pagination Controls -->
        <div class="flex items-center justify-between mt-xl border-t border-hairline pt-lg" v-if="totalPages > 1">
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1"
            class="px-4 py-2 text-[14px] font-medium rounded-md border border-hairline bg-canvas hover:bg-canvas-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            Previous
          </button>
          <span class="text-[14px] text-mute font-medium">Page {{ currentPage }} of {{ totalPages }}</span>
          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            class="px-4 py-2 text-[14px] font-medium rounded-md border border-hairline bg-canvas hover:bg-canvas-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Next
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>
      <div v-else class="py-xl text-center text-mute border border-hairline border-dashed rounded-md">
        No articles match your selected filters.
      </div>
    </section>

    <!-- AI Summary Modal -->
    <UiModal :isOpen="!!selectedArticle" @close="selectedArticle = null">
      <template #header>
        <div class="flex flex-col pr-4">
          <h2 class="text-[18px] font-semibold leading-tight text-ink">{{ selectedArticle?.title }}</h2>
          <span class="text-[12px] text-mute mt-1">{{ selectedArticle?.source }}</span>
        </div>
      </template>

      <div class="flex flex-col gap-md">
        <div class="flex items-center gap-2">
          <UiBadge variant="primary" class="bg-primary/10 text-primary border-primary/20">✨ AI 요약</UiBadge>
        </div>
        <p class="text-[15px] text-body leading-relaxed whitespace-pre-wrap text-mute" v-if="!selectedArticle?.aiSummary">
          ⏳ AI가 이 기사를 요약하는 중입니다. 잠시 후 새로고침해 주세요.
        </p>
        <p class="text-[15px] text-body leading-relaxed whitespace-pre-wrap" v-else>
          {{ selectedArticle?.aiSummary }}
        </p>
      </div>

      <template #footer>
        <a :href="selectedArticle?.url" target="_blank" class="inline-flex items-center justify-center transition-colors font-medium cursor-pointer bg-primary text-on-primary text-[14px] rounded-sm px-md h-[36px] hover:bg-black/80 w-full md:w-auto">
          원문 읽으러 가기
        </a>
      </template>
    </UiModal>
  </main>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useState } from '#imports'

const props = defineProps({
  mode: {
    type: String,
    default: 'latest' // 'latest' | 'all'
  }
})

const mobileFilterOpen = useState('mobileFilterOpen', () => false)

const dataUrl = computed(() => props.mode === 'latest' ? '/data/latest.json' : '/data/news.json')
const { data: baseNews } = await useFetch(dataUrl, { default: () => [], server: false })

// Filter State
const selectedCategories = ref([])
const selectedTags = ref([])

// Pagination State
const currentPage = ref(1)
const itemsPerPage = 20

// Reset page when filters change
watch([selectedCategories, selectedTags], () => {
  currentPage.value = 1
}, { deep: true })

// Modal State
const selectedArticle = ref(null)

const openArticle = (news) => {
  selectedArticle.value = news
}

// Extracted metadata for filters
const availableCategories = computed(() => {
  const cats = new Set(baseNews.value.map(n => n.category).filter(Boolean))
  return Array.from(cats).sort()
})

const availableTags = computed(() => {
  const tags = new Set(baseNews.value.flatMap(n => n.tags || []))
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
  return baseNews.value.filter(news => {
    // 1. Category Filter (OR logic within categories)
    const matchCategory = selectedCategories.value.length === 0 || selectedCategories.value.includes(news.category)
    
    // 2. Tag Filter (OR logic within tags)
    const matchTag = selectedTags.value.length === 0 || (news.tags && news.tags.some(t => selectedTags.value.includes(t)))
    
    return matchCategory && matchTag
  })
})

// Paginated List
const totalPages = computed(() => Math.ceil(filteredNews.value.length / itemsPerPage) || 1)
const paginatedNews = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredNews.value.slice(start, end)
})

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>
