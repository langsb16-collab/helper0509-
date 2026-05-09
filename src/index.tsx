import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import { cors } from 'hono/cors'

const app = new Hono()

app.use('*', cors())

// ── 정적 파일 서빙 (public/static/*) ─────────────
app.use('/static/*', serveStatic({ root: './' }))

// ── 메인 SPA HTML ────────────────────────────────
const INDEX_HTML = `<!DOCTYPE html>
<html lang="ko" data-theme="day">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <meta name="description" content="CareTalk - 간병 전문 통역 플랫폼. 외국인 간병인과 환자·보호자·의료진을 실시간 AI 통역으로 연결합니다.">
  <title>CareTalk - 글로벌 간병 전문 통역 플랫폼</title>
  <link rel="stylesheet" href="/static/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    /* Pretendard 폰트 */
    @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');
  </style>
</head>
<body>

<!-- ═══════════════════════════════════════════════
     NAVIGATION
════════════════════════════════════════════════ -->
<nav id="nav">
  <div class="nav-inner">
    <a class="nav-logo" href="#" onclick="showPage('home')">
      <div class="nav-logo-icon">CT</div>
      <span>CareTalk</span>
    </a>

    <nav class="nav-menu">
      <a data-page="home" class="active" onclick="showPage('home')" data-i18n="nav.home">홈</a>
      <a data-page="interpreter" onclick="showPage('interpreter')" data-i18n="nav.interpreter">통역</a>
      <a data-page="carelog" onclick="showPage('carelog')" data-i18n="nav.careLog">간병일지</a>
      <a data-page="ocr" onclick="showPage('ocr')" data-i18n="nav.ocr">사진분석</a>
      <a data-page="community" onclick="showPage('community')" data-i18n="nav.community">커뮤니티</a>
    </nav>

    <div class="nav-right">
      <button class="theme-toggle" id="theme-toggle" onclick="toggleTheme()">🌙 다크</button>
      <div class="lang-selector">
        <select id="lang-select" onchange="setLang(this.value)">
          <option value="ko">🇰🇷 한국어</option>
          <option value="en">🇺🇸 English</option>
          <option value="zh">🇨🇳 中文</option>
          <option value="ja">🇯🇵 日本語</option>
          <option value="fr">🇫🇷 Français</option>
          <option value="de">🇩🇪 Deutsch</option>
          <option value="ru">🇷🇺 Русский</option>
          <option value="vi">🇻🇳 Tiếng Việt</option>
          <option value="hi">🇮🇳 हिन्दी</option>
          <option value="pt-BR">🇧🇷 Português</option>
          <option value="id">🇮🇩 Bahasa</option>
          <option value="ar">🇸🇦 العربية</option>
          <option value="af">🇿🇦 Afrikaans</option>
          <option value="es">🇪🇸 Español</option>
          <option value="pl">🇵🇱 Polski</option>
          <option value="th">🇹🇭 ภาษาไทย</option>
          <option value="uz">🇺🇿 O'zbek</option>
          <option value="tr">🇹🇷 Türkçe</option>
          <option value="mn">🇲🇳 Монгол</option>
        </select>
      </div>
    </div>
  </div>
</nav>

<!-- ═══════════════════════════════════════════════
     MOBILE BOTTOM NAV
════════════════════════════════════════════════ -->
<nav id="mobile-nav">
  <div class="mobile-nav-inner">
    <button class="mobile-nav-item active" data-page="home" onclick="showPage('home')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      <span data-i18n="nav.home">홈</span>
    </button>
    <button class="mobile-nav-item" data-page="interpreter" onclick="showPage('interpreter')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      <span data-i18n="nav.interpreter">통역</span>
    </button>
    <button class="mobile-nav-item" data-page="carelog" onclick="showPage('carelog')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
      <span data-i18n="nav.careLog">간병일지</span>
    </button>
    <button class="mobile-nav-item" data-page="ocr" onclick="showPage('ocr')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>
      <span data-i18n="nav.ocr">사진분석</span>
    </button>
    <button class="mobile-nav-item" data-page="community" onclick="showPage('community')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      <span data-i18n="nav.community">커뮤니티</span>
    </button>
  </div>
</nav>

<!-- ═══════════════════════════════════════════════
     MAIN CONTENT
════════════════════════════════════════════════ -->
<main>

<!-- ─────────── HOME PAGE ─────────── -->
<div id="page-home" class="page active">

  <!-- Hero -->
  <section class="hero">
    <div class="hero-content">
      <div class="hero-text">
        <div class="hero-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          19개 언어 · 실시간 AI 통역
        </div>
        <h1 class="hero-title" data-i18n="home.heroTitle">글로벌 간병 전문<br><span>통역 플랫폼</span></h1>
        <p class="hero-desc" data-i18n="home.heroDesc">환자·보호자·간병인·의료진을<br>실시간 AI 통역으로 연결합니다.</p>
        <div class="hero-actions">
          <button class="btn btn-secondary btn-lg" onclick="showPage('interpreter')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            <span data-i18n="buttons.start">시작하기</span>
          </button>
          <button class="btn btn-outline btn-lg" onclick="showPage('community')" style="color:rgba(255,255,255,0.8);border-color:rgba(255,255,255,0.25)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span data-i18n="nav.community">커뮤니티</span>
          </button>
        </div>
        <div class="hero-stats">
          <div class="hero-stat">
            <div class="hero-stat-num">19</div>
            <div class="hero-stat-label" data-i18n="home.stat1">지원 언어</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-num">2,400+</div>
            <div class="hero-stat-label" data-i18n="home.stat2">등록 간병인</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-num">58K+</div>
            <div class="hero-stat-label" data-i18n="home.stat3">누적 통역</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-num">4.9★</div>
            <div class="hero-stat-label" data-i18n="home.stat4">만족도</div>
          </div>
        </div>
      </div>

      <!-- Hero Visual Cards -->
      <div class="hero-visual">
        <div class="hero-card" onclick="showPage('interpreter')" style="cursor:pointer">
          <div class="hero-card-icon" style="background:rgba(20,184,166,0.2)">🌐</div>
          <h4 data-i18n="home.feature1Title">실시간 통역</h4>
          <p data-i18n="home.feature1Desc">19개 언어 실시간 양방향 통역</p>
        </div>
        <div class="hero-card" onclick="showPage('carelog')" style="cursor:pointer">
          <div class="hero-card-icon" style="background:rgba(255,107,0,0.2)">📋</div>
          <h4 data-i18n="home.feature2Title">간병일지</h4>
          <p data-i18n="home.feature2Desc">음성녹음 자동 텍스트 변환 전달</p>
        </div>
        <div class="hero-card" onclick="showPage('ocr')" style="cursor:pointer">
          <div class="hero-card-icon" style="background:rgba(99,102,241,0.2)">📷</div>
          <h4 data-i18n="home.feature3Title">사진 분석</h4>
          <p data-i18n="home.feature3Desc">처방전·약봉투 OCR 텍스트 추출</p>
        </div>
        <div class="hero-card" onclick="showPage('community')" style="cursor:pointer">
          <div class="hero-card-icon" style="background:rgba(245,158,11,0.2)">👥</div>
          <h4 data-i18n="home.feature4Title">커뮤니티</h4>
          <p data-i18n="home.feature4Desc">간병인 구인·구직 무료 게시판</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Quick Menu + Notice -->
  <section style="background:var(--bg);padding:40px 0">
    <div class="container">
      <div style="display:grid;grid-template-columns:1fr 340px;gap:24px;align-items:start">

        <!-- Quick Menu Grid -->
        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
            <h2 style="font-size:1.25rem" data-i18n="home.quickMenu">빠른 메뉴</h2>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">
            <!-- 통역 -->
            <button onclick="showPage('interpreter')" style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:22px 16px;display:flex;flex-direction:column;align-items:center;gap:10px;cursor:pointer;transition:all 0.3s;text-align:center" onmouseover="this.style.borderColor='var(--secondary)';this.style.transform='translateY(-3px)'" onmouseout="this.style.borderColor='var(--border)';this.style.transform=''">
              <div style="width:48px;height:48px;border-radius:14px;background:rgba(20,184,166,0.1);display:flex;align-items:center;justify-content:center;font-size:22px">🌐</div>
              <span style="font-size:0.875rem;font-weight:700;color:var(--text)" data-i18n="nav.interpreter">통역</span>
              <span style="font-size:0.75rem;color:var(--text-muted)">19개 언어</span>
            </button>
            <!-- 간병일지 -->
            <button onclick="showPage('carelog')" style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:22px 16px;display:flex;flex-direction:column;align-items:center;gap:10px;cursor:pointer;transition:all 0.3s;text-align:center" onmouseover="this.style.borderColor='var(--accent)';this.style.transform='translateY(-3px)'" onmouseout="this.style.borderColor='var(--border)';this.style.transform=''">
              <div style="width:48px;height:48px;border-radius:14px;background:rgba(255,107,0,0.1);display:flex;align-items:center;justify-content:center;font-size:22px">📋</div>
              <span style="font-size:0.875rem;font-weight:700;color:var(--text)" data-i18n="nav.careLog">간병일지</span>
              <span style="font-size:0.75rem;color:var(--text-muted)">음성→텍스트</span>
            </button>
            <!-- OCR -->
            <button onclick="showPage('ocr')" style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:22px 16px;display:flex;flex-direction:column;align-items:center;gap:10px;cursor:pointer;transition:all 0.3s;text-align:center" onmouseover="this.style.borderColor='#6366F1';this.style.transform='translateY(-3px)'" onmouseout="this.style.borderColor='var(--border)';this.style.transform=''">
              <div style="width:48px;height:48px;border-radius:14px;background:rgba(99,102,241,0.1);display:flex;align-items:center;justify-content:center;font-size:22px">📷</div>
              <span style="font-size:0.875rem;font-weight:700;color:var(--text)" data-i18n="nav.ocr">사진분석</span>
              <span style="font-size:0.75rem;color:var(--text-muted)">OCR 분석</span>
            </button>
            <!-- 간병인 해요 -->
            <button onclick="showPage('community');setTimeout(()=>setCommunityTab('offer'),100)" style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:22px 16px;display:flex;flex-direction:column;align-items:center;gap:10px;cursor:pointer;transition:all 0.3s;text-align:center" onmouseover="this.style.borderColor='var(--secondary)';this.style.transform='translateY(-3px)'" onmouseout="this.style.borderColor='var(--border)';this.style.transform=''">
              <div style="width:48px;height:48px;border-radius:14px;background:rgba(20,184,166,0.1);display:flex;align-items:center;justify-content:center;font-size:22px">👩‍⚕️</div>
              <span style="font-size:0.875rem;font-weight:700;color:var(--text)" data-i18n="community.caregiverOffer">간병인 해요</span>
              <span style="font-size:0.75rem;color:var(--text-muted)">구직 게시판</span>
            </button>
            <!-- 간병인 찾아요 -->
            <button onclick="showPage('community');setTimeout(()=>setCommunityTab('request'),100)" style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:22px 16px;display:flex;flex-direction:column;align-items:center;gap:10px;cursor:pointer;transition:all 0.3s;text-align:center" onmouseover="this.style.borderColor='var(--accent)';this.style.transform='translateY(-3px)'" onmouseout="this.style.borderColor='var(--border)';this.style.transform=''">
              <div style="width:48px;height:48px;border-radius:14px;background:rgba(255,107,0,0.1);display:flex;align-items:center;justify-content:center;font-size:22px">🔍</div>
              <span style="font-size:0.875rem;font-weight:700;color:var(--text)" data-i18n="community.caregiverRequest">간병인 찾아요</span>
              <span style="font-size:0.75rem;color:var(--text-muted)">구인 게시판</span>
            </button>
            <!-- 중고마켓 -->
            <button onclick="showPage('community');setTimeout(()=>setCommunityTab('market'),100)" style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:22px 16px;display:flex;flex-direction:column;align-items:center;gap:10px;cursor:pointer;transition:all 0.3s;text-align:center" onmouseover="this.style.borderColor='var(--warning)';this.style.transform='translateY(-3px)'" onmouseout="this.style.borderColor='var(--border)';this.style.transform=''">
              <div style="width:48px;height:48px;border-radius:14px;background:rgba(245,158,11,0.1);display:flex;align-items:center;justify-content:center;font-size:22px">🛒</div>
              <span style="font-size:0.875rem;font-weight:700;color:var(--text)" data-i18n="community.market">중고마켓</span>
              <span style="font-size:0.75rem;color:var(--text-muted)">케어용품</span>
            </button>
          </div>
        </div>

        <!-- Notice Panel -->
        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
            <h2 style="font-size:1.1rem" data-i18n="home.notice">공지사항</h2>
          </div>
          <div class="card">
            <div class="card-body" style="padding:16px">
              <div style="display:flex;flex-direction:column;gap:12px">
                <div style="padding:12px;background:var(--bg-secondary);border-radius:10px;border-left:3px solid var(--secondary)">
                  <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:4px">2025.05.09</div>
                  <div style="font-size:0.875rem;font-weight:600;color:var(--text)">🎉 CareTalk 서비스 정식 오픈!</div>
                  <div style="font-size:0.8rem;color:var(--text-secondary);margin-top:4px">19개 언어 통역, 간병일지, OCR 분석 기능을 무료로 이용하세요.</div>
                </div>
                <div style="padding:12px;background:var(--bg-secondary);border-radius:10px;border-left:3px solid var(--accent)">
                  <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:4px">2025.05.08</div>
                  <div style="font-size:0.875rem;font-weight:600;color:var(--text)">📢 간병인 커뮤니티 오픈</div>
                  <div style="font-size:0.8rem;color:var(--text-secondary);margin-top:4px">회원가입 없이 무료로 구인·구직 게시물을 등록하세요.</div>
                </div>
                <div style="padding:12px;background:var(--bg-secondary);border-radius:10px;border-left:3px solid var(--warning)">
                  <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:4px">2025.05.07</div>
                  <div style="font-size:0.875rem;font-weight:600;color:var(--text)">⚠️ 이용 안내</div>
                  <div style="font-size:0.8rem;color:var(--text-secondary);margin-top:4px">본 플랫폼은 보조 서비스입니다. 치료 판단은 반드시 의료진에게 확인하세요.</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats Card -->
          <div class="card" style="margin-top:14px">
            <div class="card-body" style="padding:16px">
              <div style="font-size:0.875rem;font-weight:700;color:var(--text);margin-bottom:12px" data-i18n="home.statsTitle">플랫폼 현황</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                <div style="text-align:center;padding:10px;background:var(--bg-secondary);border-radius:10px">
                  <div style="font-size:1.4rem;font-weight:800;color:var(--secondary)">19</div>
                  <div style="font-size:0.72rem;color:var(--text-muted)" data-i18n="home.stat1">지원 언어</div>
                </div>
                <div style="text-align:center;padding:10px;background:var(--bg-secondary);border-radius:10px">
                  <div style="font-size:1.4rem;font-weight:800;color:var(--accent)">2.4K</div>
                  <div style="font-size:0.72rem;color:var(--text-muted)" data-i18n="home.stat2">등록 간병인</div>
                </div>
                <div style="text-align:center;padding:10px;background:var(--bg-secondary);border-radius:10px">
                  <div style="font-size:1.4rem;font-weight:800;color:var(--primary)">58K</div>
                  <div style="font-size:0.72rem;color:var(--text-muted)" data-i18n="home.stat3">누적 통역</div>
                </div>
                <div style="text-align:center;padding:10px;background:var(--bg-secondary);border-radius:10px">
                  <div style="font-size:1.4rem;font-weight:800;color:var(--success)">4.9★</div>
                  <div style="font-size:0.72rem;color:var(--text-muted)" data-i18n="home.stat4">만족도</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Latest Posts Preview -->
  <section style="background:var(--bg-secondary);padding:40px 0">
    <div class="container">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
        <h2 style="font-size:1.25rem" data-i18n="home.latestPosts">최신 게시물</h2>
        <button class="btn btn-outline btn-sm" onclick="showPage('community')">전체 보기 →</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px" id="home-posts-preview"></div>
    </div>
  </section>

</div><!-- /home -->


<!-- ─────────── INTERPRETER PAGE ─────────── -->
<div id="page-interpreter" class="page">

  <div class="page-header">
    <div class="container">
      <h1>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" style="vertical-align:middle;margin-right:8px"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        <span data-i18n="interpreter.title">간병 통역</span>
      </h1>
      <p data-i18n="interpreter.subtitle">외국인 간병인과 환자·보호자 간 실시간 통역</p>
    </div>
  </div>

  <div class="container" style="padding-top:28px;padding-bottom:40px">

    <!-- Mode Selector -->
    <div class="mode-selector" style="max-width:500px;margin:0 auto 24px">
      <button class="mode-btn active" id="mode-caregiver" onclick="setInterpMode('caregiver')">
        👩‍⚕️ <span data-i18n="interpreter.caregiverMode">간병인 → 한국어</span>
      </button>
      <button class="mode-btn" id="mode-patient" onclick="setInterpMode('patient')">
        🏥 <span data-i18n="interpreter.patientMode">환자 → 간병인 언어</span>
      </button>
    </div>

    <!-- Translator Layout -->
    <div class="interpreter-layout" style="max-width:900px;margin:0 auto">
      <!-- Input Panel -->
      <div class="interp-panel">
        <div class="interp-header">
          <select id="from-lang" class="form-control" style="width:auto;padding:6px 32px 6px 10px;font-size:0.825rem" onchange="document.getElementById('from-lang').dataset.selected=this.value">
            <option value="en">🇺🇸 English</option>
            <option value="zh">🇨🇳 中文</option>
            <option value="ja">🇯🇵 日本語</option>
            <option value="fr">🇫🇷 Français</option>
            <option value="de">🇩🇪 Deutsch</option>
            <option value="ru">🇷🇺 Русский</option>
            <option value="vi">🇻🇳 Tiếng Việt</option>
            <option value="hi">🇮🇳 हिन्दी</option>
            <option value="pt-BR">🇧🇷 Português</option>
            <option value="id">🇮🇩 Bahasa</option>
            <option value="ar">🇸🇦 العربية</option>
            <option value="es">🇪🇸 Español</option>
            <option value="th">🇹🇭 ภาษาไทย</option>
            <option value="ko">🇰🇷 한국어</option>
          </select>
          <div style="color:var(--text-muted);font-size:0.8rem;font-weight:600" data-i18n="interpreter.fromLang">원본 언어</div>
        </div>
        <textarea id="interp-input" class="interp-textarea" data-i18n-placeholder="interpreter.inputPlaceholder" placeholder="번역할 내용을 입력하거나 음성을 입력하세요" oninput="if(this.value) document.getElementById('translate-btn').removeAttribute('disabled')"></textarea>
        <div class="interp-actions">
          <button id="voice-btn" class="record-btn" style="width:44px;height:44px" onclick="startVoiceInput('interp-input')" title="음성 입력">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          </button>
          <button id="translate-btn" class="btn btn-secondary" onclick="translateText()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            <span data-i18n="buttons.translate">통역하기</span>
          </button>
          <button class="btn btn-outline btn-sm" onclick="document.getElementById('interp-input').value='';document.getElementById('interp-result').textContent='번역 결과가 여기에 표시됩니다.'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>
          </button>
        </div>
        <div style="margin-top:10px;font-size:0.775rem;color:var(--text-muted);display:flex;align-items:center;gap:4px">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/></svg>
          <span data-i18n="interpreter.voiceGuide">마이크 버튼을 누르고 말씀하세요</span>
        </div>
      </div>

      <!-- Output Panel -->
      <div class="interp-panel" style="background:var(--bg-secondary)">
        <div class="interp-header">
          <div style="color:var(--text-muted);font-size:0.8rem;font-weight:600" data-i18n="interpreter.toLang">번역 언어</div>
          <select id="to-lang" class="form-control" style="width:auto;padding:6px 32px 6px 10px;font-size:0.825rem" onchange="document.getElementById('to-lang').dataset.selected=this.value">
            <option value="ko">🇰🇷 한국어</option>
            <option value="en">🇺🇸 English</option>
            <option value="zh">🇨🇳 中文</option>
            <option value="ja">🇯🇵 日本語</option>
            <option value="vi">🇻🇳 Tiếng Việt</option>
            <option value="ru">🇷🇺 Русский</option>
            <option value="fr">🇫🇷 Français</option>
            <option value="de">🇩🇪 Deutsch</option>
            <option value="ar">🇸🇦 العربية</option>
            <option value="es">🇪🇸 Español</option>
            <option value="hi">🇮🇳 हिन्दी</option>
            <option value="th">🇹🇭 ภาษาไทย</option>
          </select>
        </div>
        <div id="interp-result" style="min-height:180px;padding:14px;background:var(--card);border:1px solid var(--border);border-radius:var(--radius-sm);font-size:1.05rem;line-height:1.7;color:var(--text-secondary);font-style:italic">번역 결과가 여기에 표시됩니다.</div>
        <div class="interp-actions" style="margin-top:12px">
          <button class="btn btn-outline btn-sm" onclick="copyResult()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span data-i18n="buttons.copy">복사</span>
          </button>
          <button class="btn btn-kakao btn-sm" onclick="shareKakao()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span data-i18n="buttons.sendKakao">카카오톡</span>
          </button>
          <button class="btn btn-telegram btn-sm" onclick="shareTelegram()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            <span data-i18n="buttons.sendTelegram">텔레그램</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Translation History -->
    <div style="max-width:900px;margin:24px auto 0">
      <h3 style="font-size:1rem;margin-bottom:14px;display:flex;align-items:center;gap:8px">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span data-i18n="interpreter.history">번역 기록</span>
      </h3>
      <div id="interp-history" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px"></div>
    </div>
  </div>
</div><!-- /interpreter -->


<!-- ─────────── CARE LOG PAGE ─────────── -->
<div id="page-carelog" class="page">

  <div class="page-header">
    <div class="container">
      <h1>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" style="vertical-align:middle;margin-right:8px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        <span data-i18n="careLog.title">간병일지</span>
      </h1>
      <p data-i18n="careLog.subtitle">하루 간병 내용을 기록하고 보호자·의료진에게 전달합니다</p>
    </div>
  </div>

  <div class="container" style="padding-top:28px;padding-bottom:40px">
    <div class="care-log-grid">

      <!-- Log Form -->
      <div class="care-log-form">
        <div class="card">
          <div class="card-body">
            <!-- Date -->
            <div class="form-group">
              <label class="form-label" data-i18n="careLog.date">날짜</label>
              <input type="date" id="log-date" class="form-control">
            </div>

            <!-- Voice Record Banner -->
            <div style="background:linear-gradient(135deg,rgba(20,184,166,0.08),rgba(20,184,166,0.03));border:1px solid rgba(20,184,166,0.2);border-radius:12px;padding:16px;margin-bottom:20px;display:flex;align-items:center;gap:14px">
              <button id="log-record-btn" class="record-btn" onclick="toggleVoiceLog()" style="width:52px;height:52px;flex-shrink:0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              </button>
              <div style="flex:1">
                <div style="font-weight:700;font-size:0.9rem;color:var(--text)" data-i18n="buttons.record">30초 녹음</div>
                <div style="font-size:0.78rem;color:var(--text-muted)" data-i18n="careLog.recordGuide">30초 단위로 음성 녹음 후 자동 텍스트 변환됩니다</div>
              </div>
              <div id="log-timer" style="font-size:1rem;font-weight:800;color:var(--secondary);min-width:36px;text-align:center">30초</div>
            </div>

            <!-- Status Items Grid -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">

              <!-- 환자 상태 -->
              <div class="form-group" style="margin:0">
                <label class="form-label" data-i18n="careLog.patientStatus">환자 상태</label>
                <div class="status-selector">
                  <button class="status-btn good" onclick="setStatus('patientStatus','좋음',this)" data-i18n="careLog.good">좋음</button>
                  <button class="status-btn normal" onclick="setStatus('patientStatus','보통',this)" data-i18n="careLog.normal">보통</button>
                  <button class="status-btn bad" onclick="setStatus('patientStatus','나쁨',this)" data-i18n="careLog.bad">나쁨</button>
                </div>
              </div>

              <!-- 식사 -->
              <div class="form-group" style="margin:0">
                <label class="form-label" data-i18n="careLog.meal">식사 여부</label>
                <div class="status-selector">
                  <button class="status-btn good" onclick="setStatus('meal','예',this)" data-i18n="careLog.yes">예</button>
                  <button class="status-btn bad" onclick="setStatus('meal','아니오',this)" data-i18n="careLog.no">아니오</button>
                </div>
              </div>

              <!-- 복약 -->
              <div class="form-group" style="margin:0">
                <label class="form-label" data-i18n="careLog.medication">복약 여부</label>
                <div class="status-selector">
                  <button class="status-btn good" onclick="setStatus('medication','예',this)" data-i18n="careLog.yes">예</button>
                  <button class="status-btn bad" onclick="setStatus('medication','아니오',this)" data-i18n="careLog.no">아니오</button>
                </div>
              </div>

              <!-- 수면 -->
              <div class="form-group" style="margin:0">
                <label class="form-label" data-i18n="careLog.sleep">수면 상태</label>
                <div class="status-selector">
                  <button class="status-btn good" onclick="setStatus('sleep','좋음',this)" data-i18n="careLog.good">좋음</button>
                  <button class="status-btn normal" onclick="setStatus('sleep','보통',this)" data-i18n="careLog.normal">보통</button>
                  <button class="status-btn bad" onclick="setStatus('sleep','나쁨',this)" data-i18n="careLog.bad">나쁨</button>
                </div>
              </div>

              <!-- 배변 -->
              <div class="form-group" style="margin:0">
                <label class="form-label" data-i18n="careLog.toilet">배변 상태</label>
                <div class="status-selector">
                  <button class="status-btn good" onclick="setStatus('toilet','정상',this)">정상</button>
                  <button class="status-btn bad" onclick="setStatus('toilet','이상',this)">이상</button>
                </div>
              </div>

              <!-- 통증 -->
              <div class="form-group" style="margin:0">
                <label class="form-label" data-i18n="careLog.pain">통증 여부</label>
                <div class="status-selector">
                  <button class="status-btn good" onclick="setStatus('pain','없음',this)">없음</button>
                  <button class="status-btn bad" onclick="setStatus('pain','있음',this)">있음</button>
                </div>
              </div>
            </div>

            <!-- 특이사항 -->
            <div class="form-group">
              <label class="form-label" data-i18n="careLog.special">특이사항</label>
              <textarea id="log-special" class="form-control" rows="3" data-i18n-placeholder="form.placeholder.content" placeholder="특이사항을 입력하세요 (음성 녹음 시 자동 입력)"></textarea>
            </div>

            <!-- 의료진 전달 -->
            <div class="form-group">
              <label class="form-label" data-i18n="careLog.doctorNote">의사·간호사 전달사항</label>
              <textarea id="log-doctor" class="form-control" rows="2" placeholder="의료진에게 전달할 내용을 입력하세요"></textarea>
            </div>

            <!-- 보호자 전달 -->
            <div class="form-group">
              <label class="form-label" data-i18n="careLog.guardianNote">보호자 전달사항</label>
              <textarea id="log-guardian" class="form-control" rows="2" placeholder="보호자에게 전달할 내용을 입력하세요"></textarea>
            </div>

            <!-- Actions -->
            <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px">
              <button class="btn btn-secondary" onclick="saveCareLog()" style="flex:1;min-width:120px">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                <span data-i18n="buttons.save">저장</span>
              </button>
              <button class="btn btn-kakao" onclick="shareLogKakao()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span data-i18n="buttons.sendKakao">카카오톡</span>
              </button>
              <button class="btn btn-telegram" onclick="shareLogTelegram()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                <span data-i18n="buttons.sendTelegram">텔레그램</span>
              </button>
              <button class="btn btn-outline btn-sm" onclick="copyLog()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                <span data-i18n="buttons.copy">복사</span>
              </button>
              <button class="btn btn-outline btn-sm" onclick="saveLogPdf()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span data-i18n="buttons.savePdf">PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar: History -->
      <div>
        <div class="card">
          <div class="card-body">
            <h3 style="font-size:1rem;margin-bottom:14px;display:flex;align-items:center;gap:6px">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              최근 간병일지
            </h3>
            <div id="log-history"></div>
          </div>
        </div>

        <!-- 전달 가이드 -->
        <div class="card" style="margin-top:16px">
          <div class="card-body">
            <h3 style="font-size:0.95rem;margin-bottom:12px;color:var(--secondary)">📤 전달 방법</h3>
            <div style="display:flex;flex-direction:column;gap:10px">
              <div style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(254,229,0,0.1);border-radius:8px">
                <span style="font-size:1.4rem">💬</span>
                <div>
                  <div style="font-size:0.825rem;font-weight:700">카카오톡</div>
                  <div style="font-size:0.75rem;color:var(--text-muted)">간병일지 → 카카오톡 공유</div>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(34,158,217,0.1);border-radius:8px">
                <span style="font-size:1.4rem">✈️</span>
                <div>
                  <div style="font-size:0.825rem;font-weight:700">텔레그램</div>
                  <div style="font-size:0.75rem;color:var(--text-muted)">간병일지 → 텔레그램 공유</div>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(239,68,68,0.1);border-radius:8px">
                <span style="font-size:1.4rem">📄</span>
                <div>
                  <div style="font-size:0.825rem;font-weight:700">PDF 저장</div>
                  <div style="font-size:0.75rem;color:var(--text-muted)">PDF 파일로 저장 후 전달</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div><!-- /carelog -->


<!-- ─────────── OCR PAGE ─────────── -->
<div id="page-ocr" class="page">

  <div class="page-header">
    <div class="container">
      <h1>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" style="vertical-align:middle;margin-right:8px"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>
        <span data-i18n="ocr.title">사진 분석</span>
      </h1>
      <p data-i18n="ocr.subtitle">수액·약·처방전 사진을 분석하여 텍스트로 변환합니다</p>
    </div>
  </div>

  <div class="container" style="padding-top:28px;padding-bottom:40px">

    <!-- OCR Notice -->
    <div class="ocr-notice">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span data-i18n="ocr.guide">참고용 텍스트 분석 서비스입니다. 의료 진단이 아닙니다.</span>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start">

      <!-- Upload Section -->
      <div>
        <!-- Target Type Selector -->
        <div class="card" style="margin-bottom:16px">
          <div class="card-body">
            <div class="form-label" style="margin-bottom:10px">분석 대상 선택</div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
              <button onclick="document.querySelectorAll('.ocr-type-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')" class="ocr-type-btn active" style="padding:8px 4px;border-radius:8px;border:1px solid var(--border);background:var(--bg-secondary);font-size:0.72rem;font-weight:600;color:var(--text-secondary);cursor:pointer;text-align:center;transition:all 0.2s">💉<br><span data-i18n="ocr.targets.iv">수액</span></button>
              <button onclick="document.querySelectorAll('.ocr-type-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')" class="ocr-type-btn" style="padding:8px 4px;border-radius:8px;border:1px solid var(--border);background:var(--bg-secondary);font-size:0.72rem;font-weight:600;color:var(--text-secondary);cursor:pointer;text-align:center;transition:all 0.2s">💊<br><span data-i18n="ocr.targets.medicine">약봉투</span></button>
              <button onclick="document.querySelectorAll('.ocr-type-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')" class="ocr-type-btn" style="padding:8px 4px;border-radius:8px;border:1px solid var(--border);background:var(--bg-secondary);font-size:0.72rem;font-weight:600;color:var(--text-secondary);cursor:pointer;text-align:center;transition:all 0.2s">📋<br><span data-i18n="ocr.targets.prescription">처방전</span></button>
              <button onclick="document.querySelectorAll('.ocr-type-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')" class="ocr-type-btn" style="padding:8px 4px;border-radius:8px;border:1px solid var(--border);background:var(--bg-secondary);font-size:0.72rem;font-weight:600;color:var(--text-secondary);cursor:pointer;text-align:center;transition:all 0.2s">📄<br><span data-i18n="ocr.targets.guide">복약안내</span></button>
              <button onclick="document.querySelectorAll('.ocr-type-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')" class="ocr-type-btn" style="padding:8px 4px;border-radius:8px;border:1px solid var(--border);background:var(--bg-secondary);font-size:0.72rem;font-weight:600;color:var(--text-secondary);cursor:pointer;text-align:center;transition:all 0.2s">🏥<br><span data-i18n="ocr.targets.hospitalInfo">병원안내</span></button>
              <button onclick="document.querySelectorAll('.ocr-type-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')" class="ocr-type-btn" style="padding:8px 4px;border-radius:8px;border:1px solid var(--border);background:var(--bg-secondary);font-size:0.72rem;font-weight:600;color:var(--text-secondary);cursor:pointer;text-align:center;transition:all 0.2s">📝<br><span data-i18n="ocr.targets.medRecord">진료기록</span></button>
              <button onclick="document.querySelectorAll('.ocr-type-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')" class="ocr-type-btn" style="padding:8px 4px;border-radius:8px;border:1px solid var(--border);background:var(--bg-secondary);font-size:0.72rem;font-weight:600;color:var(--text-secondary);cursor:pointer;text-align:center;transition:all 0.2s">🔬<br><span data-i18n="ocr.targets.labResult">검사결과</span></button>
              <button onclick="document.querySelectorAll('.ocr-type-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')" class="ocr-type-btn" style="padding:8px 4px;border-radius:8px;border:1px solid var(--border);background:var(--bg-secondary);font-size:0.72rem;font-weight:600;color:var(--text-secondary);cursor:pointer;text-align:center;transition:all 0.2s">⚠️<br><span data-i18n="ocr.targets.caution">주의사항</span></button>
            </div>
            <style>.ocr-type-btn.active{border-color:var(--secondary)!important;background:rgba(20,184,166,0.08)!important;color:var(--secondary)!important}</style>
          </div>
        </div>

        <!-- Upload Zone -->
        <div class="ocr-upload-zone" id="ocr-drop-zone">
          <input type="file" accept="image/*" onchange="handleOcrUpload(this)" id="ocr-file-input">
          <div class="upload-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
          <h3 style="font-size:1rem;margin-bottom:6px;color:var(--text)" data-i18n="ocr.uploadGuide">사진을 업로드하거나 카메라로 촬영하세요</h3>
          <p style="font-size:0.825rem;color:var(--text-muted)">JPG · PNG · HEIC · PDF 지원 · 최대 10MB</p>
          <div style="display:flex;gap:10px;justify-content:center;margin-top:16px">
            <label class="btn btn-secondary" style="cursor:pointer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span data-i18n="buttons.uploadPhoto">사진 업로드</span>
              <input type="file" accept="image/*" style="display:none" onchange="handleOcrUpload(this)">
            </label>
            <label class="btn btn-outline" style="cursor:pointer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              카메라 촬영
              <input type="file" accept="image/*" capture="environment" style="display:none" onchange="handleOcrUpload(this)">
            </label>
          </div>
        </div>

        <!-- Preview -->
        <div style="margin-top:16px;text-align:center">
          <img id="ocr-preview" src="" alt="업로드 사진" style="display:none;max-width:100%;max-height:280px;border-radius:12px;border:1px solid var(--border);object-fit:contain">
        </div>

        <div style="margin-top:14px">
          <button id="ocr-analyze-btn" class="btn btn-accent btn-full" onclick="analyzeOcr()" disabled>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span data-i18n="buttons.analyze">분석하기</span>
          </button>
        </div>
      </div>

      <!-- Result Section -->
      <div id="ocr-result-section" class="hidden">
        <div id="ocr-spinner" class="hidden" style="padding:40px">
          <div class="spinner"></div>
          <p style="text-align:center;margin-top:14px;color:var(--text-muted)" data-i18n="ocr.analyzing">분석 중...</p>
        </div>

        <!-- Warning -->
        <div id="ocr-warning" class="ocr-warning hidden" style="margin-bottom:16px">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <div>
            <div class="ocr-warning-text" data-i18n="ocr.warning">⚠️ 의료진 확인 필요</div>
            <div class="ocr-warning-detail" data-i18n="ocr.warningDetail">위험 문구가 감지되었습니다. 반드시 의료진에게 확인하세요.</div>
          </div>
        </div>

        <!-- Result Text -->
        <div class="card" style="margin-bottom:16px">
          <div class="card-body">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
              <h3 style="font-size:1rem" data-i18n="ocr.result">분석 결과</h3>
              <button class="btn btn-outline btn-sm" onclick="copyOcr()">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                <span data-i18n="buttons.copy">복사</span>
              </button>
            </div>
            <div id="ocr-result-text" style="background:var(--bg-secondary);padding:14px;border-radius:8px;font-size:0.9rem;line-height:1.7;white-space:pre-wrap;color:var(--text)"></div>
          </div>
        </div>

        <!-- Summary -->
        <div class="card" style="margin-bottom:16px">
          <div class="card-body">
            <h3 style="font-size:0.95rem;margin-bottom:8px;color:var(--secondary)" data-i18n="ocr.summary">한국어 요약</h3>
            <div id="ocr-summary" style="font-size:0.875rem;color:var(--text-secondary);line-height:1.6"></div>
          </div>
        </div>

        <!-- Translate OCR -->
        <div class="card" style="margin-bottom:16px">
          <div class="card-body">
            <h3 style="font-size:0.95rem;margin-bottom:10px" data-i18n="ocr.translation">선택 언어 번역</h3>
            <div style="display:flex;gap:8px;margin-bottom:10px">
              <select id="ocr-translate-lang" class="form-control" style="flex:1">
                <option value="en">English</option>
                <option value="zh">中文</option>
                <option value="ja">日本語</option>
                <option value="vi">Tiếng Việt</option>
                <option value="ru">Русский</option>
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
                <option value="hi">हिन्दी</option>
              </select>
              <button class="btn btn-secondary" onclick="translateOcrResult()">번역</button>
            </div>
            <div id="ocr-translated" style="background:var(--bg-secondary);padding:12px;border-radius:8px;font-size:0.875rem;color:var(--text);min-height:48px;line-height:1.6"></div>
          </div>
        </div>

        <!-- Share -->
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn btn-kakao" onclick="shareOcrKakao()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span data-i18n="buttons.sendKakao">카카오톡</span>
          </button>
          <button class="btn btn-telegram" onclick="shareOcrTelegram()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            <span data-i18n="buttons.sendTelegram">텔레그램</span>
          </button>
        </div>
      </div>

      <!-- Placeholder when no result yet -->
      <div id="ocr-placeholder" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;color:var(--text-muted);text-align:center">
        <div style="font-size:4rem;margin-bottom:16px">📄</div>
        <p style="font-size:0.9rem">사진을 업로드하면<br>분석 결과가 여기에 표시됩니다.</p>
      </div>
    </div>
  </div>
</div><!-- /ocr -->


<!-- ─────────── COMMUNITY PAGE ─────────── -->
<div id="page-community" class="page">

  <div class="page-header">
    <div class="container">
      <h1>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" style="vertical-align:middle;margin-right:8px"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <span data-i18n="community.title">커뮤니티</span>
      </h1>
      <p data-i18n="community.loginFree">회원가입·로그인 없이 무료 등록 가능</p>
    </div>
  </div>

  <div class="container" style="padding-top:24px;padding-bottom:40px">

    <!-- Tab + Write Button -->
    <div class="community-header">
      <div class="tab-list" style="margin-bottom:0;border:none">
        <button class="tab-btn comm-tab active" data-tab="offer" onclick="setCommunityTab('offer')">
          👩‍⚕️ <span data-i18n="community.caregiverOffer">간병인 해요</span>
        </button>
        <button class="tab-btn comm-tab" data-tab="request" onclick="setCommunityTab('request')">
          🔍 <span data-i18n="community.caregiverRequest">간병인 찾아요</span>
        </button>
        <button class="tab-btn comm-tab" data-tab="market" onclick="setCommunityTab('market')">
          🛒 <span data-i18n="community.market">중고마켓</span>
        </button>
      </div>
      <button class="btn btn-secondary" onclick="openWriteModal()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <span data-i18n="community.write">글쓰기</span>
      </button>
    </div>

    <!-- Posts Grid -->
    <div id="posts-grid" class="grid-auto" style="margin-top:20px"></div>
  </div>
</div><!-- /community -->

</main>


<!-- ═══════════════════════════════════════════════
     CHAT WIDGET (좌하단)
════════════════════════════════════════════════ -->
<div class="chat-widget">
  <button class="chat-trigger" onclick="toggleChat()" id="chat-trigger-btn">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    <span data-i18n="chat.adminChat">상담</span>
  </button>

  <div class="chat-panel" id="chat-panel">
    <!-- Header -->
    <div class="chat-header">
      <div class="chat-header-avatar">CT</div>
      <div class="chat-header-info">
        <div class="chat-header-name" data-i18n="chat.adminName">CareTalk 상담사</div>
        <div class="chat-header-status">
          <div class="status-dot"></div>
          <span data-i18n="chat.online">온라인</span>
        </div>
      </div>
      <div class="chat-header-actions">
        <button class="chat-action-btn" onclick="chatVoiceCall()" title="음성통화">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1 19.79 19.79 0 0 1 1.61 4.5 2 2 0 0 1 3.59 2.3h3a2 2 0 0 1 2 1.72c.13.96.36 1.91.71 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.9.35 1.85.58 2.81.71a2 2 0 0 1 1.72 2.02z"/></svg>
        </button>
        <button class="chat-action-btn" onclick="chatVideoCall()" title="영상통화">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
        </button>
        <button class="chat-action-btn" onclick="toggleChat()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>

    <!-- Messages -->
    <div class="chat-messages" id="chat-messages"></div>

    <!-- Toolbar -->
    <div class="chat-toolbar">
      <button class="chat-tool-btn" onclick="chatSendPhoto()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
        <span data-i18n="chat.sendPhoto">사진</span>
      </button>
      <button class="chat-tool-btn" onclick="chatVoiceRecord()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
        <span data-i18n="chat.record30">30초 녹음</span>
      </button>
      <button class="chat-tool-btn" onclick="toggleAutoTranslate()" id="auto-translate-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        <span data-i18n="chat.autoTranslate">자동번역</span>
      </button>
    </div>

    <!-- Input -->
    <div class="chat-input-area">
      <textarea class="chat-input" id="chat-input" data-i18n-placeholder="chat.placeholder" placeholder="메시지를 입력하세요"
        onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendChatMsg()}"
        oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,100)+'px'"></textarea>
      <button class="chat-send-btn" onclick="sendChatMsg()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </div>
  </div>
</div>


<!-- ═══════════════════════════════════════════════
     FAQ ROBOT WIDGET (우하단)
════════════════════════════════════════════════ -->
<div class="faq-widget">
  <button class="faq-trigger" onclick="toggleFAQ()">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h.01M15 9h.01M9 15h6"/><circle cx="12" cy="12" r="1"/></svg>
    FAQ
  </button>

  <div class="faq-panel" id="faq-panel">
    <div class="faq-panel-header">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.75"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h.01M15 9h.01M9 15h6"/></svg>
      <div>
        <div class="faq-panel-title" data-i18n="faq.title">자주 묻는 질문</div>
        <div class="faq-panel-sub" data-i18n="faq.subtitle">궁금한 점을 확인하세요</div>
      </div>
      <button class="faq-close-btn" onclick="toggleFAQ()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="faq-list" id="faq-list"></div>
  </div>
</div>


<!-- ═══════════════════════════════════════════════
     MODALS
════════════════════════════════════════════════ -->

<!-- Post Detail Modal -->
<div class="modal-overlay" id="post-detail-modal" onclick="if(event.target===this)closeModal('post-detail-modal')">
  <div class="modal">
    <div class="modal-header">
      <h3>게시물 상세</h3>
      <button class="modal-close" onclick="closeModal('post-detail-modal')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="modal-body" id="post-detail-body"></div>
  </div>
</div>

<!-- Write Post Modal -->
<div class="modal-overlay" id="write-modal" onclick="if(event.target===this)closeModal('write-modal')">
  <div class="modal">
    <div class="modal-header">
      <h3 data-i18n="community.write">글쓰기</h3>
      <button class="modal-close" onclick="closeModal('write-modal')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="write-post-id" value="">

      <div class="form-group">
        <label class="form-label">카테고리</label>
        <select id="write-post-type" class="form-control" onchange="updateWriteForm(this.value)">
          <option value="offer" data-i18n="community.caregiverOffer">간병인 해요</option>
          <option value="request" data-i18n="community.caregiverRequest">간병인 찾아요</option>
          <option value="market" data-i18n="community.market">중고마켓</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label" data-i18n="form.title">제목</label>
        <input type="text" id="write-title" class="form-control" data-i18n-placeholder="form.placeholder.title" placeholder="제목을 입력하세요">
      </div>

      <div class="form-group">
        <label class="form-label" data-i18n="form.content">내용</label>
        <textarea id="write-content" class="form-control" rows="4" data-i18n-placeholder="form.placeholder.content" placeholder="내용을 입력하세요"></textarea>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group">
          <label class="form-label" data-i18n="form.contact">연락처</label>
          <input type="tel" id="write-contact" class="form-control" placeholder="010-0000-0000">
        </div>
        <div class="form-group">
          <label class="form-label" data-i18n="form.region">지역</label>
          <input type="text" id="write-region" class="form-control" data-i18n-placeholder="form.placeholder.region" placeholder="지역 입력">
        </div>
      </div>

      <!-- 간병인 해요 전용 필드 -->
      <div id="offer-fields">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group">
            <label class="form-label" data-i18n="form.pay">요구 페이</label>
            <input type="text" id="write-pay" class="form-control" placeholder="예: 150만원/월">
          </div>
          <div class="form-group">
            <label class="form-label" data-i18n="form.certificate">자격증</label>
            <select id="write-cert" class="form-control">
              <option value="요양보호사 1급">요양보호사 1급</option>
              <option value="요양보호사 2급">요양보호사 2급</option>
              <option value="간호조무사">간호조무사</option>
              <option value="없음">없음</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" data-i18n="form.availableLang">가능 언어</label>
            <input type="text" id="write-lang" class="form-control" placeholder="예: 한국어, 영어">
          </div>
          <div class="form-group">
            <label class="form-label" data-i18n="form.nightShift">주야간</label>
            <select id="write-night" class="form-control">
              <option value="가능">가능</option>
              <option value="주간만">주간만</option>
              <option value="야간만">야간만</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" data-i18n="form.stayInCare">입주 간병</label>
            <select id="write-stay" class="form-control">
              <option value="가능">가능</option>
              <option value="불가">불가</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" data-i18n="form.condition">근무조건</label>
            <input type="text" id="write-condition" class="form-control" placeholder="예: 주 5일">
          </div>
        </div>
      </div>

      <!-- 간병인 찾아요 전용 필드 -->
      <div id="request-fields" class="hidden">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group">
            <label class="form-label" data-i18n="form.patientCondition">환자 상태</label>
            <input type="text" id="write-patient-cond" class="form-control" placeholder="예: 뇌졸중 후유증">
          </div>
          <div class="form-group">
            <label class="form-label" data-i18n="form.hopePay">희망 페이</label>
            <input type="text" id="write-hopepay" class="form-control" placeholder="예: 120만원">
          </div>
        </div>
      </div>

      <!-- 중고마켓 전용 필드 -->
      <div id="market-fields" class="hidden">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group">
            <label class="form-label" data-i18n="form.price">가격</label>
            <input type="text" id="write-price" class="form-control" placeholder="예: 5만원">
          </div>
          <div class="form-group">
            <label class="form-label" data-i18n="form.tradeType">거래 방식</label>
            <select id="write-trade" class="form-control">
              <option value="직거래">직거래</option>
              <option value="택배">택배</option>
              <option value="직거래/택배">직거래/택배</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 사진 업로드 -->
      <div class="form-group">
        <label class="form-label" data-i18n="form.photo">사진 업로드</label>
        <label class="btn btn-outline btn-sm" style="cursor:pointer;display:inline-flex">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          사진 선택
          <input type="file" accept="image/*" style="display:none" onchange="previewWritePhoto(this)">
        </label>
        <img id="write-photo-preview" src="" style="display:none;width:80px;height:80px;object-fit:cover;border-radius:8px;margin-left:10px;vertical-align:middle">
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('write-modal')" data-i18n="buttons.cancel">취소</button>
      <button class="btn btn-secondary" onclick="submitPost()" data-i18n="form.submit">등록하기</button>
    </div>
  </div>
</div>

<!-- Toast Container -->
<div id="toast-container" class="toast-container"></div>

<script>
// 사진 미리보기
function previewWritePhoto(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const prev = document.getElementById('write-photo-preview');
    if (prev) { prev.src = e.target.result; prev.style.display = 'inline-block'; }
  };
  reader.readAsDataURL(file);
}

function openWriteModal() {
  const type = document.querySelector('.comm-tab.active')?.dataset.tab || 'offer';
  document.getElementById('write-post-type').value = type;
  updateWriteForm(type);
  document.getElementById('write-post-id').value = '';
  document.getElementById('write-title').value = '';
  document.getElementById('write-content').value = '';
  document.getElementById('write-contact').value = '';
  document.getElementById('write-region').value = '';
  openModal('write-modal');
}

// Home posts preview init
function initHomePostsPreview() {
  const container = document.getElementById('home-posts-preview');
  if (!container) return;
  const allPosts = typeof posts !== 'undefined' ? posts.slice(0, 3) : [];
  if (!allPosts.length) return;
  container.innerHTML = allPosts.map(p => {
    const emoji = p.type === 'offer' ? '👩‍⚕️' : p.type === 'request' ? '🔍' : '🛒';
    const typeLabel = p.type === 'offer' ? '간병인 해요' : p.type === 'request' ? '간병인 찾아요' : '중고마켓';
    const color = p.type === 'offer' ? 'var(--secondary)' : p.type === 'request' ? 'var(--accent)' : 'var(--warning)';
    return \`
    <div class="card" style="cursor:pointer" onclick="showPage('community');setTimeout(()=>{setCommunityTab('\${p.type}');openPostDetail(\${p.id})},100)">
      <div style="height:100px;background:var(--bg-secondary);display:flex;align-items:center;justify-content:center;font-size:2.5rem;border-radius:14px 14px 0 0">\${emoji}</div>
      <div class="card-body">
        <span style="font-size:0.7rem;font-weight:700;color:\${color};background:rgba(20,184,166,0.1);padding:2px 8px;border-radius:99px">\${typeLabel}</span>
        <div style="font-size:0.9rem;font-weight:700;margin:6px 0 4px;color:var(--text)">\${p.title}</div>
        <div style="font-size:0.78rem;color:var(--text-muted)">📍 \${p.region||'-'}</div>
      </div>
    </div>\`;
  }).join('');
}

// OCR section toggle
const origAnalyze = window.analyzeOcr;
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initHomePostsPreview();
    // OCR result / placeholder toggle
    const resultSection = document.getElementById('ocr-result-section');
    const placeholder = document.getElementById('ocr-placeholder');
    if (resultSection && placeholder) {
      const obs = new MutationObserver(() => {
        const isHidden = resultSection.classList.contains('hidden');
        if (placeholder) placeholder.style.display = isHidden ? 'flex' : 'none';
      });
      obs.observe(resultSection, { attributes: true, attributeFilter: ['class'] });
    }
  }, 500);
});
</script>
<script src="/static/app.js"></script>
</body>
</html>
`

app.get('/', (c) => c.html(INDEX_HTML))

// ── Health Check ────────────────────────────────
app.get('/health', (c) => c.json({ status: 'ok', service: 'CareTalk', version: '1.0.0' }))

// ── API: 번역 프록시 (CORS 우회용) ───────────────
app.get('/api/translate', async (c) => {
  const text = c.req.query('q') || ''
  const from = c.req.query('from') || 'en'
  const to   = c.req.query('to')   || 'ko'
  if (!text) return c.json({ error: 'q is required' }, 400)
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
    const res  = await fetch(url)
    const data = await res.json() as { responseData: { translatedText: string } }
    return c.json({ result: data?.responseData?.translatedText || text })
  } catch {
    return c.json({ result: text, error: 'translation failed' }, 200)
  }
})

// ── API: 커뮤니티 게시물 (메모리 캐시) ───────────
const memPosts: Record<string, unknown>[] = []

app.get('/api/posts', (c) => {
  const type     = c.req.query('type')
  const filtered = type ? memPosts.filter(p => p.type === type) : memPosts
  return c.json({ posts: filtered })
})

app.post('/api/posts', async (c) => {
  const body = await c.req.json() as Record<string, unknown>
  const post = { ...body, id: Date.now(), createdAt: new Date().toISOString() }
  memPosts.unshift(post)
  return c.json({ success: true, post })
})

app.delete('/api/posts/:id', (c) => {
  const id  = Number(c.req.param('id'))
  const idx = memPosts.findIndex(p => p.id === id)
  if (idx >= 0) memPosts.splice(idx, 1)
  return c.json({ success: true })
})

export default app
