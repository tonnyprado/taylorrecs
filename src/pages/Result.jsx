import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { SONGS } from '../lib/catalog_full'
import { recommend } from '../lib/recommender'
import { searchItunes } from '../lib/platformLinks'
import SongCard from '../components/SongCard'
import * as htmlToImage from 'html-to-image'

// 👇 importamos el background
import { useBackground } from '../ui/background/BackgroundProvider'

export default function Result(){
  const nav = useNavigate()
  const [params] = useSearchParams()
  const text = params.get('text') || ''
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [mode] = useState('offline')
  const shareRef = useRef(null)
  const audioRef = useRef(new Audio())
  const [currentUrl, setCurrentUrl] = useState(null)

  // 👇 hook para controlar el backdrop
  const { showAlbumBackdrop, hideAlbumBackdrop } = useBackground()

  useEffect(()=>{
    if(!text || text.trim().length < 5){ nav('/') ; return }
    (async ()=>{
      setLoading(true)
      const picks = recommend(text)
      const withMeta = await Promise.all(picks.map(async (p)=>{
        const song = SONGS.find(s=>s.id===p.id)
        const meta = await searchItunes(song.title)
        return { pick:{...p, ...song}, meta }
      }))
      setItems(withMeta)
      setLoading(false)
    })()

    return () => stopAll()
  }, [text])

  function stopAll(){
    const audio = audioRef.current
    audio.pause()
    audio.currentTime = 0
    setCurrentUrl(null)
    audio.onended = null
    hideAlbumBackdrop() // 👈 ocultamos el fondo al detener o salir
  }

  function playAll(){
    const list = items
      .map(i=> i.meta?.previewUrl && i.meta?.artwork ? ({ url: i.meta.previewUrl, art: i.meta.artwork }) : null)
      .filter(Boolean)
    if(list.length===0) return

    let idx = 0
    const audio = audioRef.current
    audio.src = list[0].url
    setCurrentUrl(list[0].url)
    showAlbumBackdrop(list[0].art) // 👈 mostramos carátula
    audio.play().catch(()=>{})

    audio.onended = ()=>{
      idx++
      if(idx < list.length){
        audio.src = list[idx].url
        setCurrentUrl(list[idx].url)
        showAlbumBackdrop(list[idx].art) // 👈 actualizamos carátula del siguiente track
        audio.play().catch(()=>{})
      } else {
        audio.onended = null
        setCurrentUrl(null)
        hideAlbumBackdrop() // 👈 se acabó la lista → ocultamos
      }
    }
  }

  function playOne(url, artwork){
    const audio = audioRef.current
    if(currentUrl === url){
      stopAll()
      return
    }
    audio.src = url
    setCurrentUrl(url)
    showAlbumBackdrop(artwork) // 👈 mostramos carátula del track elegido
    audio.play().catch(()=>{})
    audio.onended = () => {
      setCurrentUrl(null)
      audio.onended = null
      hideAlbumBackdrop() // 👈 se terminó → ocultamos
    }
  }

  async function downloadImage(){
    if(!shareRef.current) return
    const node = shareRef.current
    const dataUrl = await htmlToImage.toPng(node, { pixelRatio: 2 })
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'taylorrecs.png'
    a.click()
  }

  async function share(){
    try{
      const shareData = {
        title: 'TaylorRecs — mi recomendación',
        text: `Esto me recomendó: ${items.map(i=>i.pick.title).join(', ')}`,
        url: window.location.href
      }
      if(navigator.share){ await navigator.share(shareData) }
      else { await downloadImage() }
    }catch(e){ /* cancel */ }
  }

  return (
    <section className="max-w-4xl mx-auto pt-8 relative z-10">{/* 👈 aseguramos estar encima del backdrop */}
      <div className="flex items-center justify-between mb-4">
        <Link to="/" className="btn btn-ghost" onClick={stopAll}>← Volver</Link>
        <div className="badge badge-outline">{mode.toUpperCase()}</div>
      </div>

      <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Tus recomendaciones</h2>
      <p className="opacity-80 mb-6">Tu historia: <span className="italic">“{text}”</span></p>

      {loading && (
        <div className="grid gap-4">
          <div className="skeleton h-28"></div>
          <div className="skeleton h-28"></div>
          <div className="skeleton h-28"></div>
        </div>
      )}

      {!loading && (
        <>
          <div className="flex gap-2 mb-4">
            <button className="btn btn-primary" onClick={playAll}>▶︎ Reproducir todo</button>
            <button className="btn" onClick={stopAll}>⏸ Detener</button>
            <button className="btn" onClick={share}>Compartir</button>
            <button className="btn" onClick={downloadImage}>Descargar imagen</button>
          </div>

          <div ref={shareRef} className="grid gap-4">
            {items.map((item)=> (
              <SongCard
                key={item.pick.id}
                item={item}
                onPlay={playOne}          // ahora recibe (url, artwork)
                onStop={stopAll}
                isPlaying={currentUrl === item.meta?.previewUrl}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
