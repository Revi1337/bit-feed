<template>
  <div class="w-full overflow-hidden relative mask-edges py-8">
    <div class="flex w-max animate-marquee hover:pause-animation">
      <!-- Group 1 -->
      <div class="flex items-center gap-4 pr-4">
        <div v-for="item in mappedLogos" :key="item.name" class="whitespace-nowrap px-6 py-3 rounded-full bg-canvas border border-hairline shadow-sm flex items-center justify-center font-semibold text-[15px] tracking-tight text-body hover:text-ink transition-colors hover:border-hairline-strong gap-2.5">
          <svg class="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24" v-html="item.svg"></svg>
          {{ item.name }}
        </div>
      </div>
      <!-- Group 2 (Duplicate for seamless loop) -->
      <div class="flex items-center gap-4 pr-4" aria-hidden="true">
        <div v-for="item in mappedLogos" :key="item.name + '-dup'" class="whitespace-nowrap px-6 py-3 rounded-full bg-canvas border border-hairline shadow-sm flex items-center justify-center font-semibold text-[15px] tracking-tight text-body hover:text-ink transition-colors hover:border-hairline-strong gap-2.5">
          <svg class="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24" v-html="item.svg"></svg>
          {{ item.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  siGo, siPython, siRust, siTypescript, siOpenjdk, siRuby, siCplusplus, siPhp, siDotnet, siSwift, siFlutter,
  siVuedotjs, siReact, siAngular, siNextdotjs, siSvelte, siAstro, siTailwindcss,
  siSpring, siNodedotjs, siDjango, siFlask, siFastapi, siNestjs, siLaravel,
  siPostgresql, siMysql, siMongodb, siRedis, siElasticsearch, siSupabase, siFirebase, siApollographql,
  siDocker, siKubernetes, siDeepmind, siOllama, siQwen 
} from 'simple-icons';

// OpenAI is not available in simple-icons, so we provide its exact SVG path
const openaiSvg = '<path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A6.0651 6.0651 0 0 0 19.0192 19.818a5.9847 5.9847 0 0 0 3.9977-2.9 6.0462 6.0462 0 0 0-.735-7.0969zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.5973 8.3829v-2.3324a.0804.0804 0 0 1 .0332-.0615l3.9725-2.2865a4.4992 4.4992 0 0 1 6.1408 1.6464 4.4708 4.4708 0 0 1 .5346 3.0137l-.1416-.0852-4.7878-2.7582a.7712.7712 0 0 0-.7806 0zM8.4549 4.0084a4.4755 4.4755 0 0 1 2.8764 1.0408l-.1416.0804-4.7783 2.7582a.7948.7948 0 0 0-.3927.6813V15.306l-2.02-1.1686a.071.071 0 0 1-.038-.052V8.5028a4.504 4.504 0 0 1 4.4945-4.4944zm9.0607 5.6996l-5.8145-3.3543 2.0201-1.1685a.0757.0757 0 0 1 .071 0l4.8303 2.7865a4.504 4.504 0 0 1 1.6498 6.1751V8.4262a.7664.7664 0 0 0-.3879-.6765zm-4.9084 1.6247l-2.0622-1.1925v2.3851l2.0622 1.1925-2.0622-1.1925z"/>';

const getPath = (icon) => `<path d="${icon.path}" />`;

const mappedLogos = [
  { name: 'The Go Blog', svg: getPath(siGo) },
  { name: 'Python Insider', svg: getPath(siPython) },
  { name: 'Rust Blog', svg: getPath(siRust) },
  { name: 'TypeScript Blog', svg: getPath(siTypescript) },
  { name: 'Inside Java', svg: getPath(siOpenjdk) },
  { name: 'Ruby News', svg: getPath(siRuby) },
  { name: 'ISO C++', svg: getPath(siCplusplus) },
  { name: 'PHP News', svg: getPath(siPhp) },
  { name: '.NET Blog', svg: getPath(siDotnet) },
  { name: 'Swift Blog', svg: getPath(siSwift) },
  { name: 'Flutter Blog', svg: getPath(siFlutter) },
  { name: 'Vue.js Blog', svg: getPath(siVuedotjs) },
  { name: 'React Blog', svg: getPath(siReact) },
  { name: 'Angular Blog', svg: getPath(siAngular) },
  { name: 'Next.js Blog', svg: getPath(siNextdotjs) },
  { name: 'Svelte Blog', svg: getPath(siSvelte) },
  { name: 'Astro Blog', svg: getPath(siAstro) },
  { name: 'Tailwind CSS', svg: getPath(siTailwindcss) },
  { name: 'Spring Engineering', svg: getPath(siSpring) },
  { name: 'Node.js Blog', svg: getPath(siNodedotjs) },
  { name: 'Django Weblog', svg: getPath(siDjango) },
  { name: 'Flask Blog', svg: getPath(siFlask) },
  { name: 'FastAPI', svg: getPath(siFastapi) },
  { name: 'NestJS', svg: getPath(siNestjs) },
  { name: 'ASP.NET Core', svg: getPath(siDotnet) },
  { name: 'Laravel News', svg: getPath(siLaravel) },
  { name: 'Ruby on Rails', svg: getPath(siRuby) },
  { name: 'PostgreSQL', svg: getPath(siPostgresql) },
  { name: 'MySQL', svg: getPath(siMysql) },
  { name: 'MongoDB Blog', svg: getPath(siMongodb) },
  { name: 'Redis Blog', svg: getPath(siRedis) },
  { name: 'Elastic Blog', svg: getPath(siElasticsearch) },
  { name: 'Supabase Blog', svg: getPath(siSupabase) },
  { name: 'Firebase Blog', svg: getPath(siFirebase) },
  { name: 'Apollo GraphQL', svg: getPath(siApollographql) },
  { name: 'Docker Blog', svg: getPath(siDocker) },
  { name: 'Kubernetes Blog', svg: getPath(siKubernetes) },
  { name: 'Google DeepMind', svg: getPath(siDeepmind) },
  { name: 'OpenAI News', svg: openaiSvg },
  { name: 'Ollama Blog', svg: getPath(siOllama) },
  { name: 'Qwen Blog', svg: getPath(siQwen) }
];
</script>

<style scoped>
.mask-edges {
  mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
}

.animate-marquee {
  animation: marquee 80s linear infinite;
}

.pause-animation:hover {
  animation-play-state: paused;
}

@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>
