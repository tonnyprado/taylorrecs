import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import Result from './pages/Result.jsx'
import { BackgroundProvider } from './ui/background/BackgroundProvider.jsx'
import AlbumBackdrop from './ui/background/AlbumBackdrop.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'result', element: <Result /> },
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BackgroundProvider>
      <AlbumBackdrop />
      <RouterProvider router={router} />
    </BackgroundProvider>
  </React.StrictMode>
)