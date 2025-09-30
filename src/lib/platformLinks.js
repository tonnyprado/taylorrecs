// Utilidades para artwork + links de reproducción sin OAuth

export async function searchItunes(title){
  const q = encodeURIComponent(`Taylor Swift ${title}`)
  const url = `https://itunes.apple.com/search?term=${q}&media=music&limit=1`
  const res = await fetch(url)
  const data = await res.json().catch(()=>({results:[]}))
  const r = data.results?.[0]
  if(!r) return null
  // artworkUrl100 -> reemplazable por 600x600
  const artwork = r.artworkUrl100?.replace('100x100','600x600')
  return {
    previewUrl: r.previewUrl || null,
    appleUrl: r.trackViewUrl || r.collectionViewUrl || null,
    artwork,
    artist: r.artistName,
    track: r.trackName,
    collection: r.collectionName,
  }
}

export function spotifySearchUrl(title){
  const q = encodeURIComponent(`Taylor Swift ${title}`)
  return `https://open.spotify.com/search/${q}`
}

export function youtubeSearchUrl(title){
  const q = encodeURIComponent(`Taylor Swift ${title}`)
  return `https://www.youtube.com/results?search_query=${q}`
}