# bit-feed PRD (Product Requirements Document)

본 문서는 IT 뉴스 통합 뷰어 프로젝트(bit-feed)의 개발 요구사항과 구현 단계를 Phase별로 나누어 정리한 문서입니다. 작은 단위부터 점진적으로 기능을 확장해 나가는 방식으로 구성되었습니다.

## Phase 1: Project Setup & Foundation (기초 뼈대 구축)
가장 기본이 되는 프로젝트 환경과 Vercel 디자인 시스템의 기초를 설정합니다.

- [x] Nuxt 3 프로젝트 초기화 (`npx nuxi@latest init`)
- [x] Tailwind CSS 모듈 설치 및 설정 (`@nuxtjs/tailwindcss`)
- [x] `docs/DESIGN.md` 내용을 기반으로 `tailwind.config.js` 테마 확장 (Vercel 색상, 폰트, 그림자 토큰 설정)
- [x] 전역 폰트(Inter/Geist, Mono) 및 글로벌 스타일시트(`assets/css/main.css`) 적용
- [x] `public/data/news.json` 생성 및 임시 Mock 데이터 입력
- [x] Phase 1 작업 내역 Git Commit (`git commit -m "chore: finish phase 1 - project setup"`)

## Phase 2: UI Component Development (디자인 시스템 기반 컴포넌트)
`docs/DESIGN.md` 가이드라인에 맞춰 세부 컴포넌트들을 하나씩 조립합니다.

- [x] 네비게이션 및 헤더 바(Logo, 6px Nav 버튼) 퍼블리싱
- [x] 공통 100px Pill 형태 버튼, 배지(Badge) 등 소형 컴포넌트 개발
- [x] 좌측 사이드바 컴포넌트 레이아웃 구성 (카테고리 필터 영역)
- [x] 우측 리스트뷰 레이아웃 구성
- [x] 뉴스 카드(News Card) 컴포넌트 퍼블리싱 (1px inset hairline 및 Stacked Shadow 적용)
- [x] 반응형(Responsive) 처리를 통한 모바일/데스크톱 레이아웃 조정
- [x] Phase 2 작업 내역 Git Commit (`git commit -m "feat: finish phase 2 - UI components"`)

## Phase 3: Data Collection Pipeline (RSS 데이터 수집 스크립트)
백엔드 서버 없이 GitHub Actions 환경에서 구동될 데이터 수집 로직을 구현합니다.

- [x] Node.js 기반 RSS 파싱을 위한 프로젝트 스크립트 생성 (`scripts/fetch-rss.js`)
- [x] `rss-parser` 라이브러리 설치
- [x] 대상 블로그 목록 세팅 (58개의 프론트엔드/백엔드/인공지능/보안 공식 블로그 및 문서로 확장)
- [x] 기본 RSS 파싱이 불가능한 CSR/SPA 블로그(Vite, Babel, Bun 등)를 위한 커스텀 크롤러 스크립트(`scraper.mjs`) 도입
- [x] 대상 블로그 피드 URL에서 데이터를 추출 및 정제하는 로직 구현
- [x] 여러 다중 필터(카테고리, 출처, 날짜, 태그 등) 적용을 위해 `news.json` 데이터 구조를 세분화하여 가공 (예: `id`, `title`, `summary`, `url`, `category`, `source`, `author`, `pubDate`, `tags` 등 다양한 필드 포함)
- [x] 파싱 및 정제된 데이터를 `public/data/news.json` 파일로 덮어쓰기 저장하는 로직 구현
- [x] Phase 3 작업 내역 Git Commit (`git commit -m "feat: finish phase 3 - data pipeline"`)

## Phase 4: Frontend Data Integration & State (데이터 연동 및 필터링)
미리 수집된 정적 데이터(JSON)를 프론트엔드 화면에 동적으로 연결합니다.

- [x] Nuxt `useFetch` 또는 정적 임포트를 이용해 `news.json` 데이터를 로드
- [x] 전역 상태(또는 컴포넌트 상태)로 카테고리, 출처, 태그 등 다양한 필터 상태 관리 (다중 필터 지원)
- [x] 데이터의 여러 field(`category`, `source`, `pubDate`, `tags` 등)를 조합하여 필터링하는 복합 필터 로직 구현
- [x] 다중 필터 상태에 따라 사이드바 UI 동기화 (체크박스/토글 상태 등 표기)
- [x] 필터 조건에 따라 필터링된 뉴스 리스트 렌더링 로직 연동
- [x] 각 뉴스 카드에 실제 기사 정보(제목, 요약, 발행일, 출처, 태그, 링크 등) 매핑
- [x] Phase 4 작업 내역 Git Commit (`git commit -m "feat: finish phase 4 - data integration"`)

## Phase 5: Automation & Deployment (자동화 및 배포)
정기적인 콘텐츠 업데이트와 자동 배포 파이프라인을 구축합니다.

- [x] `.github/workflows/update-news.yml` 파일 생성
- [x] Cron Job을 설정하여 주기적(예: 6시간/12시간 간격)으로 `npm run fetch-rss` 실행 설정
- [x] GitHub Actions 내에서 업데이트된 `news.json`을 Git Commit & Push 하는 파이프라인 완성
- [x] 워크플로우 동시성 이슈(Race condition) 방지를 위해 `concurrency: cancel-in-progress` 로직 추가
- [x] 최종 웹 어플리케이션 배포 환경 설정 (Vercel 또는 GitHub Pages 연동)
- [x] 모바일/웹 환경 통합 테스트 및 최종 검수
- [x] Phase 5 작업 내역 Git Commit (`git commit -m "feat: finish phase 5 - automation and deployment"`)

## Phase 6: Advanced Features & Refinement (고급 기능 및 고도화)
기본 구축이 완료된 이후, 사용자 경험(UX)과 데이터 퀄리티를 향상하기 위해 도입한 고급 기능들입니다.

- [x] `all.json`(전체 누적 아카이브)과 `latest.json`(최근 업데이트) 파일 분리 로직 및 데이터 파이프라인 고도화(조기 종료, 동시 저장) 완전 구현
- [x] Gemini API를 활용한 기사 핵심 AI 요약(`aiSummary`) 기능 연동
- [x] AI 요약 프롬프트 엄격화 (마크다운 배제, 2~3문장 제한, 정중한 존댓말 통일 등)
- [x] "What's New"(`latest.json`)와 "All Updates"(`all.json`) 탭 UI 분리 및 네비게이션 연동
- [x] 랜딩 페이지 LogoCloud 업데이트: 50+ 곳의 파서 출처(AWS, WebKit 등 커스텀 SVG 포함) 연동
- [x] 불필요한 시리즈/팟캐스트 필터링을 위해 Spring 블로그 피드를 Engineering, Releases, News 3개 채널로 정밀하게 분리
- [x] Phase 6 작업 내역 Git Commit (`git commit -m "feat: finish phase 6 - advanced features and AI summary"`)

## Phase 7: Final Polish & UX Enhancements (다크모드 및 사용성 최적화)
사용자 피드백을 반영하여 다크모드 기본 적용, 사이드바 고정 등 세밀한 UI/UX 개선을 진행합니다.

- [x] Vercel 스타일의 완벽한 다크모드 테마 적용 및 기본(Default) 테마로 설정 (`nuxt.config.ts` 및 컴포넌트 클래스 조정)
- [x] 다크모드 전환 시 SVG 로고 색상 반전 및 투명도, 버튼 호버(hover) 시인성 등 디테일 보정
- [x] 모달(Modal) 컴포넌트의 헤더, 본문, 푸터 배경색 통일하여 빛 반사 및 이질감 제거
- [x] 데스크톱 환경에서 스크롤을 내릴 때 우측 필터 패널이 따라오는 Sticky 기능 적용 (내부 이중 스크롤 제거)
- [x] 랜딩 페이지 및 뉴스 피드의 빈 화면(Empty State) 영문 메시지를 자연스러운 한국어로 현지화
- [x] Phase 7 작업 내역 Git Commit (`git commit -m "chore(docs): update PRD with Phase 7 UX enhancements"`)

## Phase 8: Open API 연동 (외부 서비스 제공용)
외부 서비스(타사 대시보드, 슬랙 봇 등)에서 `bit-feed`의 요약 데이터를 활용할 수 있도록 Nuxt Nitro 기반의 RESTful API를 구축합니다.

- [x] `server/middleware/cors.ts`: 지정된 도메인(`localhost`, `*.revi1337.com`, `revi1337.com`)에서만 접근할 수 있도록 동적 CORS 헤더 제어 로직 구현.
- [x] `server/api/feeds/latest.get.ts`: 가장 최근에 수집된 `latest.json` 데이터 반환 엔드포인트 구현.
- [x] `server/api/feeds/index.get.ts`: 전체 아카이브(`all.json`) 데이터 조회 기능. 검색어(`q`), 카테고리(`category`), 출처(`source`), 페이지네이션(`page`, `limit`) 필터링 지원.
- [x] `server/api/feeds/sources.get.ts`: 데이터 내에 존재하는 모든 출처(sourceName) 목록 반환.
- [x] `server/api/feeds/categories.get.ts`: 데이터 내에 존재하는 모든 카테고리(category) 목록 반환.
- [x] Phase 8 작업 내역 Git Commit (`git commit -m "feat: add Open API routes and CORS middleware"`)

## Phase 9: AI Agent & Scripts Modularization (스크립트 모듈화 및 에이전트 도입)
기존의 단일 파이프라인 스크립트를 역할별로 분리하고, AI 요약 기능을 강화하여 자율 에이전트(Agentic Workflow) 수준으로 고도화합니다.

- [x] Monolithic 구조의 `fetch-rss.mjs`를 `config/`, `sync/`, `utils/` 모듈로 완벽히 분리.
- [x] `gemini-3.5-flash` 모델에 `startChat` 기반의 Function Calling(`fetchUrlContent`) 에이전트 능력을 부여하여 짧은 본문을 감지하면 원본 링크의 내용을 자율적으로 크롤링.
- [x] 구글 서버의 503 장애 등에 대응하기 위한 지수 백오프(Exponential Backoff: 2s -> 4s -> 8s) 공통 재시도 로직 도입.
- [x] 링크 유실을 방지하기 위해 `scraper.mjs`의 `JSDOM` 기반 `<a>` 태그 추출 로직(`stripHtmlAndPreserveLinks`) 적용.
- [x] 누락된 요약본만 선택적으로 복구하는 `fill-missing.mjs` 독립 스크립트 작성.
- [x] Phase 9 작업 내역 Git Commit (`git commit -m "feat(ai): add function calling for external links and unify retry logic"`)
