import { Outlet, Link } from 'react-router-dom'

export default function App(){
  return (
    <div data-theme="fullsmash" className="min-h-screen bg-base-100 text-base-content">
      <header className="px-5 py-4 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg">TaylorRecs</Link>
        <a className="btn btn-ghost btn-sm" href="https://music.apple.com/" target="_blank">Apple Music</a>
      </header>
      <main className="px-4 pb-20"><Outlet/></main>
      <footer className="p-6 text-center opacity-70 text-sm">Hecho con 💖 para portafolio. No almacenamos tu texto.</footer>
    </div>
  )
}