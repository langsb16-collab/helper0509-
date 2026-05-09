# CareTalk — 간병 전문·통역 플랫폼

## 프로젝트 개요
- **서비스명**: CareTalk
- **목표**: 외국인 간병인과 한국 환자·보호자 사이의 언어 장벽 해소
- **주요 기능**: 19개 언어 통역, 간병일지 음성 기록, OCR 처방전 분석, 커뮤니티
- **디자인**: 삼성서울병원 + Global AI SaaS 방향 / Day·Night 테마

---

## 공개 접속 URL
- **샌드박스**: https://3000-i983inor98o7s5n9xailu-ad490db5.sandbox.novita.ai
- **Health**: https://3000-i983inor98o7s5n9xailu-ad490db5.sandbox.novita.ai/health
- **GitHub**: https://github.com/langsb16-collab/helper0509-

---

## 주요 기능

### 1. 19개 언어 i18n 시스템
- 지원 언어: ko / en / zh / ja / fr / de / ru / vi / hi / pt-BR / id / ar / af / es / pl / th / uz / tr / mn
- `data-i18n` 속성 기반 자동 바인딩
- localStorage 언어 설정 유지
- 아랍어 RTL 자동 전환

### 2. 간병 통역 (Interpreter)
- 간병인→한국어 / 환자→간병인 언어 모드 전환
- 음성 입력 (Web Speech API, 30초 타임아웃)
- MyMemory API 번역 프록시 (`/api/translate`)
- 카카오톡 / 텔레그램 공유

### 3. 간병일지 (Care Log)
- 30초 음성 녹음 → 텍스트 자동 변환
- 6가지 상태 그리드 (Good/Normal/Bad × 2)
- 텍스트 3영역 (증상, 투약, 특이사항)
- 보호자 공유 버튼 + localStorage 이력

### 4. OCR 사진 분석
- 8가지 문서 타입 선택 (처방전, 약봉투, 수액, 진단서 등)
- 드래그&드롭 / 카메라 촬영 업로드
- 위험 약어 자동 감지 (PRN, STAT, NPO 등)
- 번역 + 카카오/텔레그램 공유

### 5. 커뮤니티
- 3탭: 간병인해요 / 찾아요 / 중고마켓
- 회원가입 없이 무료 등록
- localStorage 게시물 영속성
- OpenStreetMap 위치 연동

### 6. 관리자 채팅 위젯 (좌하단)
- 티파니 블루 원형 버튼
- 음성통화 / 영상통화 / 사진전송 / 음성녹음

### 7. AI FAQ 로봇 위젯 (우하단)
- 오렌지 원형 버튼
- 30개 FAQ 아코디언 (i18n 연동)
- 의료 면책 조항 포함

---

## 디자인 시스템
| 토큰 | Day | Night |
|------|-----|-------|
| `--bg` | `#F5F7FA` | `#0B1120` |
| `--card` | `#FFFFFF` | `#111827` |
| `--text` | `#1A1F3A` | `#E8EDF5` |
| `--secondary` | `#14B8A6` | `#14B8A6` |
| `--accent` | `#FF6B00` | `#FF6B00` |

- Font: Pretendard + Inter
- Icon: Lucide 스타일 SVG
- 테마 전환: 0.4초 CSS transition

---

## 데이터 아키텍처
- **커뮤니티 게시물**: `localStorage` (caretalk_posts)
- **간병일지 이력**: `localStorage` (caretalk_logs)
- **언어 설정**: `localStorage` (caretalk_lang)
- **테마 설정**: `localStorage` (caretalk_theme)
- **번역 API**: MyMemory (무료, CORS 프록시 `/api/translate`)
- **서버 게시물**: Workers 메모리 (`/api/posts`)

---

## API 엔드포인트
| Method | Path | 설명 |
|--------|------|------|
| GET | `/health` | 서비스 상태 확인 |
| GET | `/api/translate?q=&from=&to=` | 번역 프록시 |
| GET | `/api/posts?type=` | 게시물 목록 |
| POST | `/api/posts` | 게시물 등록 |
| DELETE | `/api/posts/:id` | 게시물 삭제 |
| GET | `/static/*` | 정적 파일 서빙 |
| GET | `/static/locales/:lang.json` | i18n 언어 파일 |

---

## 기술 스택
- **Backend**: Hono v4 + Cloudflare Pages/Workers
- **Build**: Vite v6 + @hono/vite-build
- **Frontend**: Vanilla JS + TailwindCSS CDN
- **i18n**: 커스텀 JSON 기반 (19개 언어)
- **Process**: PM2 (sandbox), wrangler pages dev

---

## 프로젝트 구조
```
webapp/
├── src/
│   ├── index.tsx              # Hono 앱 (API + static 서빙)
│   └── i18n/locales/          # 19개 언어 JSON
├── public/
│   ├── index.html             # SPA 메인 HTML (67KB)
│   └── static/
│       ├── app.js             # 전체 JS 로직 (35KB)
│       ├── style.css          # CSS Variables 테마 (36KB)
│       └── locales/           # i18n JSON (public 복사본)
├── dist/                      # 빌드 결과물
├── ecosystem.config.cjs       # PM2 설정
├── wrangler.jsonc             # Cloudflare 설정
└── package.json
```

---

## 미구현 / 향후 개발
- [ ] 실제 OCR API 연동 (Google Vision / Naver Clova)
- [ ] 웹 푸시 알림 (간병일지 → 보호자)
- [ ] 회원가입 / 로그인 (Cloudflare D1 + JWT)
- [ ] Cloudflare KV 기반 게시물 영속성
- [ ] 병원 지도 OpenStreetMap 실시간 연동
- [ ] 중고마켓 결제 연동

---

## 배포
- **플랫폼**: Cloudflare Pages
- **상태**: 🔄 개발 중 (샌드박스 실행 중)
- **최종 업데이트**: 2026-05-09
