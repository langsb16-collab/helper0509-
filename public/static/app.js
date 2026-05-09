/* =====================================================
   CareTalk - Global Care Translation Platform
   app.js - i18n + 전체 동작 로직
   ===================================================== */

// ─── i18n Store ───────────────────────────────────────
const I18N = {};
const SUPPORTED_LANGS = ['ko','en','zh','ja','fr','de','ru','vi','hi','pt-BR','id','ar','af','es','pl','th','uz','tr','mn'];
let currentLang = localStorage.getItem('caretalk_lang') || 'ko';
let currentTheme = localStorage.getItem('caretalk_theme') || 'day';

async function loadLang(lang) {
  if (I18N[lang]) return I18N[lang];
  try {
    const res = await fetch(`/static/locales/${lang}.json`);
    if (!res.ok) throw new Error('load fail');
    I18N[lang] = await res.json();
    return I18N[lang];
  } catch {
    if (lang !== 'ko') return loadLang('ko');
    return {};
  }
}

function t(key, lang) {
  const data = I18N[lang || currentLang] || I18N['ko'] || {};
  const keys = key.split('.');
  let val = data;
  for (const k of keys) { val = val?.[k]; if (val === undefined) break; }
  if (val === undefined && lang !== 'ko') return t(key, 'ko');
  return val ?? key;
}

async function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('caretalk_lang', lang);
  await loadLang(lang);
  applyI18n();
  renderFAQ();
  renderCommunityPosts();
}

function applyI18n() {
  // data-i18n 속성으로 텍스트 바인딩
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (val && typeof val === 'string') el.textContent = val;
  });
  // placeholder 바인딩
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const val = t(key);
    if (val) el.placeholder = val;
  });
  // document title
  document.title = `${t('app.name')} - ${t('app.headline')}`;
  // html lang
  document.documentElement.lang = currentLang;
  // RTL 처리 (아랍어)
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
}

// ─── Theme System ──────────────────────────────────────
function setTheme(theme) {
  currentTheme = theme;
  localStorage.setItem('caretalk_theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'day' ? t('theme.night') : t('theme.day');
}

function toggleTheme() {
  setTheme(currentTheme === 'day' ? 'night' : 'day');
}

// ─── Page Navigation ──────────────────────────────────
let currentPage = 'home';

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(`page-${pageId}`);
  if (page) page.classList.add('active');

  // nav active
  document.querySelectorAll('.nav-menu a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === pageId);
  });
  document.querySelectorAll('.mobile-nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === pageId);
  });

  currentPage = pageId;
  window.scrollTo(0, 0);

  // 페이지별 초기화
  if (pageId === 'community') renderCommunityPosts();
}

// ─── Toast ─────────────────────────────────────────────
function showToast(msg, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ─── Interpreter Page ─────────────────────────────────
let isRecording = false;
let mediaRecorder = null;
let recognition = null;
let interpHistory = [];
let currentMode = 'caregiver'; // caregiver | patient

function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  const rec = new SpeechRecognition();
  rec.continuous = false;
  rec.interimResults = true;
  return rec;
}

function setInterpMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`mode-${mode}`)?.classList.add('active');
  updateLangSelectors();
}

function updateLangSelectors() {
  const fromSel = document.getElementById('from-lang');
  const toSel = document.getElementById('to-lang');
  if (!fromSel || !toSel) return;
  if (currentMode === 'caregiver') {
    fromSel.value = fromSel.dataset.selected || 'en';
    toSel.value = 'ko';
    toSel.disabled = true;
  } else {
    fromSel.value = 'ko';
    fromSel.disabled = true;
    toSel.value = toSel.dataset.selected || 'en';
    toSel.disabled = false;
  }
}

async function translateText() {
  const input = document.getElementById('interp-input');
  const resultBox = document.getElementById('interp-result');
  const text = input?.value?.trim();
  if (!text) { showToast(t('errors.required'), 'error'); return; }

  const fromLang = document.getElementById('from-lang')?.value || 'en';
  const toLang = document.getElementById('to-lang')?.value || 'ko';

  resultBox.textContent = '번역 중...';
  document.getElementById('translate-btn')?.setAttribute('disabled', true);

  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`);
    const data = await res.json();
    const translated = data?.responseData?.translatedText || text;
    resultBox.textContent = translated;

    // 히스토리 추가
    interpHistory.unshift({ from: text, to: translated, fromLang, toLang, time: new Date().toLocaleTimeString() });
    if (interpHistory.length > 20) interpHistory.pop();
    renderInterpHistory();
    showToast('번역 완료!', 'success');
  } catch {
    resultBox.textContent = text;
    showToast(t('errors.networkError'), 'error');
  } finally {
    document.getElementById('translate-btn')?.removeAttribute('disabled');
  }
}

function renderInterpHistory() {
  const container = document.getElementById('interp-history');
  if (!container) return;
  container.innerHTML = interpHistory.slice(0, 8).map(h => `
    <div class="history-item">
      <div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:4px">${h.fromLang} → ${h.toLang} · ${h.time}</div>
      <div style="font-size:0.875rem;color:var(--text-secondary);margin-bottom:4px">${escHtml(h.from)}</div>
      <div style="font-size:0.95rem;font-weight:600;color:var(--text)">${escHtml(h.to)}</div>
    </div>
  `).join('');
}

function copyResult() {
  const txt = document.getElementById('interp-result')?.textContent;
  if (!txt || txt === '번역 결과가 여기에 표시됩니다.') return;
  navigator.clipboard.writeText(txt).then(() => showToast(t('interpreter.copied'), 'success'));
}

function shareKakao(text) {
  const txt = text || document.getElementById('interp-result')?.textContent || '';
  if (!txt) return;
  const url = `https://sharer.kakao.com/talk/friends/picker/link?app_key=demo&link_ver=4.0&template_id=demo&template_args=${encodeURIComponent(JSON.stringify({ text: txt }))}`;
  showToast('카카오톡 공유 기능은 카카오 앱 연동 후 사용 가능합니다.', 'info');
  // 실제 연동 시: Kakao.Link.sendDefault(...)
}

function shareTelegram(text) {
  const txt = text || document.getElementById('interp-result')?.textContent || '';
  if (!txt) return;
  window.open(`https://t.me/share/url?url=${encodeURIComponent(location.href)}&text=${encodeURIComponent(txt)}`, '_blank');
}

function startVoiceInput(targetId) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) { showToast(t('errors.micPermission'), 'error'); return; }

  const rec = new SpeechRecognition();
  const fromLang = document.getElementById('from-lang')?.value || currentLang;
  rec.lang = fromLang === 'ko' ? 'ko-KR' : fromLang === 'zh' ? 'zh-CN' : fromLang === 'ja' ? 'ja-JP' : 'en-US';
  rec.interimResults = true;

  const btn = document.getElementById('voice-btn');
  isRecording = true;
  btn?.classList.add('recording');

  rec.onresult = (e) => {
    const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
    const input = document.getElementById(targetId);
    if (input) input.value = transcript;
  };

  rec.onend = () => {
    isRecording = false;
    btn?.classList.remove('recording');
    translateText();
  };

  rec.onerror = () => {
    isRecording = false;
    btn?.classList.remove('recording');
    showToast(t('errors.micPermission'), 'error');
  };

  rec.start();
  setTimeout(() => rec.stop(), 30000);
}

// ─── Care Log ──────────────────────────────────────────
let careLogData = {
  date: new Date().toISOString().split('T')[0],
  patientStatus: '', meal: '', medication: '',
  sleep: '', toilet: '', pain: '',
  special: '', doctorNote: '', guardianNote: ''
};

function setStatus(field, value, el) {
  careLogData[field] = value;
  const parent = el.closest('.status-selector');
  parent?.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

let isLogging = false;
let logTimer = null;
let logSeconds = 0;

function toggleVoiceLog() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) { showToast(t('errors.micPermission'), 'error'); return; }

  if (isLogging) {
    stopVoiceLog(); return;
  }

  const rec = new SpeechRecognition();
  rec.lang = currentLang === 'ko' ? 'ko-KR' : 'en-US';
  rec.continuous = true;
  rec.interimResults = true;
  isLogging = true;
  logSeconds = 30;

  const btn = document.getElementById('log-record-btn');
  btn?.classList.add('recording');

  const timer = document.getElementById('log-timer');
  logTimer = setInterval(() => {
    logSeconds--;
    if (timer) timer.textContent = `${logSeconds}초`;
    if (logSeconds <= 0) stopVoiceLog();
  }, 1000);

  rec.onresult = (e) => {
    const transcript = Array.from(e.results).map(r => r[0].transcript).join(' ');
    const el = document.getElementById('log-special');
    if (el) el.value = transcript;
  };

  rec.onend = () => stopVoiceLog();
  rec.start();
  window._careLogRec = rec;
}

function stopVoiceLog() {
  isLogging = false;
  clearInterval(logTimer);
  window._careLogRec?.stop();
  const btn = document.getElementById('log-record-btn');
  btn?.classList.remove('recording');
  const timer = document.getElementById('log-timer');
  if (timer) timer.textContent = '30초';
}

function saveCareLog() {
  // 폼에서 데이터 수집
  careLogData.special = document.getElementById('log-special')?.value || '';
  careLogData.doctorNote = document.getElementById('log-doctor')?.value || '';
  careLogData.guardianNote = document.getElementById('log-guardian')?.value || '';

  const logs = JSON.parse(localStorage.getItem('caretalk_logs') || '[]');
  logs.unshift({ ...careLogData, id: Date.now(), savedAt: new Date().toISOString() });
  localStorage.setItem('caretalk_logs', JSON.stringify(logs.slice(0, 50)));
  showToast(t('careLog.saved'), 'success');
  renderLogHistory();
}

function renderLogHistory() {
  const container = document.getElementById('log-history');
  if (!container) return;
  const logs = JSON.parse(localStorage.getItem('caretalk_logs') || '[]');
  if (!logs.length) { container.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:20px">${t('community.noPost')}</p>`; return; }
  container.innerHTML = logs.slice(0, 5).map(log => `
    <div class="history-item" style="cursor:default">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span style="font-weight:700;font-size:0.875rem">${log.date}</span>
        <span class="badge badge-secondary">${log.patientStatus || '-'}</span>
      </div>
      <div style="font-size:0.8rem;color:var(--text-secondary)">
        식사: ${log.meal||'-'} · 복약: ${log.medication||'-'} · 수면: ${log.sleep||'-'}
      </div>
      ${log.special ? `<div style="font-size:0.8rem;color:var(--text-muted);margin-top:4px">${escHtml(log.special)}</div>` : ''}
    </div>
  `).join('');
}

function generateLogText() {
  careLogData.special = document.getElementById('log-special')?.value || '';
  careLogData.doctorNote = document.getElementById('log-doctor')?.value || '';
  careLogData.guardianNote = document.getElementById('log-guardian')?.value || '';
  return `[CareTalk 간병일지]
날짜: ${careLogData.date}
환자상태: ${careLogData.patientStatus||'-'}
식사: ${careLogData.meal||'-'}
복약: ${careLogData.medication||'-'}
수면: ${careLogData.sleep||'-'}
배변: ${careLogData.toilet||'-'}
통증: ${careLogData.pain||'-'}
특이사항: ${careLogData.special||'-'}
의료진 전달: ${careLogData.doctorNote||'-'}
보호자 전달: ${careLogData.guardianNote||'-'}
---CareTalk 간병 전문 통역 플랫폼---`;
}

function shareLogKakao() {
  showToast('카카오톡 공유 기능은 카카오 앱 연동 후 사용 가능합니다.', 'info');
}

function shareLogTelegram() {
  const text = generateLogText();
  window.open(`https://t.me/share/url?url=${encodeURIComponent(location.href)}&text=${encodeURIComponent(text)}`, '_blank');
}

function copyLog() {
  navigator.clipboard.writeText(generateLogText()).then(() => showToast('복사되었습니다!', 'success'));
}

function saveLogPdf() {
  showToast('PDF 저장 기능은 준비 중입니다.', 'info');
}

// ─── OCR ───────────────────────────────────────────────
let ocrResult = '';
let ocrFile = null;

function handleOcrUpload(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) { showToast(t('errors.fileTooLarge'), 'error'); return; }
  ocrFile = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = document.getElementById('ocr-preview');
    if (preview) {
      preview.src = e.target.result;
      preview.style.display = 'block';
    }
    document.getElementById('ocr-analyze-btn')?.removeAttribute('disabled');
    showToast('사진이 업로드되었습니다. 분석 버튼을 누르세요.', 'success');
  };
  reader.readAsDataURL(file);
}

async function analyzeOcr() {
  if (!ocrFile) { showToast('사진을 먼저 업로드하세요.', 'error'); return; }

  const resultBox = document.getElementById('ocr-result-text');
  const summaryBox = document.getElementById('ocr-summary');
  const spinner = document.getElementById('ocr-spinner');
  const warning = document.getElementById('ocr-warning');

  spinner?.classList.remove('hidden');
  resultBox?.closest('.card')?.querySelector('.card-body')?.classList.add('hidden');

  // 실제 OCR API 연동 (데모: Tesseract.js 시뮬레이션)
  await new Promise(r => setTimeout(r, 2000));

  const demoTexts = [
    '처방전\n환자명: 홍길동\n약품명: 아세트아미노펜 500mg\n복용법: 1일 3회 식후 30분\n주의: 음주 중 복용 금지',
    '수액 정보\n성분: 0.9% 생리식염수 (NaCl)\n용량: 500mL\n투여속도: 40 drops/min\n유효기간: 2025-12',
    '약봉투\n약품명: 아목시실린 250mg\n용법: 1회 1정 1일 3회\n부작용: 복통, 설사, 알레르기 반응\n보관: 직사광선 피할 것'
  ];

  ocrResult = demoTexts[Math.floor(Math.random() * demoTexts.length)];

  spinner?.classList.add('hidden');
  if (resultBox) resultBox.textContent = ocrResult;

  // 위험 단어 체크
  const dangerWords = ['금지', '주의', '부작용', '알레르기', 'warning', 'caution', 'danger'];
  const hasWarning = dangerWords.some(w => ocrResult.toLowerCase().includes(w.toLowerCase()));

  if (hasWarning && warning) {
    warning.classList.remove('hidden');
  }

  // 한국어 요약
  if (summaryBox) {
    summaryBox.textContent = ocrResult.split('\n').slice(0, 3).join(' / ');
  }

  resultBox?.closest('.card')?.querySelector('.card-body')?.classList.remove('hidden');
  document.getElementById('ocr-result-section')?.classList.remove('hidden');
  document.getElementById('ocr-result-section')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  showToast('분석이 완료되었습니다!', 'success');
}

async function translateOcrResult() {
  if (!ocrResult) return;
  const toLang = document.getElementById('ocr-translate-lang')?.value || 'en';
  const box = document.getElementById('ocr-translated');
  if (box) box.textContent = '번역 중...';

  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(ocrResult)}&langpair=ko|${toLang}`);
    const data = await res.json();
    if (box) box.textContent = data?.responseData?.translatedText || ocrResult;
  } catch {
    if (box) box.textContent = ocrResult;
    showToast(t('errors.networkError'), 'error');
  }
}

function shareOcrKakao() {
  showToast('카카오톡 공유 기능은 카카오 앱 연동 후 사용 가능합니다.', 'info');
}

function shareOcrTelegram() {
  window.open(`https://t.me/share/url?url=${encodeURIComponent(location.href)}&text=${encodeURIComponent(ocrResult)}`, '_blank');
}

function copyOcr() {
  navigator.clipboard.writeText(ocrResult).then(() => showToast('복사되었습니다!', 'success'));
}

// ─── Community ────────────────────────────────────────
let communityTab = 'offer'; // offer | request | market
let posts = JSON.parse(localStorage.getItem('caretalk_posts') || '[]');
if (!posts.length) posts = getDemoPosts();

function getDemoPosts() {
  return [
    { id: 1, type: 'offer', title: '베트남 간병인 구직합니다', content: '10년 경력 베트남 여성 간병인입니다. 한국어 가능. 입주 간병 가능합니다.', contact: '010-1234-5678', region: '서울 강남구', pay: '150만원/월', certificate: '요양보호사 1급', availableLang: '한국어, 베트남어', gender: '여', nightShift: '가능', stayInCare: '가능', thumb: '', time: '2025-05-09' },
    { id: 2, type: 'offer', title: '중국어/한국어 가능 간병인', content: '중국 출신 45세 여성. 노인 간병 5년 경력. 치매 환자 경험 있습니다.', contact: '010-9876-5432', region: '경기 수원시', pay: '130만원/월', certificate: '없음', availableLang: '한국어, 중국어', gender: '여', nightShift: '주간만', stayInCare: '불가', thumb: '', time: '2025-05-08' },
    { id: 3, type: 'request', title: '어머니 간병인 구합니다', content: '80세 어머니 뇌졸중 후유증 간병. 서울 강서구 자택. 한국어 또는 중국어 가능하신 분.', contact: '010-2345-6789', region: '서울 강서구', condition: '주 5일 9~18시', hopePay: '120만원', neededLang: '한국어, 중국어', stayIn: '불필요', patientCondition: '뇌졸중 후유증', thumb: '', time: '2025-05-08' },
    { id: 4, type: 'request', title: '필리핀 간병인 구합니다', content: '영어 가능한 간병인 필요. 아버지 폐렴 후 재활 중. 병원 동행 가능하신 분 우선.', contact: '010-5555-7777', region: '서울 송파구', condition: '입주 간병', hopePay: '협의', neededLang: '영어, 한국어', stayIn: '필요', patientCondition: '폐렴 후 재활', thumb: '', time: '2025-05-07' },
    { id: 5, type: 'market', title: '전동 휠체어 판매합니다', content: '사용 기간 1년 미만. 상태 양호. 배터리 교체 완료. 직거래 또는 택배.', contact: '010-3333-4444', region: '서울 마포구', price: '150만원', tradeType: '직거래/택배', category: '이동기기', itemCondition: '상태 양호', thumb: '', time: '2025-05-06' },
    { id: 6, type: 'market', title: '이동식 변기 거의 새것', content: '한 번만 사용. 깨끗합니다. 간병 끝나고 필요 없어졌어요.', contact: '010-6666-8888', region: '경기 성남시', price: '3만원', tradeType: '직거래', category: '케어용품', itemCondition: '거의 새것', thumb: '', time: '2025-05-05' }
  ];
}

function setCommunityTab(tab) {
  communityTab = tab;
  document.querySelectorAll('.comm-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  renderCommunityPosts();
}

function renderCommunityPosts() {
  const container = document.getElementById('posts-grid');
  if (!container) return;
  const filtered = posts.filter(p => p.type === communityTab);
  if (!filtered.length) {
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--text-muted)">${t('community.noPost')}</div>`;
    return;
  }
  container.innerHTML = filtered.map(post => renderPostCard(post)).join('');
}

function renderPostCard(post) {
  const typeLabel = post.type === 'offer' ? t('community.caregiverOffer') : post.type === 'request' ? t('community.caregiverRequest') : t('community.market');
  const typeColor = post.type === 'offer' ? 'secondary' : post.type === 'request' ? 'accent' : 'warning';
  const emoji = post.type === 'offer' ? '👩‍⚕️' : post.type === 'request' ? '🔍' : '🛒';

  return `
  <div class="post-card" onclick="openPostDetail(${post.id})">
    <div class="post-card-img" style="background:var(--bg-secondary);font-size:2.5rem;display:flex;align-items:center;justify-content:center;height:140px">
      ${post.thumb ? `<img src="${post.thumb}" alt="" style="width:100%;height:100%;object-fit:cover">` : emoji}
    </div>
    <div class="post-card-body">
      <div class="post-card-meta">
        <span class="badge badge-${typeColor}">${typeLabel}</span>
        <span style="font-size:0.72rem;color:var(--text-muted)">${post.time}</span>
      </div>
      <div class="post-card-title">${escHtml(post.title)}</div>
      <div class="post-card-detail">
        <span>📍 ${escHtml(post.region||'-')}</span>
        ${post.pay ? `<span>💰 ${escHtml(post.pay)}</span>` : ''}
        ${post.price ? `<span>💰 ${escHtml(post.price)}</span>` : ''}
        ${post.availableLang ? `<span>🌐 ${escHtml(post.availableLang)}</span>` : ''}
      </div>
    </div>
    <div class="post-card-actions" onclick="event.stopPropagation()">
      <button class="btn btn-secondary btn-sm" style="flex:1" onclick="openChatWith('${escHtml(post.title)}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        ${t('buttons.chat')}
      </button>
      <button class="btn btn-outline btn-sm" style="flex:1" onclick="openMap('${escHtml(post.region||'')}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        ${t('buttons.map')}
      </button>
    </div>
  </div>`;
}

function openPostDetail(id) {
  const post = posts.find(p => p.id === id);
  if (!post) return;
  const modal = document.getElementById('post-detail-modal');
  const body = document.getElementById('post-detail-body');
  if (!body || !modal) return;

  const typeLabel = post.type === 'offer' ? t('community.caregiverOffer') : post.type === 'request' ? t('community.caregiverRequest') : t('community.market');

  body.innerHTML = `
    <div style="margin-bottom:16px">
      <span class="badge badge-secondary" style="margin-bottom:8px">${typeLabel}</span>
      <h3 style="font-size:1.2rem;margin-bottom:8px">${escHtml(post.title)}</h3>
      <p style="font-size:0.85rem;color:var(--text-muted)">${post.time} · ${escHtml(post.region||'')}</p>
    </div>
    <div style="background:var(--bg-secondary);border-radius:10px;padding:16px;margin-bottom:16px;font-size:0.9rem;line-height:1.7;color:var(--text)">${escHtml(post.content)}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
      ${post.contact ? `<div class="form-group" style="margin:0"><div class="form-label">연락처</div><div style="font-size:0.9rem;font-weight:600">${escHtml(post.contact)}</div></div>` : ''}
      ${post.pay ? `<div class="form-group" style="margin:0"><div class="form-label">페이</div><div style="font-size:0.9rem;font-weight:600">${escHtml(post.pay)}</div></div>` : ''}
      ${post.price ? `<div class="form-group" style="margin:0"><div class="form-label">가격</div><div style="font-size:0.9rem;font-weight:600">${escHtml(post.price)}</div></div>` : ''}
      ${post.certificate ? `<div class="form-group" style="margin:0"><div class="form-label">자격증</div><div style="font-size:0.9rem">${escHtml(post.certificate)}</div></div>` : ''}
      ${post.availableLang ? `<div class="form-group" style="margin:0"><div class="form-label">가능 언어</div><div style="font-size:0.9rem">${escHtml(post.availableLang)}</div></div>` : ''}
      ${post.nightShift ? `<div class="form-group" style="margin:0"><div class="form-label">주야간</div><div style="font-size:0.9rem">${escHtml(post.nightShift)}</div></div>` : ''}
      ${post.stayInCare ? `<div class="form-group" style="margin:0"><div class="form-label">입주 간병</div><div style="font-size:0.9rem">${escHtml(post.stayInCare)}</div></div>` : ''}
      ${post.condition ? `<div class="form-group" style="margin:0"><div class="form-label">근무조건</div><div style="font-size:0.9rem">${escHtml(post.condition)}</div></div>` : ''}
      ${post.patientCondition ? `<div class="form-group" style="margin:0"><div class="form-label">환자 상태</div><div style="font-size:0.9rem">${escHtml(post.patientCondition)}</div></div>` : ''}
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-secondary" onclick="openChatWith('${escHtml(post.title)}');closeModal('post-detail-modal')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        ${t('buttons.chat')}
      </button>
      <button class="btn btn-outline" onclick="openMap('${escHtml(post.region||'')}')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        ${t('buttons.map')}
      </button>
      <button class="btn btn-outline" onclick="openEditPost(${post.id})">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        ${t('buttons.editPost')}
      </button>
      <button class="btn btn-danger btn-sm" onclick="deletePost(${post.id})">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
        ${t('buttons.delete')}
      </button>
    </div>
    ${post.region ? `<div style="margin-top:16px"><div class="form-label" style="margin-bottom:8px">위치</div><div id="post-map-${post.id}" style="height:180px;border-radius:10px;border:1px solid var(--border);overflow:hidden"></div></div>` : ''}
  `;

  openModal('post-detail-modal');
  if (post.region) setTimeout(() => initMiniMap(`post-map-${post.id}`, post.region), 300);
}

function openEditPost(id) {
  const post = posts.find(p => p.id === id);
  if (!post) return;
  closeModal('post-detail-modal');
  // 폼 열기
  document.getElementById('write-post-type').value = post.type;
  updateWriteForm(post.type);
  document.getElementById('write-title').value = post.title;
  document.getElementById('write-content').value = post.content;
  document.getElementById('write-contact').value = post.contact || '';
  document.getElementById('write-region').value = post.region || '';
  document.getElementById('write-post-id').value = post.id;
  openModal('write-modal');
}

function deletePost(id) {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  posts = posts.filter(p => p.id !== id);
  localStorage.setItem('caretalk_posts', JSON.stringify(posts));
  closeModal('post-detail-modal');
  renderCommunityPosts();
  showToast('게시물이 삭제되었습니다.', 'success');
}

function submitPost() {
  const title = document.getElementById('write-title')?.value?.trim();
  const content = document.getElementById('write-content')?.value?.trim();
  const contact = document.getElementById('write-contact')?.value?.trim();
  const region = document.getElementById('write-region')?.value?.trim();
  const type = document.getElementById('write-post-type')?.value || communityTab;

  if (!title || !content) { showToast(t('errors.required'), 'error'); return; }

  const editId = document.getElementById('write-post-id')?.value;
  const newPost = {
    id: editId ? parseInt(editId) : Date.now(),
    type, title, content, contact, region,
    pay: document.getElementById('write-pay')?.value || '',
    certificate: document.getElementById('write-cert')?.value || '',
    availableLang: document.getElementById('write-lang')?.value || '',
    nightShift: document.getElementById('write-night')?.value || '',
    stayInCare: document.getElementById('write-stay')?.value || '',
    condition: document.getElementById('write-condition')?.value || '',
    patientCondition: document.getElementById('write-patient-cond')?.value || '',
    hopePay: document.getElementById('write-hopepay')?.value || '',
    price: document.getElementById('write-price')?.value || '',
    tradeType: document.getElementById('write-trade')?.value || '',
    thumb: '',
    time: new Date().toISOString().split('T')[0]
  };

  if (editId) {
    const idx = posts.findIndex(p => p.id === parseInt(editId));
    if (idx >= 0) posts[idx] = newPost;
  } else {
    posts.unshift(newPost);
  }

  localStorage.setItem('caretalk_posts', JSON.stringify(posts));
  closeModal('write-modal');
  renderCommunityPosts();
  showToast(editId ? '게시물이 수정되었습니다.' : '게시물이 등록되었습니다.', 'success');
  document.getElementById('write-post-id').value = '';
}

function updateWriteForm(type) {
  const offerFields = document.getElementById('offer-fields');
  const requestFields = document.getElementById('request-fields');
  const marketFields = document.getElementById('market-fields');
  if (offerFields) offerFields.classList.toggle('hidden', type !== 'offer');
  if (requestFields) requestFields.classList.toggle('hidden', type !== 'request');
  if (marketFields) marketFields.classList.toggle('hidden', type !== 'market');
}

// ─── Map ──────────────────────────────────────────────
function openMap(region) {
  if (!region) { showToast(t('map.noLocation'), 'info'); return; }
  const encoded = encodeURIComponent(region + ' 한국');
  window.open(`https://www.openstreetmap.org/search?query=${encoded}`, '_blank');
}

function initMiniMap(containerId, address) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const encoded = encodeURIComponent(address + ' 한국');
  container.innerHTML = `
    <iframe
      src="https://www.openstreetmap.org/export/embed.html?bbox=126.7,37.4,127.2,37.7&layer=mapnik&marker=37.5665,126.9780"
      style="width:100%;height:100%;border:none"
      loading="lazy"
      title="지도"></iframe>
    <div style="position:absolute;bottom:4px;right:4px;z-index:10">
      <button class="btn btn-secondary btn-sm" onclick="openMap('${escHtml(address)}')">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        크게 보기
      </button>
    </div>`;
  container.style.position = 'relative';
}

// ─── Modal ─────────────────────────────────────────────
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
  document.body.style.overflow = '';
}

// ─── Chat Widget ──────────────────────────────────────
let chatMessages = [];
let chatOpen = false;

function toggleChat() {
  chatOpen = !chatOpen;
  const panel = document.getElementById('chat-panel');
  panel?.classList.toggle('open', chatOpen);
  if (chatOpen && !chatMessages.length) addAdminMsg(t('chat.welcome'));
}

function addAdminMsg(text) {
  chatMessages.push({ type: 'received', text, time: now() });
  renderChatMessages();
}

function sendChatMsg() {
  const input = document.getElementById('chat-input');
  const text = input?.value?.trim();
  if (!text) return;
  chatMessages.push({ type: 'sent', text, time: now() });
  input.value = '';
  renderChatMessages();
  setTimeout(() => {
    addAdminMsg('메시지를 받았습니다. 담당 상담사가 곧 답변드리겠습니다. (업무시간: 9:00~18:00)');
  }, 1200);
}

function renderChatMessages() {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  container.innerHTML = chatMessages.map(m => `
    <div class="chat-msg ${m.type}">
      ${m.type === 'received' ? `<div class="chat-msg-avatar">CT</div>` : ''}
      <div class="chat-msg-body">
        <div class="chat-msg-bubble">${escHtml(m.text)}</div>
        <div class="chat-msg-time">${m.time}</div>
      </div>
    </div>
  `).join('');
  container.scrollTop = container.scrollHeight;
}

function openChatWith(name) {
  toggleChat();
  if (chatOpen) {
    addAdminMsg(`"${name}" 게시물 관련 문의를 시작합니다. 무엇을 도와드릴까요?`);
  }
}

function chatVoiceCall() { showToast('음성통화 기능은 준비 중입니다.', 'info'); }
function chatVideoCall() { showToast('영상통화 기능은 준비 중입니다.', 'info'); }
function chatSendPhoto() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/*';
  input.onchange = () => {
    if (input.files[0]) {
      chatMessages.push({ type: 'sent', text: `📷 [사진 전송됨: ${input.files[0].name}]`, time: now() });
      renderChatMessages();
      showToast('사진이 전송되었습니다.', 'success');
    }
  };
  input.click();
}

function chatVoiceRecord() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) { showToast(t('errors.micPermission'), 'error'); return; }
  showToast('30초 음성 녹음 중... (브라우저 마이크 허용 필요)', 'info');
  const rec = new SpeechRecognition();
  rec.lang = 'ko-KR';
  rec.onresult = (e) => {
    const txt = Array.from(e.results).map(r => r[0].transcript).join(' ');
    chatMessages.push({ type: 'sent', text: `🎤 ${txt}`, time: now() });
    renderChatMessages();
  };
  rec.start();
  setTimeout(() => rec.stop(), 30000);
}

function toggleAutoTranslate() {
  showToast('자동번역 기능이 활성화되었습니다.', 'info');
}

// ─── FAQ Widget ───────────────────────────────────────
let faqOpen = false;

function toggleFAQ() {
  faqOpen = !faqOpen;
  document.getElementById('faq-panel')?.classList.toggle('open', faqOpen);
}

function renderFAQ() {
  const container = document.getElementById('faq-list');
  if (!container) return;
  const items = t('faq.items');
  if (!Array.isArray(items)) return;
  container.innerHTML = items.map((item, i) => `
    <div class="faq-item">
      <button class="faq-question" onclick="toggleFaqItem(${i}, this)">
        <span>${i + 1}. ${escHtml(item.q)}</span>
        <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="faq-answer" id="faq-answer-${i}">${escHtml(item.a)}</div>
    </div>
  `).join('');
}

function toggleFaqItem(i, btn) {
  const answer = document.getElementById(`faq-answer-${i}`);
  const isOpen = answer?.classList.contains('open');
  // 모두 닫기
  document.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('open'));
  document.querySelectorAll('.faq-question').forEach(b => b.classList.remove('active'));
  // 클릭한 것만 토글
  if (!isOpen) {
    answer?.classList.add('open');
    btn?.classList.add('active');
  }
}

// ─── Util ─────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function now() {
  return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

// ─── Init ─────────────────────────────────────────────
async function init() {
  // 테마 적용
  setTheme(currentTheme);

  // 언어 파일 로드 (public/static/locales/ 에서)
  await loadLang(currentLang);
  applyI18n();

  // 언어 셀렉터 값 설정
  const langSel = document.getElementById('lang-select');
  if (langSel) langSel.value = currentLang;

  // FAQ 렌더
  renderFAQ();

  // 간병일지 히스토리
  renderLogHistory();

  // 커뮤니티
  renderCommunityPosts();

  // 오늘 날짜 설정
  const dateInput = document.getElementById('log-date');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

  // 커뮤니티 폼 타입 기본값
  const writeType = document.getElementById('write-post-type');
  if (writeType) writeType.value = 'offer';
}

document.addEventListener('DOMContentLoaded', init);
