<template>
  <article 
    role="button" 
    tabindex="0" 
    @click="$emit('select', news)" 
    @keydown.enter="$emit('select', news)" 
    :class="[
      'block bg-canvas rounded-md p-lg shadow-level-2 hover:shadow-level-3 transition-shadow duration-200 group text-left cursor-pointer',
      index >= 6 ? 'defer-rendering' : ''
    ]"
  >
    <!-- Meta -->
    <div class="flex items-center gap-2 mb-sm">
      <UiBadge variant="primary">{{ news.category }}</UiBadge>
      <span class="text-[12px] text-mute">{{ news.source }}</span>
      <span class="text-[12px] text-hairline-strong mx-1">•</span>
      <span class="text-[12px] text-mute">{{ formatDate(news.pubDate) }}</span>
    </div>

    <!-- Content -->
    <h2 class="text-[20px] font-semibold text-ink leading-tight mb-sm group-hover:text-link transition-colors">{{ news.title }}</h2>
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

const formatDate = (dateString) => {
  if (!dateString) return ''
  const d = new Date(dateString)
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' }).format(d)
}
</script>

<style scoped>
.defer-rendering {
  content-visibility: auto;
  contain-intrinsic-size: auto none auto 150px;
}
</style>
