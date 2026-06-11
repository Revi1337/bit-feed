<template>
  <main class="flex-1 w-full flex flex-col items-center bg-canvas">
    <!-- Hero Section -->
    <section class="w-full max-w-[1200px] mx-auto px-6 pt-[120px] pb-[80px] flex flex-col items-center text-center">
      
      <h1 class="text-[48px] md:text-[72px] font-extrabold tracking-tighter leading-[1.1] mb-6 text-ink animate-fade-in-up" style="animation-delay: 100ms;">
        Stay Ahead of the Curve<br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Effortlessly.</span>
      </h1>
      
      <p class="text-[18px] md:text-[20px] text-body max-w-[600px] leading-relaxed mb-10 animate-fade-in-up" style="animation-delay: 200ms;">
        Your ultimate tech news hub. We fetch, filter, and summarize updates from 40+ leading tech blogs and AI labs. All powered by Gemini.
      </p>
      
      <div class="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up" style="animation-delay: 300ms;">
        <NuxtLink to="/new" class="flex items-center gap-2 px-8 py-3.5 rounded-lg bg-ink text-canvas font-semibold text-[15px] hover:opacity-90 transition-all shadow-level-2 hover:shadow-level-3">
          Read Today's News
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transform group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </NuxtLink>
        <NuxtLink to="/all" class="px-8 py-3.5 rounded-lg bg-canvas text-ink font-semibold text-[15px] hover:bg-canvas-soft transition-all border border-hairline shadow-sm">
          Browse All Updates
        </NuxtLink>
      </div>
    </section>

    <!-- Logo Cloud Section -->
    <section class="w-full max-w-[1400px] mx-auto px-4 sm:px-6 pb-[120px] flex flex-col items-center animate-fade-in-up" style="animation-delay: 400ms;">
      <p class="text-[13px] font-semibold tracking-widest text-mute uppercase mb-4">
        Trusted sources we monitor daily
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
