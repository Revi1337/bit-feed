<template>
  <aside class="w-full md:w-[240px] flex flex-col gap-xl shrink-0">
    <!-- Categories -->
    <div class="flex flex-col gap-sm">
      <h3 class="font-mono text-[12px] uppercase text-hairline-strong tracking-widest">Categories</h3>
      <div class="flex flex-col gap-2">
        <label v-for="cat in categories" :key="cat" class="flex items-center gap-sm cursor-pointer group">
          <input type="checkbox" class="accent-primary w-4 h-4 rounded-sm border-hairline bg-canvas cursor-pointer" />
          <span class="text-[14px] text-body group-hover:text-ink transition-colors">{{ cat }}</span>
        </label>
      </div>
    </div>

    <!-- Tags -->
    <div class="flex flex-col gap-sm">
      <h3 class="font-mono text-[12px] uppercase text-hairline-strong tracking-widest">Tags</h3>
      <div class="flex flex-wrap gap-2">
        <UiBadge variant="secondary" v-for="tag in tags" :key="tag" class="cursor-pointer hover:bg-canvas-soft hover:border-hairline-strong transition-colors py-[2px]">
          {{ tag }}
        </UiBadge>
      </div>
    </div>
  </aside>
</template>

<script setup>
import UiBadge from '~/components/ui/Badge.vue'

const categories = ['프로그래밍 언어', '프론트엔드', '백엔드', '인공지능', '보안']
const tags = ['Vue', 'React', 'Spring', 'AI', 'Security', 'Next.js', 'Nuxt', 'Java', 'Python']
</script>
