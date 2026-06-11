# Bit-Feed 리팩토링 계획 (Modern Web & Karpathy Guidelines)

이 문서는 Google Modern Web Guidance와 Karpathy 가이드라인을 기반으로 bit-feed 프로젝트의 성능 및 UX를 극대화하기 위한 단계별 리팩토링 진행 사항을 추적합니다.

## Phase 1: Native HTML5 및 UI 구조 단순화 (Karpathy & HTML Guide)
- [ ] **Task 1.1**: `Modal.vue`의 커스텀 백드롭과 텔레포트를 제거하고 웹 표준 `<dialog closedby="any">` 요소로 전환 (JS 개입 최소화 및 Light-dismiss 지원).
- [ ] **Task 1.2**: `Modal.vue` 등장/퇴장 시 `@starting-style`과 `transition-behavior: allow-discrete`를 적용해 순수 CSS 네이티브 애니메이션 구현.
- [ ] **Task 1.3**: `NavBar.vue`와 `NewsFeed.vue`(모바일 필터)에 Glassmorphism(`backdrop-blur-md` 등) 효과를 적용.
- [ ] **Task 1.4**: `NavBar.vue`의 복잡한 활성화/호버 스크립트 로직을 CSS `:has()` 선택자를 활용해 단순화.

## Phase 2: 렌더링 성능 최적화 (Core Web Vitals)
- [ ] **Task 2.1**: `NewsFeed.vue`에서 렌더링 루프 시 `NewsCard.vue`로 배열의 `index` 속성 전달.
- [ ] **Task 2.2**: `NewsCard.vue` 내부에 인덱스 판별 로직을 추가하여, 첫 화면 밖(`index >= 6`)의 요소에만 `content-visibility: auto` 속성을 부여.
- [ ] **Task 2.3**: 레이아웃 점프 방지를 위해 `NewsCard` CSS에 `contain-intrinsic-size: auto none auto 150px` 추가.
- [ ] **Task 2.4**: `NewsCard.vue`의 최상단 컨테이너를 시맨틱 웹 표준에 맞게 `<div>`에서 `<article>`로 변경.

## Phase 3: 애니메이션 및 데이터 페칭 (View Transitions & SSR)
- [ ] **Task 3.1**: `nuxt.config.ts` 파일에서 `experimental.viewTransition: true` 활성화.
- [ ] **Task 3.2**: `tailwind.css` 전역 스타일 영역에 `@media (prefers-reduced-motion: reduce)`를 추가하여 어지럼증을 느끼는 사용자의 접근성(A11y) 보장용 폴백 구현.
- [ ] **Task 3.3**: `NewsFeed.vue`의 데이터 로딩 로직(`useFetch`) 옵션을 `server: true`로 변경하여 브라우저 초기 로딩(FCP/LCP) 속도 개선.

## Phase 4: 최종 검증 (Verification)
- [ ] **Task 4.1**: `<dialog>` 기반 모달이 배경 클릭(Light dismiss)과 ESC 키로 정상적으로 닫히는지 확인.
- [ ] **Task 4.2**: '오늘의 소식'과 '모든 소식' 메뉴 이동 시 화면이 자연스럽게 크로스페이드(View Transition)되는지 확인.
- [ ] **Task 4.3**: Chrome 개발자 도구 렌더링 탭에서 스크롤 아래쪽 카드의 렌더링이 `content-visibility`에 의해 정상적으로 지연되는지 확인.
