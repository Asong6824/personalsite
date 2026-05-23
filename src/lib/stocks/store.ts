import fs from 'fs'
import path from 'path'

const ROOT = process.cwd()
const BASE_DIR = path.join(ROOT, 'src', 'data', 'stocks')

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

export function buildStorageKey({ source, symbols, range }) {
  const s = (source || 'alpha').toLowerCase()
  const syms = Array.isArray(symbols) ? symbols.join('-') : String(symbols || '')
  const start = range?.start || ''
  const end = range?.end || ''
  const rid = range?.id || 'default'
  return [s, syms, start, end, rid].map(v => encodeURIComponent(v)).join('__')
}

function filePathByKey(key) {
  ensureDir(BASE_DIR)
  return path.join(BASE_DIR, `${key}.json`)
}

export function saveStoredPayload(key, payload) {
  const fp = filePathByKey(key)
  const data = JSON.stringify({
    savedAt: new Date().toISOString(),
    payload
  }, null, 2)
  fs.writeFileSync(fp, data)
}

export function loadStoredPayload(key) {
  const fp = filePathByKey(key)
  if (!fs.existsSync(fp)) return null
  try {
    const json = JSON.parse(fs.readFileSync(fp, 'utf-8'))
    return json?.payload || null
  } catch {
    return null
  }
}

export function hasStoredPayload(key) {
  const fp = filePathByKey(key)
  return fs.existsSync(fp)
}