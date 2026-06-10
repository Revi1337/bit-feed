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
- [x] 대상 블로그 목록 세팅 (반드시 각 기술/프레임워크/언어의 **"공식 블로그 및 공식 문서"**만을 출처로 엄격하게 한정; 프로그래밍 언어, 프론트엔드, 백엔드, 인공지능, 보안 5개 카테고리 구성)
- [x] 대상 블로그 피드 URL에서 데이터를 추출 및 정제하는 로직 구현
- [x] 여러 다중 필터(카테고리, 출처, 날짜, 태그 등) 적용을 위해 `news.json` 데이터 구조를 세분화하여 가공 (예: `id`, `title`, `summary`, `url`, `category`, `source`, `author`, `pubDate`, `tags` 등 다양한 필드 포함)
- [x] 파싱 및 정제된 데이터를 `public/data/news.json` 파일로 덮어쓰기 저장하는 로직 구현
- [x] Phase 3 작업 내역 Git Commit (`git commit -m "feat: finish phase 3 - data pipeline"`)

## Phase 4: Frontend Data Integration & State (데이터 연동 및 필터링)
미리 수집된 정적 데이터(JSON)를 프론트엔드 화면에 동적으로 연결합니다.

- [ ] Nuxt `useFetch` 또는 정적 임포트를 이용해 `news.json` 데이터를 로드
- [ ] 전역 상태(또는 컴포넌트 상태)로 카테고리, 출처, 태그 등 다양한 필터 상태 관리 (다중 필터 지원)
- [ ] 데이터의 여러 field(`category`, `source`, `pubDate`, `tags` 등)를 조합하여 필터링하는 복합 필터 로직 구현
- [ ] 다중 필터 상태에 따라 사이드바 UI 동기화 (체크박스/토글 상태 등 표기)
- [ ] 필터 조건에 따라 필터링된 뉴스 리스트 렌더링 로직 연동
- [ ] 각 뉴스 카드에 실제 기사 정보(제목, 요약, 발행일, 출처, 태그, 링크 등) 매핑
- [ ] Phase 4 작업 내역 Git Commit (`git commit -m "feat: finish phase 4 - data integration"`)

## Phase 5: Automation & Deployment (자동화 및 배포)
정기적인 콘텐츠 업데이트와 자동 배포 파이프라인을 구축합니다.

- [ ] `.github/workflows/update-news.yml` 파일 생성
- [ ] Cron Job을 설정하여 주기적(예: 6시간/12시간 간격)으로 `npm run fetch-rss` 실행 설정
- [ ] GitHub Actions 내에서 업데이트된 `news.json`을 Git Commit & Push 하는 파이프라인 완성
- [ ] 최종 웹 어플리케이션 배포 환경 설정 (Vercel 또는 GitHub Pages 연동)
- [ ] 모바일/웹 환경 통합 테스트 및 최종 검수
- [ ] Phase 5 작업 내역 Git Commit (`git commit -m "feat: finish phase 5 - automation and deployment"`)
