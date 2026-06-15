# 프론트엔드 / 브라우저 용어 정리

> 이 세션에서 헤더 "bit-feed" 라벨 꿀렁거림(FOUC & Layout Shift)을 분석·수정하며 나온 용어들을 공부용으로 정리한 문서.

---

## 1. 새로고침 & 캐시

### 하드 새로고침 (Hard Refresh)
- 브라우저 캐시를 무시하고 모든 리소스(HTML/CSS/JS/폰트/이미지)를 서버에서 다시 받는 새로고침.
- 단축키: macOS `Cmd+Shift+R`, Windows `Ctrl+Shift+R` 또는 `Ctrl+F5`. (그냥 `F5`/`Cmd+R`은 "소프트 새로고침"으로 캐시를 일부 재사용함.)
- **왜 중요?** 폰트가 캐시돼 있으면 즉시 떠서 FOUC/시프트가 안 보인다. 하드 새로고침은 캐시 없는 "최악의 첫 방문" 상황을 재현하므로 폰트 로딩 버그가 가장 잘 드러난다.

### 콜드 캐시 (Cold Cache) vs 웜 캐시 (Warm Cache)
- **콜드 캐시**: 캐시가 비어 있는 상태. 첫 방문이나 하드 새로고침 직후. 모든 리소스를 네트워크로 받아야 함.
- **웜 캐시**: 이전 방문에서 받은 리소스가 캐시에 남아 있는 상태. 폰트 등이 즉시 로드됨.
- 이번 디버깅에서 CDP의 `Network.setCacheDisabled`로 콜드 캐시(=하드 새로고침)를 모의했다.

---

## 2. 렌더링 동작 & 성능 지표

### FOUC (Flash of Unstyled Content)
- "스타일이 적용되기 전의 콘텐츠가 잠깐 번쩍 보이는 현상." (사용자가 적은 "FCOU"는 이 오타.)
- 원인 예: CSS/폰트가 늦게 도착해서 브라우저가 일단 기본 스타일/시스템 폰트로 그렸다가 나중에 교체.
- 이번 사례: Google Fonts가 `@import`로 늦게 도착 → 시스템 폰트로 먼저 그려졌다가 Inter로 교체되며 라벨이 번쩍.

### FOIT / FOUT (폰트 관련 FOUC의 세부 유형)
- **FOIT (Flash of Invisible Text)**: 폰트 로드될 때까지 텍스트를 *안 보이게* 했다가, 폰트 도착 후 표시. (`font-display: block`의 동작)
- **FOUT (Flash of Unstyled Text)**: 폴백(시스템) 폰트로 *먼저 보여주고* 웹폰트 도착 시 교체. 이때 글자 폭/굵기가 바뀌며 시프트 발생. (`font-display: swap`의 동작)

### Layout Shift / CLS (Cumulative Layout Shift)
- 이미 그려진 요소의 위치/크기가 갑자기 바뀌어 레이아웃이 "튀는" 현상. ("꿀렁거림")
- **CLS**는 Core Web Vitals 지표 중 하나로, 페이지 로드 중 발생한 시프트의 누적 점수(낮을수록 좋음, 0.1 이하 권장).
- 이번 사례: 폰트 swap 시 "bit-feed" 폭이 60.72px → 66.92px로 변하며 라벨과 주변이 밀림.

### 폰트 swap (Font Swap)
- 폴백 폰트로 그려진 텍스트가 웹폰트 로드 완료 시점에 웹폰트로 교체되는 동작.
- 서로 다른 서체는 글자 폭·굵기가 근본적으로 다르므로, swap 순간 레이아웃 시프트가 생긴다. 특히 "bit-feed" 같은 짧고 굵은 문구에서 도드라진다.

### 첫 페인트 (First Paint) / FCP (First Contentful Paint)
- **First Paint**: 브라우저가 화면에 뭔가를 처음 그리는 시점.
- **FCP**: 텍스트/이미지 등 실제 콘텐츠가 처음 그려지는 시점 (성능 지표).
- "폰트를 첫 페인트 *전에* 확보하면 swap 자체가 없다"는 게 이번 해결의 핵심 아이디어.

### 렌더 블로킹 (Render-Blocking)
- 브라우저가 페이지를 그리기 전에 반드시 받아서 처리해야 하는 리소스 (대표적으로 CSS).
- CSS의 `@import`는 직렬 로딩(CSS 다운로드 → 파싱 → @import 발견 → 또 다운로드)이라 렌더를 더 오래 막는다. 그래서 `<link>`로 head에 직접 두는 게 빠르다.

---

## 3. 폰트 로딩

### @font-face
- CSS에서 커스텀 폰트를 정의하는 규칙. `font-family` 이름, `src`(폰트 파일 경로), `font-weight`, `font-display`, `unicode-range` 등을 지정.

### font-display (핵심 속성)
폰트가 로드되는 동안/후에 텍스트를 어떻게 그릴지 결정. 두 구간으로 동작: **block 구간**(폰트 기다리며 텍스트 숨김) → **swap 구간**(폴백으로 보여주다 교체).

| 값 | block 구간 | swap 구간 | 동작 요약 |
|---|---|---|---|
| `auto` | 브라우저 기본 | - | 보통 block과 유사 |
| `block` | ~3s (길게 숨김) | 무한 | 폰트 올 때까지 **숨겼다가** 폰트로 그림 (FOIT). 결정적 |
| `swap` | 0 (즉시) | 무한 | 폴백 즉시 표시 → 폰트 도착 시 **교체** (FOUT, 시프트 위험) |
| `fallback` | ~100ms | ~3s | 짧게 숨김 → 폴백 → 늦으면 폴백 고정 |
| `optional` | ~100ms | **0** | 짧게 기다려 되면 폰트, 안 되면 **폴백 고정(교체 없음)** |

- 이번 사례 흐름:
  - 처음 문제: `swap` → 폴백→Inter 교체로 시프트.
  - 1차 수정: `optional` → 페이지 내 시프트는 제거. 하지만 100ms 경쟁 결과가 로드마다 갈려 "가끔 bold됐다 풀림".
  - 최종: `block` → 폰트 준비될 때까지 잠깐 숨겼다 **항상 Inter로** 그림 → 결정적. (preload 덕에 숨김 시간은 거의 인지 불가.)

### self-host (셀프 호스팅)
- 외부 CDN(Google Fonts 등)이 아니라 폰트 파일을 내 서버/도메인에서 직접 서빙하는 것.
- 장점: 외부 도메인 연결(DNS/TLS) 비용 제거, 직렬 로딩 체인 제거, preload로 첫 페인트 전 확보 가능.
- 이번에 `public/fonts/`에 woff2를 두고 same-origin으로 서빙.

### woff2 (Web Open Font Format 2)
- 웹 폰트의 표준 압축 포맷. 가장 압축률이 좋아 현재 사실상 기본 선택.

### 가변 폰트 (Variable Font)
- 하나의 파일에 여러 굵기/스타일(예: weight 100~900)을 연속적으로 담은 폰트.
- `@font-face`에서 `font-weight: 100 900`처럼 범위로 선언. 파일 하나로 모든 굵기를 커버 → 요청 수 절감.
- 이번에 받은 Inter latin 가변 woff2가 48KB로 충분히 작았다.

### 서브셋 (Subset) / unicode-range
- 폰트에서 **필요한 글자 영역만** 잘라낸 것 (예: latin만). 파일 크기를 크게 줄인다.
- `unicode-range`: 해당 `@font-face`가 담당할 유니코드 범위를 지정. 범위 밖 글자는 폰트 스택의 다음 폰트로 폴백.
- 이번 사이트는 본문이 한글이라 Inter(한글 글리프 없음)는 **latin 범위만** self-host하고, 한글은 시스템 폰트로 자연스럽게 폴백시켰다.

### 메트릭 오버라이드 (Metric Override) / 폴백 폰트 메트릭
- 폴백 폰트의 크기/높이를 웹폰트에 맞춰 보정해 swap 시 시프트를 줄이는 기법.
- 관련 `@font-face` 디스크립터:
  - `size-adjust`: 글리프 전체 크기 배율 조정.
  - `ascent-override` / `descent-override` / `line-gap-override`: 위/아래 여백·줄간격 보정.
- 한계: 줄높이/평균폭은 맞춰도 **서로 다른 서체의 개별 글자 폭은 못 맞춘다.** 그래서 짧고 굵은 "bit-feed" 라벨의 폭 시프트는 이 기법만으로 못 잡았고, swap 자체를 없애야 했다.

### faux bold (가짜/합성 볼드)
- 굵은(예: 700) 글리프가 폰트에 없을 때, 브라우저가 기존 글리프를 인위적으로 두껍게 그려 만든 "가짜 볼드".
- 진짜 볼드 글리프와 모양·굵기가 다르다. 이번에 폴백(Arial 400만 정의)이 700 요청을 faux-bold로 처리해, 진짜 Inter 700과 굵기 차이가 났다.

### 폰트 스택 (Font Stack)
- `font-family: 'Inter', 'Inter Fallback', sans-serif`처럼 우선순위대로 나열한 폰트 목록. 앞에서부터 사용 가능한/글리프가 있는 폰트를 선택.

---

## 4. 리소스 힌트 (Resource Hints)

`<link rel="...">`로 브라우저에 "이 리소스 곧 필요해, 미리 준비해"라고 알려주는 최적화 기법.

### preconnect
- 특정 도메인에 미리 연결(DNS 조회 + TCP + TLS 핸드셰이크)을 끝내 두는 힌트.
- `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`
- 외부 폰트를 쓸 때 연결 지연을 줄여 swap 시점을 앞당긴다. (self-host로 전환하면 외부 연결이 없어 불필요해짐.)

### preload
- 곧 쓸 리소스를 **높은 우선순위로 지금 즉시** 받게 하는 힌트. HTML 파싱 초기에 다운로드 시작.
- `<link rel="preload" as="font" type="font/woff2" href="/fonts/inter.woff2" crossorigin>`
- 폰트를 첫 페인트 전에 확보해 swap/숨김 시간을 없애는 핵심. (이번 최종 해결의 한 축.)
- **`crossorigin` 필수**: 폰트는 CORS 모드로 요청되므로, preload에 `crossorigin`이 없으면 실제 요청과 매칭되지 않아 **두 번 받는다.**

### prefetch (참고)
- preload와 달리 "지금 페이지가 아니라 *다음에* 쓸 수도 있는" 리소스를 낮은 우선순위로 미리 받음. (이번 세션엔 안 썼지만 비교용.)

---

## 5. 측정 & 디버깅 도구

### CDP (Chrome DevTools Protocol)
- Chrome/Chromium을 프로그램으로 원격 제어·계측하는 프로토콜. DevTools가 내부적으로 쓰는 그 API.
- 이번에 사용한 도메인/메서드:
  - `Network.enable`, `Network.setCacheDisabled` → 콜드 캐시 모의.
  - `Network.emulateNetworkConditions` → 네트워크 속도/지연 제한(스로틀링).

### 네트워크 스로틀링 (Network Throttling)
- 다운로드/업로드 속도와 지연(latency)을 인위적으로 낮춰 느린 네트워크(예: Slow 3G)를 흉내 내는 것.
- 폰트 로딩 타이밍 버그는 빠른 로컬에선 안 보이므로, 스로틀로 "느린 환경"을 만들어 재현·검증했다.

### 헤드리스 브라우저 (Headless Browser) / Puppeteer
- **헤드리스**: 화면(GUI) 없이 백그라운드로 실행되는 브라우저. 자동화·측정에 사용.
- **Puppeteer / puppeteer-core**: Node.js에서 Chrome을 CDP로 제어하는 라이브러리. (`-core`는 브라우저를 자동 다운로드하지 않고 시스템에 설치된 Chrome을 씀.)

### Font Loading API (`document.fonts`)
- JS로 폰트 로드 상태를 다루는 표준 API.
- `document.fonts.ready`: 모든 폰트 로딩이 끝나면 resolve되는 Promise. (로드 완료 시점 측정에 사용.)
- `[...document.fonts]`로 각 FontFace의 `family`/`status('loaded')` 확인 가능.

### getBoundingClientRect()
- 요소의 화면상 위치/크기(`width`, `height`, `top` 등)를 픽셀로 반환하는 DOM 메서드.
- 이번에 "bit-feed" 라벨의 `width`를 폰트 로드 전/후로 측정해 시프트(60.72→66.92px)를 정량 확인했다.

### requestAnimationFrame (rAF)
- 다음 화면 리페인트 직전에 콜백을 실행하도록 예약하는 API (보통 초당 60회).
- 이번에 매 프레임마다 라벨 폭을 샘플링해, 첫 페인트부터 폰트 적용까지의 변화를 연속 관찰했다.

---

## 6. 기타 (이 세션에서 스친 개념)

### HMR (Hot Module Replacement)
- 개발 서버(Vite/Nuxt)에서 코드를 저장하면 새로고침 없이 변경분만 즉시 반영하는 기능. CSS 수정이 바로 적용돼 빠르게 검증할 수 있었다.

### SSR & Hydration (Nuxt)
- **SSR(Server-Side Rendering)**: 서버에서 HTML을 미리 그려 보내는 방식.
- **Hydration**: 서버가 보낸 정적 HTML에 클라이언트 JS가 이벤트/상태를 "붙여" 인터랙티브하게 만드는 과정.
- NavBar에서 다크모드 아이콘을 `<ClientOnly>`로 감싼 건, 서버/클라이언트 렌더 불일치(hydration mismatch)와 깜빡임을 피하기 위함.

### same-origin / crossorigin
- **same-origin**: 같은 프로토콜+도메인+포트. self-host한 `/fonts/...`는 same-origin이라 외부 연결 비용이 없다.
- 폰트는 CORS 규칙상 `crossorigin` 속성이 필요(위 preload 항목 참고).

---

## 한 줄 요약 (이번 버그의 전체 그림)
`@import`로 늦게 오는 폰트 → 시스템 폰트로 먼저 그림(FOUC) → 폰트 도착 시 교체(swap)로 폭/굵기 변화(Layout Shift). 해결: 폰트를 **self-host + preload**로 첫 페인트 전에 확보하고, `font-display: block`으로 **항상 같은 폰트(Inter)로 결정적 렌더** → 꿀렁거림 제거.
