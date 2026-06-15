# bit-feed Technical Specification

## 1. Overview
bit-feed는 IT 분야(프로그래밍 언어, 프론트엔드, 백엔드, 인공지능, 보안)의 최신 소식과 릴리스 정보를 한 곳에서 모아볼 수 있는 서버리스 기반의 웹 애플리케이션입니다. 

## 2. Core Features
- **자동화된 데이터 수집**: 58개의 타겟 출처 RSS 피드 및 SPA 사이트를 수집하여 정적 데이터(JSON)로 저장. 커스텀 크롤러(`scraper.mjs`) 지원.
- **아카이브 및 최신화 로직**: 데이터를 `latest.json`(최근 수집분)과 `all.json`(전체 누적 아카이브)으로 분리하되, 조기 종료(Early Return) 및 단일 진실 공급원 기반의 동시 저장 로직을 적용하여 데이터 무결성과 파이프라인 효율성을 극대화.
- **AI 핵심 요약**: Gemini 모델을 연동하여 장문의 기사 내용을 2~3줄의 정중한 평문으로 실시간 요약(`aiSummary` 필드).
- **다중 필터링 시스템**: 카테고리, 출처, 태그, 날짜 등 복합적인 조건을 조합하여 원하는 뉴스만 필터링 기능 제공.
- **모던 대시보드 UI**: 커스텀 SVG 로고와 "What's New" / "All Updates"가 구분된 직관적인 반응형 레이아웃 제공.

## 3. Technology Stack
- **프론트엔드 프레임워크**: Nuxt (Vue.js)
- **스타일링**: Tailwind CSS
- **데이터베이스/저장소**: 순수 JSON 데이터 파일 (`latest.json`, `all.json`)
- **AI 연동**: `@google/generative-ai` (Gemini API)
- **자동화 파이프라인**: GitHub Actions (스케줄링 기반 Node.js 스크립트 실행, Race condition 방지를 위한 Concurrency 제어 적용)
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
