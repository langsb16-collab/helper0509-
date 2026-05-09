import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import { cors } from 'hono/cors'

const app = new Hono()

app.use('*', cors())

// ── 정적 파일 서빙 ──────────────────────────────
app.use('/static/*', serveStatic({ root: './' }))

// ── i18n locale JSON ────────────────────────────
app.get('/static/locales/:lang', async (c) => {
  const lang = c.req.param('lang').replace(/\.json$/, '')
  const allowed = ['ko','en','zh','ja','fr','de','ru','vi','hi','pt-BR','id','ar','af','es','pl','th','uz','tr','mn']
  if (!allowed.includes(lang)) return c.json({ error: 'not found' }, 404)
  // Cloudflare Pages 환경에서는 public/static/locales/ 에서 파일을 읽습니다
  return c.redirect(`/static/locales/${lang}.json`, 302)
})

// ── 메인 HTML ────────────────────────────────────
app.get('/', (c) => {
  return c.html(/* html */`<!DOCTYPE html>
<html><head><meta http-equiv="refresh" content="0;url=/index.html"></head></html>`)
})

// ── Health Check ────────────────────────────────
app.get('/health', (c) => c.json({ status: 'ok', service: 'CareTalk', version: '1.0.0' }))

// ── API: 번역 프록시 (CORS 우회용) ───────────────
app.get('/api/translate', async (c) => {
  const text = c.req.query('q') || ''
  const from = c.req.query('from') || 'en'
  const to = c.req.query('to') || 'ko'
  if (!text) return c.json({ error: 'q is required' }, 400)
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
    const res = await fetch(url)
    const data = await res.json() as { responseData: { translatedText: string } }
    return c.json({ result: data?.responseData?.translatedText || text })
  } catch {
    return c.json({ result: text, error: 'translation failed' }, 200)
  }
})

// ── API: 커뮤니티 게시물 (Workers KV 없을 경우 메모리) ──
const memPosts: Record<string, unknown>[] = []

app.get('/api/posts', (c) => {
  const type = c.req.query('type')
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
  const id = Number(c.req.param('id'))
  const idx = memPosts.findIndex(p => p.id === id)
  if (idx >= 0) memPosts.splice(idx, 1)
  return c.json({ success: true })
})

export default app
