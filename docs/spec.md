# bit-feed Technical Specification

## 1. Overview
bit-feed는 IT 분야(프로그래밍 언어, 프론트엔드, 백엔드, 인공지능, 보안)의 최신 소식과 릴리스 정보를 한 곳에서 모아볼 수 있는 서버리스 기반의 웹 애플리케이션입니다. 

## 2. Core Features
- **자동화된 데이터 수집**: 주기적으로 타겟 출처의 RSS 피드를 수집하여 정적 데이터(JSON)로 저장.
- **다중 필터링 시스템**: 카테고리, 출처, 태그, 날짜 등 복합적인 조건을 조합하여 원하는 뉴스만 필터링 기능 제공.
- **모던 대시보드 UI**: 사용자가 직관적이고 편안하게 기사를 탐색할 수 있는 반응형 레이아웃 제공.

## 3. Technology Stack
- **프론트엔드 프레임워크**: Nuxt (Vue.js)
- **스타일링**: Tailwind CSS
- **데이터베이스/저장소**: 순수 JSON 데이터 파일
- **자동화 파이프라인**: GitHub Actions (스케줄링 기반 Node.js 스크립트 실행)
- **배포 환경**: Vercel 또는 GitHub Pages 기반 정적 호스팅

## 4. Design Guidelines (Vercel Style)
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
