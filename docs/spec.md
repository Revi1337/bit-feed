# bit-feed Technical Specification

## 1. Overview
bit-feed는 IT 분야(프로그래밍 언어, 프론트엔드, 백엔드, 인공지능, 보안)의 최신 소식과 릴리스 정보를 한 곳에서 모아볼 수 있는 서버리스 기반의 웹 애플리케이션입니다. 

## 2. Core Features
- **자동화된 데이터 수집**: 58개의 타겟 출처 RSS 피드 및 SPA 사이트를 수집하여 정적 데이터(JSON)로 저장. 커스텀 크롤러(`scraper.mjs`) 지원.
- **아카이브 및 최신화 로직**: 데이터를 전체 누적 아카이브(`all.json`)로 병합 후 최신 50개만 잘라내어 `latest.json`에 동기화하는 **롤링 윈도우(Rolling Window)** 아키텍처를 적용하여, 날짜 필터링 없이 즉각적인 최신화를 보장하고 파이프라인 효율성을 극대화.
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
- **주요 카테고리 (총 5가지)**:
  - 프로그래밍 언어 (프론트엔드 및 백엔드를 구성하는 주요 언어: JavaScript, TypeScript, Java, Python, PHP, Go 등)
  - 프론트엔드 (각 언어에 맞는 주요 프레임워크 또는 라이브러리: React, Vue, Next.js, Nuxt, Svelte 등)
  - 백엔드 (각 언어에 맞는 주요 프레임워크 또는 라이브러리: Spring, Laravel, Express, Django 등)
  - 인공지능 (OpenAI, Claude, Gemini, Antigravity 등)
  - 보안 (주요 보안 취약점 공지 등)
- **데이터 스키마**: 단일 기사는 고유 식별자, 제목, 요약, 카테고리, 출처, 작성자, 발행일, 태그, 원본 링크 등의 풍부한 메타데이터 필드를 포함하여 필터링을 지원.

## 6. Open API (외부 연동)
`bit-feed`는 수집된 데이터를 서드파티 서비스가 활용할 수 있도록 Nuxt Nitro 기반의 REST API를 제공합니다. 보안을 위해 CORS 미들웨어를 통해 `localhost`, `revi1337.com`, `*.revi1337.com` 출처의 요청만 허용합니다.

- **`GET /api/feeds/latest`**: 최신(`latest.json`) 수집 기사 원본 배열 반환.
- **`GET /api/feeds`**: 아카이브(`all.json`) 전체 기사를 대상으로 한 검색 및 필터링 기능 지원.
  - 파라미터: `page`, `limit`, `category`, `source`, `q` (검색어)
- **`GET /api/feeds/sources`**: 데이터 내 고유 출처(sourceName) 목록 정렬 배열 반환.
- **`GET /api/feeds/categories`**: 데이터 내 고유 카테고리(category) 목록 정렬 배열 반환.

## 7. Data Pipeline Architecture (Scripts)
단일 구조였던 스크립트 파이프라인을 객체지향/모듈형 기반으로 완벽히 분리하여 확장성과 유지보수성을 극대화했습니다.

- **`scripts/config/feeds.mjs`**: 58개의 타겟 블로그 URL, 카테고리, 태그, 파서 타입 등을 한곳에서 관리하는 중앙화 설정 모듈.
- **`scripts/utils/scraper.mjs`**: `JSDOM`과 `Readability`를 활용하여 원본 HTML에서 불필요한 태그를 제거하고 순수 텍스트 본문만 추출. 원본 문맥을 유지하기 위해 링크(`<a>` 태그의 `href`)를 본문에 보존하는 `stripHtmlAndPreserveLinks` 로직을 포함.
- **`scripts/utils/ai.mjs`**: Gemini API를 연동한 핵심 요약 모듈. `startChat` 기반의 Function Calling 에이전트 활성화, 멀티 모델 분기 처리, Exponential Backoff 재시도 로직 등을 모두 담당.
- **`scripts/sync/fill-missing.mjs`**: 전체 아카이브(`all.json`)에서 요약이 누락되었거나 오류가 발생한 기사만 핀셋으로 찾아내어 재요약을 시도하는 독립적인 복구 파이프라인.
- **`scripts/fetch-rss.mjs`**: 위의 모든 모듈을 취합하여 전체 데이터를 긁어오고 AI에 요약을 지시한 뒤 저장하는 메인 Orchestrator 스크립트.
