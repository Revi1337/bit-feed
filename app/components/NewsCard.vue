<template>
  <article 
    role="button" 
    tabindex="0" 
    @click="$emit('select', news)" 
    @keydown.enter="$emit('select', news)" 
    :class="[
      'block relative bg-canvas rounded-md p-lg shadow-level-2 md:hover:shadow-level-3 transition-shadow duration-200 group text-left cursor-pointer focus:outline-none',
      index >= 6 ? 'defer-rendering' : ''
    ]"
  >
    <!-- Meta -->
    <div class="flex items-center gap-2 mb-sm flex-wrap pr-10">
      <UiBadge variant="primary">{{ news.category }}</UiBadge>
      <div class="flex items-center gap-2 text-[12px]">
        <span class="text-mute">{{ news.source }}</span>
        <div class="h-3 w-px bg-hairline"></div>
        <span class="text-mute">{{ formatDate(news.pubDate) }}</span>
      </div>
    </div>
    <span v-if="isNew(news.pubDate)" class="absolute top-lg right-lg text-[10px] font-medium text-body bg-canvas-soft-2 border border-hairline px-1.5 py-[2px] rounded-sm tracking-wide">new</span>

    <!-- Content -->
    <h2 class="text-[20px] font-semibold text-ink leading-tight mb-sm md:group-hover:text-link transition-colors">{{ news.title }}</h2>
    <p class="text-[14px] text-body line-clamp-2 mb-md text-mute" v-if="!news.aiSummary">⏳ AI가 요약을 생성하는 중입니다...</p>
    <p class="text-[14px] text-body line-clamp-2 mb-md" v-else>{{ news.aiSummary }}</p>

    <!-- Tags -->
    <div class="flex flex-wrap gap-2">
      <UiBadge variant="secondary" v-for="tag in news.tags" :key="tag">#{{ tag }}</UiBadge>
    </div>
  </article>
</template>

<script setup>
const emit = defineEmits(['select'])
const props = defineProps({
  news: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    default: 0
  }
})

const isNew = (dateString) => {
  if (!dateString) return false
  const pubTime = new Date(dateString).getTime()
  const now = Date.now()
  // 24시간(ms) 이내에 발행된 기사인지 확인
  return (now - pubTime) <= 24 * 60 * 60 * 1000 && (now - pubTime) >= -24 * 60 * 60 * 1000 // 미래 시간(예: VSCode)도 커버하기 위해 절대값 또는 범위 허용
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const d = new Date(dateString)
  return new Intl.DateTimeFormat('ko-KR', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }).format(d)
}
</script>

<style scoped>
.defer-rendering {
  content-visibility: auto;
  contain-intrinsic-size: auto none auto 150px;
}
</style>
