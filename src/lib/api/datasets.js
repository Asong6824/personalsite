export async function listDatasets(params = {}) {
  const usp = new URLSearchParams()
  if (params.type) usp.set('type', params.type)
  if (params.tag) usp.set('tag', params.tag)
  if (params.q) usp.set('q', params.q)
  const url = `/api/datasets${usp.toString() ? `?${usp.toString()}` : ''}`
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function getDataset(id, params = {}) {
  const usp = new URLSearchParams()
  if (params.type) usp.set('type', params.type)
  if (params.from) usp.set('from', params.from)
  if (params.to) usp.set('to', params.to)
  if (params.series && Array.isArray(params.series) && params.series.length) {
    usp.set('series', params.series.join(','))
  }
  const url = `/api/datasets/${encodeURIComponent(id)}${usp.toString() ? `?${usp.toString()}` : ''}`
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

