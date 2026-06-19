export const FEEDS = [
  // 1. 프로그래밍 언어
  { name: 'The Go Blog', url: 'https://go.dev/blog/feed.atom', category: '프로그래밍 언어', tags: ['Go'] },
  { name: 'Python Insider', url: 'https://blog.python.org/feeds/posts/default', category: '프로그래밍 언어', tags: ['Python'] },
  { name: 'Rust Blog', url: 'https://blog.rust-lang.org/feed.xml', category: '프로그래밍 언어', tags: ['Rust'] },
  { name: 'TypeScript Blog', url: 'https://devblogs.microsoft.com/typescript/feed/', category: '프로그래밍 언어', tags: ['TypeScript', 'JS'] },
  { name: 'Inside Java', url: 'https://inside.java/feed.xml', category: '프로그래밍 언어', tags: ['Java'] },
  { name: 'Ruby News', url: 'https://www.ruby-lang.org/en/feeds/news.rss', category: '프로그래밍 언어', tags: ['Ruby'] },
  { name: 'ISO C++', url: 'https://isocpp.org/blog/rss', category: '프로그래밍 언어', tags: ['C++'] },
  { name: 'PHP News', url: 'https://www.php.net/feed.atom', category: '프로그래밍 언어', tags: ['PHP'] },
  { name: '.NET Blog', url: 'https://devblogs.microsoft.com/dotnet/feed/', category: '프로그래밍 언어', tags: ['C#', '.NET'] },
  { name: 'Swift Blog', url: 'https://www.swift.org/atom.xml', category: '프로그래밍 언어', tags: ['Swift', 'Apple'] },
  { name: 'Flutter Blog', url: 'https://medium.com/feed/flutter', category: '프로그래밍 언어', tags: ['Flutter', 'Dart'] },
  { name: 'Kotlin Blog', url: 'https://blog.jetbrains.com/kotlin/feed/', category: '프로그래밍 언어', tags: ['Kotlin', 'Android'] },

  // 2. 프론트엔드
  { name: 'Vue.js Blog', url: 'https://blog.vuejs.org/feed.rss', category: '프론트엔드', tags: ['Vue'] },
  { name: 'React Blog', url: 'https://react.dev/rss.xml', category: '프론트엔드', tags: ['React'] },
  { name: 'Angular Blog', url: 'https://blog.angular.dev/feed', category: '프론트엔드', tags: ['Angular'] },
  { name: 'Next.js Blog', url: 'https://nextjs.org/feed.xml', category: '프론트엔드', tags: ['Next.js', 'React'] },
  { name: 'Svelte Blog', url: 'https://svelte.dev/blog/rss.xml', category: '프론트엔드', tags: ['Svelte'] },
  { name: 'Astro Blog', url: 'https://astro.build/rss.xml', category: '프론트엔드', tags: ['Astro'] },
  { name: 'Tailwind CSS', url: 'https://tailwindcss.com/feeds/feed.xml', category: '프론트엔드', tags: ['Tailwind', 'CSS'] },

  // 3. 백엔드
  { name: 'Spring Engineering', url: 'https://spring.io/blog/category/engineering.atom', category: '백엔드', tags: ['Spring', 'Java'] },
  { name: 'Spring Releases', url: 'https://spring.io/blog/category/releases.atom', category: '백엔드', tags: ['Spring', 'Java'] },
  { name: 'Spring News', url: 'https://spring.io/blog/category/news.atom', category: '백엔드', tags: ['Spring', 'Java'] },
  { name: 'Node.js Blog', url: 'https://nodejs.org/en/feed/blog.xml', category: '백엔드', tags: ['Node.js', 'JS'] },
  { name: 'Deno Blog', url: 'https://deno.com/feed', category: '백엔드', tags: ['Deno', 'TS'] },
  { name: 'Django Weblog', url: 'https://www.djangoproject.com/rss/weblog/', category: '백엔드', tags: ['Django', 'Python'] },
  { name: 'Flask Blog (Pallets)', url: 'https://palletsprojects.com/blog/feed.xml', category: '백엔드', tags: ['Flask', 'Python'] },
  { name: 'FastAPI Releases', url: 'https://github.com/fastapi/fastapi/releases.atom', category: '백엔드', tags: ['FastAPI', 'Python'] },
  { name: 'NestJS Releases', url: 'https://github.com/nestjs/nest/releases.atom', category: '백엔드', tags: ['NestJS', 'Node.js', 'TS'] },
  { name: 'ASP.NET Core', url: 'https://devblogs.microsoft.com/dotnet/category/aspnet/feed/', category: '백엔드', tags: ['ASP.NET', 'C#', '.NET'] },
  { name: 'Laravel News', url: 'https://laravel-news.com/feed', category: '백엔드', tags: ['Laravel', 'PHP'] },
  { name: 'Ruby on Rails', url: 'https://rubyonrails.org/feed.xml', category: '백엔드', tags: ['Rails', 'Ruby'] },
  { name: 'Prisma Blog', url: 'https://www.prisma.io/blog/rss.xml', category: '백엔드', tags: ['Prisma', 'ORM', 'Database'] },

  // 4. 데이터베이스 (DBMS & NoSQL)
  { name: 'PostgreSQL News', url: 'https://www.postgresql.org/news.rss', category: '데이터베이스', tags: ['PostgreSQL', 'SQL'] },
  { name: 'MySQL Blog (Percona)', url: 'https://www.percona.com/blog/feed/', category: '데이터베이스', tags: ['MySQL', 'Database'] },
  { name: 'MongoDB Blog', url: 'https://www.mongodb.com/blog/rss', category: '데이터베이스', tags: ['MongoDB', 'NoSQL'] },
  { name: 'Redis Blog', url: 'https://redis.io/feed', category: '데이터베이스', tags: ['Redis', 'NoSQL', 'Cache'] },
  { name: 'Elastic Blog', url: 'https://www.elastic.co/blog/feed', category: '데이터베이스', tags: ['ElasticSearch', 'NoSQL'] },
  { name: 'Supabase Blog', url: 'https://supabase.com/rss.xml', category: '데이터베이스', tags: ['Supabase', 'PostgreSQL', 'BaaS'] },
  { name: 'Firebase Blog', url: 'https://firebase.blog/rss.xml', category: '데이터베이스', tags: ['Firebase', 'NoSQL', 'BaaS'] },
  { name: 'Apollo GraphQL', url: 'https://www.apollographql.com/blog/rss.xml', category: '데이터베이스', tags: ['GraphQL', 'Apollo'] },

  // 5. 클라우드 & 인프라
  { name: 'AWS News Blog', url: 'https://aws.amazon.com/blogs/aws/feed/', category: '클라우드 & 인프라', tags: ['AWS', 'Cloud'] },
  { name: 'Google Cloud Blog', url: 'https://cloudblog.withgoogle.com/rss/', category: '클라우드 & 인프라', tags: ['GCP', 'Cloud'] },
  { name: 'Docker Blog', url: 'https://www.docker.com/blog/feed/', category: '클라우드 & 인프라', tags: ['Docker', 'Infra'] },
  { name: 'Kubernetes Blog', url: 'https://kubernetes.io/feed.xml', category: '클라우드 & 인프라', tags: ['Kubernetes', 'Infra'] },
  { name: 'Terraform Blog', url: 'https://www.hashicorp.com/blog/feed.xml', category: '클라우드 & 인프라', tags: ['Terraform', 'IaC'] },
  { name: 'GitHub Changelog', url: 'https://github.blog/changelog/feed/', category: '클라우드 & 인프라', tags: ['GitHub', 'DevOps'] },

  // 6. 인공지능
  { name: 'Google DeepMind', url: 'https://deepmind.google/blog/rss.xml', category: '인공지능', tags: ['DeepMind', 'Gemini', 'AI'] },
  { name: 'Google Gemini Blog', url: 'https://blog.google/products/gemini/rss/', category: '인공지능', tags: ['Google', 'Gemini', 'AI'] },
  { name: 'OpenAI News', url: 'https://openai.com/news/rss.xml', category: '인공지능', tags: ['OpenAI', 'LLM', 'AI'] },
  { name: 'Ollama Blog', url: 'https://ollama.com/blog/rss.xml', category: '인공지능', tags: ['Ollama', 'LLM', 'Local AI'] },
  { name: 'Qwen Blog', url: 'https://qwenlm.github.io/blog/index.xml', category: '인공지능', tags: ['Qwen', 'LLM', 'Alibaba'] },

  // 7. 웹 생태계 & 브라우저
  { name: 'V8 JavaScript Engine', url: 'https://v8.dev/blog.atom', category: '웹 생태계 & 브라우저', tags: ['V8', 'JavaScript'] },
  { name: 'WebKit Blog', url: 'https://webkit.org/blog/feed/', category: '웹 생태계 & 브라우저', tags: ['WebKit', 'Safari'] },
  { name: 'MDN Web Docs (Hacks)', url: 'https://hacks.mozilla.org/feed/', category: '웹 생태계 & 브라우저', tags: ['MDN', 'Web Standards'] },

  // 8. IDE & 개발 도구
  { name: 'VS Code', url: 'https://code.visualstudio.com/feed.xml', category: 'IDE & 개발 도구', tags: ['VS Code', 'Editor'] },
  { name: 'JetBrains Blog', url: 'https://blog.jetbrains.com/feed/', category: 'IDE & 개발 도구', tags: ['JetBrains', 'IDE'], allowedCategories: ['news', 'events'] }
];
