<template>
  <main class="flex-1 w-full flex flex-col items-center bg-canvas">
    <!-- Hero Section -->
    <section class="w-full max-w-[1200px] mx-auto px-6 pt-[120px] pb-[80px] flex flex-col items-center text-center">
      
      <h1 class="text-[48px] md:text-[72px] font-extrabold tracking-tighter leading-[1.1] mb-6 text-ink animate-fade-in-up" style="animation-delay: 100ms;">
        가볍고, 편안하게<br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">기술 트렌드를 앞서가세요.</span>
      </h1>
      
      <p class="text-[18px] md:text-[20px] text-body max-w-[600px] leading-relaxed mb-10 animate-fade-in-up" style="animation-delay: 200ms;">
        매일 쏟아지는 IT 소식, 이제 한 곳에서 확인하세요. 40여 곳의 글로벌 기술 블로그와 AI 연구소의 최신 아티클을 수집하고 Gemini가 핵심만 요약해 드립니다.
      </p>
      
      <div class="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up" style="animation-delay: 300ms;">
        <NuxtLink to="/new" class="flex items-center gap-2 px-8 py-3.5 rounded-lg bg-ink text-canvas font-semibold text-[15px] hover:opacity-90 transition-all shadow-level-2 hover:shadow-level-3">
          오늘의 소식 확인하기
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transform group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </NuxtLink>
        <NuxtLink to="/all" class="px-8 py-3.5 rounded-lg bg-canvas text-ink font-semibold text-[15px] hover:bg-canvas-soft transition-all border border-hairline shadow-sm">
          전체 소식 둘러보기
        </NuxtLink>
      </div>
    </section>

    <!-- Logo Cloud Section -->
    <section class="w-full max-w-[1400px] mx-auto px-4 sm:px-6 pb-[120px] flex flex-col items-center animate-fade-in-up" style="animation-delay: 400ms;">
      <p class="text-[13px] font-semibold tracking-widest text-mute uppercase mb-4">
        글로벌 톱티어 기술 블로그 및 AI 연구소의 최신 아티클
      </p>
      <div class="w-full relative">
        <!-- Subtle gradient overlays for depth -->
        <div class="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-hairline to-transparent"></div>
        <div class="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-hairline to-transparent"></div>
        
        <UiLogoCloud />
      </div>
    </section>
  </main>
</template>

<script setup>
useHead({
  bodyAttrs: {
    class: '!bg-canvas transition-colors duration-300'
  }
})
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
