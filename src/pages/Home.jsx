import { useNavigate, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Home(){
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [text, setText] = useState('')

  useEffect(()=>{
    const t = params.get('text')
    if(t) setText(t)
  },[])

  function go(){
    if((text||'').trim().length < 5) return
    nav(`/result?text=${encodeURIComponent(text.trim())}`)
  }

  return (
    <section className="max-w-3xl mx-auto pt-16">
      <h1 className="text-3xl md:text-5xl font-extrabold text-center mb-6">
        De hecho hay una canción de Taylor Swift que explica mi situación
      </h1>
      <p className="text-center opacity-80 mb-8">Cuéntame tu situación y te digo que canciones de Taylor se asemejan a lo que me describas.</p>
      <div className="card bg-base-200/60 border border-base-300 shadow-glow">
        <div className="card-body gap-4">
          <textarea
            className="textarea textarea-bordered bg-base-100 min-h-[140px]"
            placeholder="Ej: Terminamos pero aún pienso en él; cuando paso por lugares me da nostalgia…"
            value={text}
            onChange={e=>setText(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter' && (e.metaKey||e.ctrlKey)){ go() } }}
          />
          <button className="btn btn-primary" onClick={go} disabled={(text||'').trim().length<5}>Continuar</button>
        </div>
      </div>
    </section>
  )
}