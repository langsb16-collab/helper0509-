# 🚨 즉시 복구 가이드 — CareTalk (helper0509)

> **백업 생성일**: 2026-05-09  
> **최신 커밋**: `3a922d4` — feat: Hero 상단 파트너 링크 버튼 8개 추가 (Aurora Border Flow 애니메이션)  
> **Cloudflare 프로젝트**: `helper0509`  
> **GitHub**: `https://github.com/langsb16-collab/helper0509-`  
> **운영 도메인**: `https://jt365.me`  
> **최신 배포 URL**: `https://74315bf3.helper0509.pages.dev`

---

## 📦 백업 포함 내용

| 항목 | 내용 |
|------|------|
| 소스코드 | `src/index.tsx` (1235 lines, 73KB) — HTML 전체 인라인 임베드 |
| UI/HTML | `public/index.html` (1151 lines) |
| CSS | `public/static/style.css` (1969 lines) |
| Frontend JS | `public/static/app.js` (874 lines) |
| i18n 언어팩 | `public/static/locales/` + `src/i18n/locales/` — 19개 언어 |
| 빌드 결과물 | `dist/_worker.js` (105.21 kB), `dist/index.html`, `dist/static/` |
| 설정 파일 | `wrangler.jsonc`, `vite.config.ts`, `tsconfig.json`, `package.json` |
| PM2 설정 | `ecosystem.config.cjs` |
| Git 이력 | `.git/` 디렉토리 전체 포함 |
| D1 DB | **현재 미사용** (wrangler.jsonc에 주석 처리됨) |

---

## 🔧 완전 복구 절차

### STEP 1 — 아카이브 압축 해제

```bash
# 홈 디렉토리에 압축 해제
tar -xzf 즉시복구용_caretalk_20260509.tar.gz -C /home/user/
# → /home/user/webapp/ 으로 복원됨
```

### STEP 2 — Node.js 의존성 설치

```bash
cd /home/user/webapp
npm install
# 완료까지 1~3분 소요 (timeout 300s 권장)
```

> **주요 의존성**:
> - `hono` ^4.12.12
> - `wrangler` ^4.4.0  
> - `vite` ^6.3.5
> - `@hono/vite-build` ^1.2.0

### STEP 3 — 빌드

```bash
cd /home/user/webapp
npm run build
# dist/_worker.js 105KB 생성 확인
```

### STEP 4 — PM2로 샌드박스 서비스 기동

```bash
# 포트 정리 후 PM2 기동
fuser -k 3000/tcp 2>/dev/null || true
cd /home/user/webapp
pm2 start ecosystem.config.cjs

# 서비스 확인 (5초 대기)
sleep 5 && curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
# → 200 출력되어야 정상
curl -s http://localhost:3000/health
# → {"status":"ok","service":"CareTalk","version":"1.0.0"}
```

### STEP 5 — Cloudflare 재배포

```bash
cd /home/user/webapp

# 환경변수에 API 토큰 설정 (또는 setup_cloudflare_api_key 도구 사용)
export CLOUDFLARE_API_TOKEN=<여기에_Cloudflare_API_토큰_입력>
# 토큰은 Cloudflare Dashboard > My Profile > API Tokens 에서 확인
# 또는 에이전트의 Deploy 탭 > setup_cloudflare_api_key 도구 사용

# 배포
npx wrangler pages deploy dist \
  --project-name helper0509 \
  --commit-dirty=true

# 배포 완료 후 URL 확인
# → https://XXXXXXXX.helper0509.pages.dev
```

### STEP 6 — GitHub 재연결 (필요 시)

```bash
cd /home/user/webapp

# GitHub 환경 설정 (setup_github_environment 도구 사용 권장)
git remote -v
# origin  https://github.com/langsb16-collab/helper0509-.git

# 이미 remote가 있으면 바로 push
git push origin main

# remote가 없으면 재등록
git remote add origin https://github.com/langsb16-collab/helper0509-.git
git push -u origin main
```

---

## 🗂️ 프로젝트 핵심 구조

```
webapp/
├── src/
│   ├── index.tsx          ← 메인 Hono 앱 (HTML 전체 인라인 임베드)
│   ├── renderer.tsx       ← JSX 렌더러
│   └── i18n/locales/      ← 서버사이드 i18n (19개 언어)
│       ├── ko.json, en.json, ja.json, zh.json, ...
├── public/
│   ├── index.html         ← 원본 HTML (Python 재생성 소스)
│   └── static/
│       ├── style.css      ← 전체 CSS (CSS Variables 테마/반응형)
│       ├── app.js         ← 프론트엔드 JS (i18n, 테마, FAQ 등)
│       └── locales/       ← 클라이언트 i18n (19개 언어)
├── dist/                  ← 빌드 결과물 (배포용)
│   ├── _worker.js         ← 컴파일된 Hono Worker (105KB)
│   ├── _routes.json
│   ├── index.html
│   └── static/
├── ecosystem.config.cjs   ← PM2 설정 (앱명: caretalk, port: 3000)
├── wrangler.jsonc         ← Cloudflare 설정
├── vite.config.ts         ← Vite 빌드 설정
├── tsconfig.json          ← TypeScript 설정
└── package.json
```

---

## ⚙️ 핵심 설정값

### wrangler.jsonc
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "webapp",
  "compatibility_date": "2026-04-13",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"]
}
```

### ecosystem.config.cjs (PM2)
```js
module.exports = {
  apps: [{
    name: 'caretalk',
    script: 'npx',
    args: 'wrangler pages dev dist --ip 0.0.0.0 --port 3000',
    env: { NODE_ENV: 'development', PORT: 3000 },
    watch: false,
    instances: 1,
    exec_mode: 'fork'
  }]
}
```

---

## 🎨 구현된 UI 기능 목록

### 세션 1 — CareTalk 플랫폼 기본 구축
- [x] Hono + Cloudflare Pages 기본 구조
- [x] HTML 인라인 임베드 방식 (serveStatic 오류 우회)
- [x] CSS Variables Day/Night 테마
- [x] 네비게이션, Hero, Quick Menu, 공지사항, FAQ, 채팅 위젯
- [x] 19개 언어 i18n (ko/en/ja/zh/vi/th/mn/uz/ru/ar/hi/id/fr/de/es/tr/pl/pt-BR/af)
- [x] Pretendard + Inter 폰트 (CDN)

### 세션 2 — Quick Menu UI 수정
- [x] Quick Menu 섹션 배경 `var(--section-bg)` (#F1F5F9)
- [x] 외부 그리드 340px → 380px
- [x] `quick-menu-grid` 클래스 + 반응형 CSS
- [x] `quick-notice-outer` 클래스 + 모바일 단일컬럼
- [x] 미디어쿼리 세분화 (1024~1279 / 1280~1599 / 1600+)

### 세션 3 — Typography +30% 확대
- [x] `html { font-size: 18px; }` (모바일 19px)
- [x] Hero 타이틀: `clamp(3.2rem, 5vw, 5.8rem)` / weight 800
- [x] Hero 설명: `1.45rem` / 버튼 `btn-lg` min-height 58px
- [x] 빠른메뉴 카드: 아이콘 68px, min-height 160px
- [x] FAQ/채팅 트리거: 72px
- [x] 전체 섹션 헤더, 공지, 통계 수치 확대

### 세션 4 — 파트너 링크 버튼 8개
- [x] Hero 상단 `.partner-link-wrap` — 8개 외부링크 버튼
- [x] PC: `position:absolute` 1줄 8열 grid, hero `padding-top:110px`
- [x] 모바일(≤1024px): 가로 스크롤 flex (`scrollbar-width:none`)
- [x] 티파니 블루 `#14B8A6` 배경 / 클릭 시 오렌지 `#FF4D00`
- [x] Aurora Border Flow: `conic-gradient` + `@keyframes aurora-spin 3s`
- [x] 2줄 텍스트 (`<span>` + `<strong>`) 구조
- [x] 8개 링크: feezone.my / p2p.io.kr / feezone.me / tourit.ceo / vipself.art / inkorea.my / puke365.net / vipself.art

---

## 🔑 API / 인증 정보

| 항목 | 값 |
|------|----|
| Cloudflare API Token | `cfut_****************************` (Deploy 탭에서 확인) |
| Cloudflare 프로젝트명 | `helper0509` |
| GitHub 계정 | `langsb16-collab` |
| GitHub 레포 | `helper0509-` |
| GitHub URL | `https://github.com/langsb16-collab/helper0509-` |
| 운영 도메인 | `https://jt365.me` |

---

## 🛠️ 개발 시 주의사항

### ⚠️ index.tsx 수정 방법
`src/index.tsx`는 **Python 스크립트로 자동 재생성**합니다.  
`public/index.html`을 직접 수정 후 → Python으로 이스케이프 → tsx 재생성:

```python
import re

with open('public/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 백틱과 ${ 이스케이프
html_escaped = html.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')

# API route 내 template literal은 string concatenation으로 교체
# (예: `/api/translate` 응답 내 JSON 문자열)

with open('src/index.tsx', 'r', encoding='utf-8') as f:
    tsx = f.read()

# INDEX_HTML 변수 교체
tsx_new = re.sub(
    r'const INDEX_HTML = `[\s\S]*?`(?=\n\n)',
    'const INDEX_HTML = `' + html_escaped + '`',
    tsx
)

with open('src/index.tsx', 'w', encoding='utf-8') as f:
    f.write(tsx_new)

print(f"재생성 완료: {len(tsx_new)} bytes")
```

### ⚠️ serveStatic 임포트
반드시 `hono/cloudflare-workers` 사용 (Node.js용 사용 금지):
```typescript
import { serveStatic } from 'hono/cloudflare-workers'  // ✅
// import { serveStatic } from '@hono/node-server/serve-static'  // ❌
```

### ⚠️ D1 데이터베이스 추가 시
현재 D1 미사용. 추가가 필요한 경우:
```bash
npx wrangler d1 create helper0509-production
# → database_id 복사 후 wrangler.jsonc에 추가
mkdir migrations
# 마이그레이션 SQL 파일 작성 후:
npx wrangler d1 migrations apply helper0509-production --local
```

---

## 📋 Git 커밋 이력

```
3a922d4  feat: Hero 상단 파트너 링크 버튼 8개 추가 (Aurora Border Flow 애니메이션)
dd5716a  feat: 전체 UI 글자 크기 30% 확대 - 가독성 개선 (중장년층·외국인 대응)
dda825f  feat: PC·모바일 여백 최소화 UI 수정 - Quick Menu/Notice 섹션 개선
4758c9e  feat: 탭 제목 변경 '간병 전문 통역 플랫폼', Pretendard 폰트 CDN 수정
b36df52  fix: Pretendard 폰트 CDN URL npm 경로로 수정 (404 해결)
```

---

## ✅ 복구 완료 체크리스트

- [ ] `npm install` 완료
- [ ] `npm run build` 성공 (dist/_worker.js ~105KB)
- [ ] `pm2 start ecosystem.config.cjs` — status: online
- [ ] `curl http://localhost:3000/` → HTTP 200
- [ ] `curl http://localhost:3000/health` → `{"status":"ok",...}`
- [ ] 브라우저에서 파트너 링크 버튼 8개 표시 확인
- [ ] Aurora Border Flow 애니메이션 동작 확인
- [ ] Cloudflare 배포 완료 (helper0509)
- [ ] GitHub 푸시 완료
