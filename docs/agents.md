# Multi-Agent Architecture for bit-feed

이 문서는 `bit-feed` 프로젝트를 성공적으로 구현하기 위해 메인 에이전트(Orchestrator)와 4개의 서브 에이전트가 어떻게 협력하고 역할을 분담하는지 정의합니다. `prd.md`의 Phase 단위 작업들이 각 에이전트에게 위임됩니다.

## 0. Main Agent (Orchestrator)
- **역할**: 프로젝트의 전체 흐름을 제어하고, 각 서브 에이전트에게 적절한 시점에 작업을 지시(Prompting)하며, 작업 결과를 취합하여 다음 단계로 넘어갈지 판단합니다.
- **담당 업무**:
  - `prd.md`의 진행 상황(체크박스) 관리 및 업데이트.
  - 서브 에이전트 간의 결과물 충돌 조정 (예: UI 에이전트가 만든 컴포넌트와 데이터 에이전트가 만든 JSON 스키마의 불일치 해소).
  - 프로젝트 기초 세팅 (Phase 1의 Nuxt 초기화 및 Tailwind 환경 구성 등 뼈대 작업 직접 수행 또는 지시).

---

## 1. Sub-Agent 1: UI/UX Component Expert (프론트엔드/퍼블리싱 전담)
- **역할**: `docs/DESIGN.md` (Vercel 스타일) 명세서에 맞춰 완벽한 픽셀 단위의 UI 컴포넌트와 인터랙션을 구현합니다.
- **매핑된 PRD Task**:
  - **Phase 2 전반**: 헤더, 사이드바, 필터 UI, 뉴스 리스트, 카드 컴포넌트 퍼블리싱.
  - Vercel 특유의 다단계 그림자(Stacked Shadow) 및 글래스모피즘, 모노스페이스 폰트 적용.
- **핵심 목표**: 사용자가 프리미엄 디자인이라고 느낄 수 있도록 반응형 웹과 미세한 애니메이션 구현.

---

## 2. Sub-Agent 2: Data Pipeline & Deployment Expert (데이터 수집 및 연동 전담)
- **역할**: 백엔드 없이 작동하는 서버리스 데이터 수집 파이프라인을 구축하고, 완성된 앱을 배포합니다.
- **매핑된 PRD Task**:
  - **Phase 3 전반**: 5가지 카테고리의 "공식 문서/블로그" RSS 피드를 파싱하는 Node.js 스크립트(`fetch-rss.js`) 작성.
  - JSON 스키마(`id`, `title`, `category`, `pubDate` 등) 구조화.
  - **Phase 4 전반**: Nuxt의 `useFetch` 등을 이용한 프론트엔드 상태 관리 및 필터링 로직(로직 연동) 구현.
  - **Phase 5 전반**: GitHub Actions 워크플로우 구성 및 Vercel/GitHub Pages 배포 자동화.

---

## 3. Sub-Agent 3: QA & Exception Handling Expert (QA 및 예외 처리 전담)
- **역할**: 시스템이 중단되거나 오류 페이지가 노출되지 않도록, 모든 에지 케이스(Edge case)와 장애 상황에 대한 방어 로직을 작성합니다.
- **담당 업무**:
  - 데이터 파이프라인에서 RSS 피드 URL 접속 실패 시 재시도(Retry) 로직 및 Fallback 데이터 처리.
  - JSON 파싱 중 구조가 깨진 데이터가 들어왔을 때의 예외 처리(Try-Catch).
  - 프론트엔드 로딩 상태(Skeleton UI 적용 확인), 필터링 결과가 없을 때의 Empty State UI 노출 확인.
  - 크로스 브라우징 및 모바일 환경에서의 레이아웃 깨짐 테스트 계획 수립.

---

## 4. Sub-Agent 4: Code Review Expert (코드 리뷰 전담)
- **역할**: 다른 에이전트들이 작성한 코드가 `spec.md` 및 `prd.md`의 표준을 따르는지 검수하고 최적화(Refactoring)를 제안합니다.
- **담당 업무**:
  - 컴포넌트의 재사용성이 떨어지는 경우 리팩토링 제안.
  - Tailwind 클래스가 무분별하게 길어지거나 가독성이 떨어지는 부분 지적 및 수정.
  - 불필요한 의존성(패키지) 추가 방지 및 코드 내 하드코딩된 값 상수화 검증.
  - QA 에이전트가 발견한 버그의 근본적인 원인을 분석하여 수정안 제시.

---

## Workflow Example (협업 시나리오)
1. **Orchestrator**가 **데이터 파이프라인 에이전트**에게 Phase 3 스크립트 작성을 지시합니다.
2. 스크립트가 작성되면 **QA 에이전트**가 투입되어 타겟 블로그의 서버가 다운되었을 때의 예외 처리를 보강합니다.
3. 동시에 **UI/UX 에이전트**가 Phase 2의 뉴스 카드 컴포넌트를 만들면, **코드 리뷰 에이전트**가 디자인 가이드를 잘 지켰는지 검토합니다.
4. 모든 코드가 리뷰를 통과하면 **Orchestrator**가 `prd.md`의 해당 Task 체크박스를 체크(`[ ]` -> `[x]`)하고, **해당 Phase의 작업 내역을 Git Commit 처리**한 뒤 진행률을 업데이트하여 다음 Phase로 진행합니다.
