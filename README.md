# bit-feed

bit-feed는 IT 분야(프로그래밍 언어, 프론트엔드, 백엔드, 인공지능, 보안)의 최신 소식과 릴리스 정보를 한 곳에서 모아볼 수 있는 서버리스 기반의 웹 애플리케이션입니다.

## 핵심 기능

- 자동화된 데이터 수집: 별도의 백엔드 서버 없이 주기적으로 공식 블로그 및 문서의 RSS 피드를 수집하여 정적 JSON 데이터로 저장합니다.
- 아카이브 및 최신화 로직: 데이터를 latest.json(최근 50개 롤링 윈도우)과 all.json(전체 아카이브)으로 분리하여 프론트엔드 렌더링 성능과 데이터 파이프라인 효율을 극대화합니다.
- AI 에이전트 핵심 요약 (Function Calling): Gemini API를 연동하여 장문의 기사 내용을 짧고 정중한 한국어 문장으로 실시간 요약합니다. 본문이 짧을 경우 자율적으로 원본 링크를 직접 크롤링하며, 503 등 서버 에러 시 Jitter가 포함된 Exponential Backoff(지수 백오프) 재시도 로직으로 중단 없는 요약을 보장합니다.
- 다중 필터링 시스템: 카테고리, 출처, 태그, 날짜 등 복합적인 조건을 조합하여 원하는 뉴스만 정확하게 필터링할 수 있습니다.
- 모던 대시보드 UI: Vercel의 디자인 가이드라인을 엄격히 준수하며, 다크모드를 기본으로 설정하고 "What's New"와 "All Updates"가 구분된 직관적인 반응형 레이아웃을 제공합니다.

## 기술 스택

- 프론트엔드: Nuxt 3 (Vue.js)
- 스타일링: Tailwind CSS (Vercel Style Design System)
- 데이터 저장소: 정적 JSON 파일 (all.json, latest.json)
- AI 연동: @google/generative-ai (Gemini API)
- 자동화 파이프라인: GitHub Actions (스케줄링 기반 Node.js 스크립트 실행)
- 배포 환경: Vercel / GitHub Pages

## 데이터 파이프라인 아키텍처 (Modular Scripts)

프로젝트 스크립트는 재사용성 및 유지보수성을 극대화하기 위해 모듈형으로 구성되어 있습니다. 
다음은 GitHub Actions에 의해 실행되는 자동화된 JSON 데이터 수집 및 병합 워크플로우입니다.

```text
[GitHub Action Cron / Dispatch]
           |
           v
+--------------------------------------+
|        scripts/fetch-rss.mjs         | (메인 Orchestrator)
+--------------------------------------+
           |  -- 사용 모듈 --
           |  1) scripts/config/feeds.mjs: 58개 피드 설정 로드
           |  2) scripts/utils/scraper.mjs: JSDOM 파싱 및 링크 추출
           |  3) scripts/utils/ai.mjs: 에이전트 요약 및 백오프 재시도
           v
+--------------------------------------+
|        public/data/all.json          | (기존 아카이브)
+--------------------------------------+
           |
           | 1. 데이터 수집 및 JSDOM 기반 정제
           | 2. Gemini API 자율 에이전트 요약 (필요시 링크 직접 크롤링)
           v
[        새로운 데이터 병합 및 정렬        ]
           |
           | 3. 기존 아카이브 덮어쓰기
           v
+--------------------------------------+
|        public/data/all.json          | (업데이트된 전체 아카이브)
+--------------------------------------+
           |
           | 4. 최신 50개 슬라이싱 (Rolling Window)
           v
+--------------------------------------+
|       public/data/latest.json        | (최신 업데이트 내역)
+--------------------------------------+
           |
           | 5. Git Add, Commit & Push
           v
[         GitHub Repository            ]
```

*※ 예외 상황 시 누락된 요약본만 핀셋으로 복구하는 `scripts/sync/fill-missing.mjs` 독립 스크립트를 지원합니다.*

## 설치 및 로컬 실행 방법

1. 저장소 클론
```bash
git clone https://github.com/Revi1337/bit-feed.git
cd bit-feed
```

2. 의존성 패키지 설치
```bash
npm install
```

3. 환경 변수 설정
프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 Gemini API 키를 입력합니다.
```
GEMINI_API_KEY=당신의_API_키를_입력하세요
```

4. 개발 서버 실행
```bash
npm run dev
```

5. 수동 데이터 수집 (선택 사항)
```bash
npm run fetch-rss
```

## 디자인 가이드라인

이 프로젝트는 Vercel의 디자인 언어를 엄격하게 따릅니다.
- 테마: 완전한 색상 반전을 지원하는 다크모드를 기본값(Default)으로 사용합니다.
- 타이포그래피: 메인 텍스트는 Inter/Geist 산세리프 폰트를, 기술적인 메타데이터는 모노스페이스를 사용합니다.
- 컬러 팔레트: Ink(블랙), White, 그리고 옅은 Canvas 그레이를 활용하여 명도 대비를 극대화합니다.
- 입체감: 단순한 섀도우 대신 얇은 테두리(Inset hairline)와 다단계 그림자(Stacked shadows)로 깊이감을 표현합니다.
- 형태: 주요 CTA 버튼은 둥근 형태(Pill)를 사용하며, 일반적인 UI 요소는 미세한 곡률이 있는 사각형을 채택합니다.

## 개발 문서

시스템 설계, 기획 요구사항 및 멀티 에이전트 아키텍처에 대한 상세한 내용은 docs/ 디렉토리의 문서들을 참고해 주세요.
- docs/prd.md: 제품 요구사항 정의서 (Product Requirements Document)
- docs/spec.md: 기술 명세서 (Technical Specifications)
- docs/DESIGN.md: 디자인 가이드라인 (Vercel Design System)
