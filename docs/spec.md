# bit-feed Technical Specification

## 1. Overview
bit-feed는 IT 분야(프로그래밍 언어, 프론트엔드, 백엔드, 인공지능, 보안)의 최신 소식과 릴리스 정보를 한 곳에서 모아볼 수 있는 서버리스 기반의 웹 애플리케이션입니다. 

## 2. Core Features
- **자동화된 데이터 수집**: 73개의 공식 RSS 피드 및 8개의 커스텀 크롤러를 통해 데이터를 수집하여 정적 데이터(JSON)로 저장.
- **아카이브 및 최신화 로직**: 데이터를 전체 누적 아카이브(`all.json`)로 병합 후 최근 7일치만 필터링하여 `latest.json`에 동기화하는 **롤링 윈도우(Rolling Window)** 아키텍처를 적용하여, 즉각적인 최신화를 보장하고 파이프라인 효율성을 극대화.
- **AI 에이전트 기반 동적 요약 (Function Calling)**: 멀티 모델(Gemini 3.5 Flash / 3.1 Flash-Lite)을 연동하여 장문의 기사 내용을 2~3줄의 정중한 평문으로 실시간 요약(`aiSummary` 필드). 특히 본문이 지나치게 짧을 경우 에이전트가 `fetchUrlContent` 도구를 호출해 원본 링크를 직접 크롤링하는 자율성을 지닙니다.
- **지수 백오프(Exponential Backoff) 기반 장애 복구**: 구글 API의 503 Service Unavailable 등 일시적인 통신 장애 발생 시, Jitter를 포함한 Exponential Backoff(2초 -> 4초 -> 8초) 재시도 로직을 가동하여 중단 없는 안정적인 요약본 생성을 보장합니다.
- **다중 필터링 시스템**: 카테고리, 출처, 태그, 날짜 등 복합적인 조건을 조합하여 원하는 뉴스만 필터링 기능 제공.
- **모던 대시보드 UI**: 커스텀 SVG 로고와 "What's New" / "All Updates"가 구분된 직관적인 반응형 레이아웃 제공.

## 3. Technology Stack
- **프론트엔드 프레임워크**: Nuxt (Vue.js)
- **스타일링**: Tailwind CSS
- **데이터베이스/저장소**: 순수 JSON 데이터 파일 (`latest.json`, `all.json`)
- **AI 연동**: `@google/generative-ai` (Gemini API)
- **자동화 파이프라인**: GitHub Actions (스케줄링 기반 모듈화된 Node.js 스크립트 실행, Race condition 방지를 위한 Concurrency 제어 적용)
- **배포 환경**: Vercel 또는 GitHub Pages 기반 정적 호스팅

## 4. Design Guidelines (Vercel Style)
- **Theme**: 다크모드를 기본(Default)으로 설정하며, Vercel 스타일의 완전한 색상 반전(True Dark Mode)을 지원하여 시각적 피로도를 낮추고 프리미엄 감각 유지.
- **Typography**: 메인 텍스트는 산세리프(Inter/Geist), 기술적인 메타데이터는 모노스페이스 사용.
- **Color Palette**: 블랙(Ink)과 화이트, 옅은 캔버스 그레이를 활용한 명도 대비 중심의 심플한 컬러 시스템 적용.
- **Elevation**: 단순한 그림자가 아닌, 얇은 테두리(Inset hairline)와 다단계 그림자(Stacked shadow)를 조합하여 세련된 입체감 표현.
- **Shape**: 주요 CTA 버튼은 완전한 둥근 형태(Pill), 일반 UI 요소는 약간의 곡률을 가진 사각형 사용.

## 5. Data Specification
- **데이터 출처 원칙**: 개인 블로그나 포괄적 매체는 제외하며, 반드시 각 언어/프레임워크 및 기업의 **공식 블로그 및 공식 문서**만을 데이터 소스로 취급.
- **수집 방식**: RSS 엔드포인트가 있는 73개 피드는 `rss-parser`로 직접 파싱, RSS가 없는 8개 플랫폼(Anthropic, DeepSeek, Vite, Babel, Bun, Cursor, Sublime Text, Antigravity)은 JSDOM/Readability 또는 JS 번들 직접 파싱 기반 커스텀 크롤러로 수집.
- **주요 카테고리 (총 5가지)**:
  - 프로그래밍 언어 (프론트엔드 및 백엔드를 구성하는 주요 언어: JavaScript, TypeScript, Java, Python, PHP, Go 등)
  - 프론트엔드 (각 언어에 맞는 주요 프레임워크 또는 라이브러리: React, Vue, Next.js, Nuxt, Svelte 등)
  - 백엔드 (각 언어에 맞는 주요 프레임워크 또는 라이브러리: Spring, Laravel, Express, Django 등)
  - 인공지능 (OpenAI, Claude, Gemini, Antigravity 등)
  - 보안 (주요 보안 취약점 공지 등)
- **데이터 스키마**: 단일 기사는 고유 식별자, 제목, 요약, 카테고리, 출처, 작성자, 발행일, 태그, 원본 링크 등의 풍부한 메타데이터 필드를 포함하여 필터링을 지원.

## 6. Open API (외부 연동)
`bit-feed`는 수집된 데이터를 서드파티 서비스가 활용할 수 있도록 Nuxt Nitro 기반의 REST API를 제공합니다. 보안을 위해 CORS 미들웨어를 통해 `localhost`, `revi1337.com`, `*.revi1337.com` 출처의 요청만 허용합니다.

- **`GET /api`**: `server/assets/openapi.yml`을 `application/yaml`로 반환. API 명세 직접 조회용.
- **`GET /api/feeds/latest`**: 최신(`latest.json`) 수집 기사 원본 배열 반환.
- **`GET /api/feeds`**: 아카이브(`all.json`) 전체 기사를 대상으로 한 검색 및 필터링 기능 지원.
  - 파라미터: `page`, `limit`, `category`, `source`, `q` (검색어), `from`/`to` (pubDate 기간 범위, ISO8601)
- **`GET /api/feeds/sources`**: 데이터 내 고유 출처(`source`) 목록 정렬 배열 반환.
- **`GET /api/feeds/categories`**: 데이터 내 고유 카테고리(category) 목록 정렬 배열 반환.

## 7. Data Pipeline Architecture (Scripts)

스크립트 파이프라인을 역할별로 완벽히 분리하고 OCP(Open/Closed Principle) 기반의 확장 구조를 적용하여 새 데이터 소스 추가 시 기존 파일을 수정하지 않아도 됩니다.

### 설정 모듈 (`scripts/config/`)
- **`feeds.mjs`**: 73개의 RSS 피드 URL, 카테고리, 태그를 한곳에서 관리하는 중앙화 설정 모듈.
- **`scrapers.mjs`**: OCP 기반 커스텀 스크래퍼 레지스트리. `CUSTOM_SCRAPERS` 배열에 함수를 등록하면 `fetch-rss.mjs`와 `test-run.mjs`에 자동 반영됨. 새 스크래퍼 추가 시 이 파일과 `scrapers/` 디렉토리만 수정.
- **`constants.mjs`**: 파이프라인 전체에서 공유하는 상수 정의 (최대 기사 수, 요약 길이, AI 딜레이, 롤링 윈도우 기간 등). `BLOCKED_KEYWORDS` 포함: 팟캐스트·튜토리얼·비교글 등 노이즈성 기사를 제목 기반으로 차단하는 키워드 목록. `'vs'`는 오탐지 방지를 위해 `/\bvs\b/` 정규식으로 처리.

### 커스텀 스크래퍼 (`scripts/scrapers/`)
RSS 엔드포인트가 없는 플랫폼을 위한 개별 스크래퍼 파일. 각 파일은 `(existingMap, runTime) => Promise<Article[]>` 시그니처를 준수.
- `anthropic.mjs`, `deepseek.mjs`, `vite.mjs`, `babel.mjs`, `bun.mjs`, `cursor.mjs`, `sublime.mjs`, `antigravity.mjs`
- `antigravity.mjs`는 Angular SPA(`antigravity.google/changelog`)의 배포된 JS 번들에서 고유 마커로 `changelogData`를 직접 추출하는 방식으로 동작. `engineSections`(인공지능)과 `ideSections`(IDE & 개발 도구)를 각 5개씩 독립 수집.

### 공유 유틸리티 (`scripts/utils/`)
- **`scraper.mjs`**: 공유 유틸리티 모듈. `JSDOM`·`Readability` 기반 HTML 파싱, `stripHtmlAndPreserveLinks`, `fetchAndExtractArticle`, `fetchRssFeeds`(gzip 폴백 포함), `createArticle` 헬퍼 포함. RSS 파싱 실패 시 `Content-Encoding: gzip` 여부를 확인하여 fetch 기반으로 자동 재시도.
- **`ai.mjs`**: Gemini API 연동 핵심 요약 모듈. `startChat` 기반 Function Calling 에이전트, 멀티 모델 분기, Exponential Backoff 재시도 로직 담당.

### 실행 스크립트
- **`scripts/fetch-rss.mjs`**: 메인 Orchestrator. RSS 수집 + 커스텀 스크래핑을 병렬 실행하고 AI 요약 후 `all.json`·`latest.json` 저장. 파이프라인 완료 후 `temp.json` 자동 삭제.
- **`scripts/sync/fill-missing.mjs`**: `all.json`에서 `aiSummary`가 누락되거나 오류 상태인 기사만 선택적으로 재요약하는 복구 스크립트.
- **`scripts/sync/test-run.mjs`**: 전체 파이프라인(RSS + 모든 스크래퍼)을 실행하되 `all.json`·`latest.json`을 건드리지 않고 `temp.json`에만 결과를 저장하는 안전 테스트 스크립트.
- **`scripts/sync/scraper-tester.mjs`**: 특정 스크래퍼 하나만 단독 실행하여 AI 요약까지 처리 후 `public/data/scraper-{이름}.json`에 저장하는 범용 개발·디버깅 도구. (`node scripts/sync/scraper-tester.mjs <이름>`)
