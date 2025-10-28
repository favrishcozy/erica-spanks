export type MediaManifest = Record<string, string[]>

let cachedManifest: MediaManifest | null = null

export async function loadMediaManifest(): Promise<MediaManifest> {
  if (cachedManifest) return cachedManifest
  try {
    const res = await fetch('/media-manifest.json')
    if (!res.ok) throw new Error('No manifest')
    const json = await res.json()
    cachedManifest = json
    return json
  } catch (err) {
    cachedManifest = {}
    return {}
  }
}

export async function getMediaForCategory(slug: string, limit = 3): Promise<string[]> {
  const manifest = await loadMediaManifest()
  const list = manifest[slug] || manifest[slug.toLowerCase()] || []
  return list.slice(0, limit)
}
