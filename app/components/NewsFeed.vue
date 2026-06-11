<template>
  <main class="flex-1 max-w-[1400px] w-full mx-auto px-md md:px-lg py-[48px] flex flex-col md:flex-row gap-xl md:gap-2xl">
    <!-- Sidebar -->
    <aside class="w-full md:w-[200px] flex flex-col gap-xl shrink-0 md:order-last">
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
      <div v-if="filteredNews.length > 0" class="grid grid-cols-1 xl:grid-cols-2 gap-lg">
        <NewsCard v-for="news in filteredNews" :key="news.id" :news="news" @select="openArticle" />
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
import { ref, computed } from 'vue'

const props = defineProps({
  mode: {
    type: String,
    default: 'latest' // 'latest' | 'all'
  }
})

const dataUrl = computed(() => props.mode === 'latest' ? '/data/latest.json' : '/data/news.json')
const { data: baseNews } = await useFetch(dataUrl, { default: () => [], server: false })

// Filter State
const selectedCategories = ref([])
const selectedTags = ref([])

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
</script>
