import { spotifySearchUrl, youtubeSearchUrl } from '../lib/platformLinks'

export default function SongCard({ item, onPlay, onStop, isPlaying }){
  const { meta, pick } = item
  return (
    <div className="card bg-base-100/80 backdrop-blur shadow-md">
      <div className="card-body">
        <div className="flex gap-4">
          <img src={meta.artwork} alt={`${meta.track || pick.title} cover`} className="w-24 h-24 rounded-xl object-cover"/>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{pick.title}</h3>
            <p className="opacity-80 text-sm">{pick.album} • {pick.year} • {pick.era}</p>
            <p className="mt-2">{pick.reason}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {meta.appleUrl && <a className="btn btn-sm" href={meta.appleUrl} target="_blank">Apple</a>}
              <a className="btn btn-sm" href={spotifySearchUrl(pick.title)} target="_blank">Spotify</a>
              <a className="btn btn-sm" href={youtubeSearchUrl(pick.title)} target="_blank">YouTube</a>

              {meta.previewUrl && (
                isPlaying
                  ? <button className="btn btn-sm btn-outline" onClick={onStop}>⏸ Detener</button>
                  : <button className="btn btn-sm btn-primary" onClick={()=>onPlay(meta.previewUrl)}>▶︎ Preview</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
