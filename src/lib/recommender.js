import { SONGS } from './catalog_full'

const KEYWORDS = {
  ruptura: ['terminamos','cortamos','ruptura','adiós','se acabó','me dejó','lo dejé'],
  toxic: ['tóxic','manipul','gaslight','celos','posesiv'],
  nostalgia: ['recuerdo','extraño','nostalgia','me acuerdo','añoro'],
  ansiedad: ['ansiedad','ansioso','miedo','preocupad','insegur'],
  verano: ['verano','julio','agosto','vacaciones','playa'],
  secreto: ['secreto','oculto','escondida','escondidas'],
  compromiso: ['compromiso','hogar','pareja estable','boda','matrimonio'],
  ambicion: ['ambición','ambicioso','carrera','trabajo','sueño profesional'],
  traicion: ['traición','infiel','me engañó','mentir','mentiras','engaño'],
  primeramor: ['primer amor','adolescencia','escuela','clase','vecino','vecina'],
}

const norm = s => s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'')

export function recommend(text){
  const t = norm(text || '')
  const hits = new Set()
  for(const [theme, words] of Object.entries(KEYWORDS)){
    if(words.some(w => t.includes(norm(w)))) hits.add(theme)
  }

  const scored = SONGS.map(s => {
    const overlap = s.themes.filter(th => [...hits].some(h => th.includes(h) || h.includes(th)))
    const hasMood = s.moods.some(m => t.includes(norm(m)))
    const score = overlap.length + (hasMood ? 0.25 : 0)
    return { song:s, score, overlap }
  }).sort((a,b)=> b.score - a.score)

  const top = scored.filter(x=>x.score>0)

  let picks
  if(top.length){
    picks = top.slice(0,3)
  } else {
    // 🔀 shuffle aleatorio para no repetir siempre
    const shuffled = [...scored].sort(()=> Math.random()-0.5)
    picks = shuffled.slice(0,3)
  }

  return picks.map(({song, overlap}, i)=> ({
    id: song.id,
    reason: overlap.length
      ? `Detecté ${overlap.join(', ')}; conecta con "${song.title}".`
      : `Por la vibra que describes y su mood ${song.moods.join(', ')}.`,
    confidence: Math.min(1, (overlap.length/3)+0.25) - (i*0.05)
  }))
}
