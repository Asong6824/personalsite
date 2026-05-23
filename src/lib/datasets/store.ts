import fs from 'fs'
import path from 'path'

const ROOT = process.cwd()
const BASE_DIR = path.join(ROOT, 'src', 'data', 'datasets')
const INDEX_FP = path.join(BASE_DIR, 'index.json')

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function datasetFilePath(id) {
  ensureDir(BASE_DIR)
  return path.join(BASE_DIR, `${id}.json`)
}

function readIndex() {
  ensureDir(BASE_DIR)
  if (!fs.existsSync(INDEX_FP)) return { metas: [], updatedAt: new Date().toISOString() }
  try {
    return JSON.parse(fs.readFileSync(INDEX_FP, 'utf-8'))
  } catch {
    return { metas: [], updatedAt: new Date().toISOString() }
  }
}

function writeIndex(index) {
  ensureDir(BASE_DIR)
  const data = JSON.stringify({ ...index, updatedAt: new Date().toISOString() }, null, 2)
  fs.writeFileSync(INDEX_FP, data)
}

function pickMeta(dataset) {
  const { id, type, name, tags, createdAt, updatedAt, version } = dataset || {}
  return { id, type, name, tags: Array.isArray(tags) ? tags : [], createdAt, updatedAt, version }
}

export function saveDataset(dataset) {
  if (!dataset || !dataset.id || !dataset.type) throw new Error('Invalid dataset: missing id/type')
  const now = new Date().toISOString()
  const existing = loadDataset(dataset.id)
  const createdAt = existing?.createdAt || dataset.createdAt || now
  const updatedAt = now
  const final = { ...dataset, createdAt, updatedAt }
  const fp = datasetFilePath(dataset.id)
  fs.writeFileSync(fp, JSON.stringify(final, null, 2))
  const index = readIndex()
  const metas = index.metas.filter(m => m.id !== dataset.id)
  metas.push(pickMeta(final))
  writeIndex({ metas })
  return final
}

export function loadDataset(id) {
  const fp = datasetFilePath(id)
  if (!fs.existsSync(fp)) return null
  try {
    return JSON.parse(fs.readFileSync(fp, 'utf-8'))
  } catch {
    return null
  }
}

export function listDatasetMetas({ type, tag, q }: any = {}) {
  const index = readIndex()
  let metas = index.metas.slice()
  if (type) metas = metas.filter(m => (m.type || '').toLowerCase() === String(type).toLowerCase())
  if (tag) metas = metas.filter(m => Array.isArray(m.tags) && m.tags.map(t => String(t).toLowerCase()).includes(String(tag).toLowerCase()))
  if (q) {
    const qq = String(q).toLowerCase()
    metas = metas.filter(m => String(m.name || m.id || '').toLowerCase().includes(qq))
  }
  metas.sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))
  return metas
}

export function appendSeriesPoints(id, key, points = []) {
  const ds = loadDataset(id)
  if (!ds) throw new Error('Dataset not found')
  if (ds.type !== 'timeseries') throw new Error('Only timeseries dataset supports append')
  const ks = String(key)
  const seriesIdx = Array.isArray(ds.series) ? ds.series.findIndex(s => s.key === ks) : -1
  if (seriesIdx < 0) ds.series = [...(ds.series || []), { key: ks, points: [] }]
  const s = ds.series.find(x => x.key === ks)
  const incoming = (points || []).map(p => ({ t: p.t || p.timestamp, v: typeof p.v === 'number' ? p.v : p.price }))
  const map = new Map()
  for (const p of (s.points || [])) if (p && p.t) map.set(p.t, p.v)
  for (const p of incoming) if (p && p.t && typeof p.v === 'number') map.set(p.t, p.v)
  const merged = Array.from(map.entries()).map(([t, v]) => ({ t, v }))
  merged.sort((a, b) => String(a.t).localeCompare(String(b.t)))
  s.points = merged
  ds.updatedAt = new Date().toISOString()
  saveDataset(ds)
  return s
}

