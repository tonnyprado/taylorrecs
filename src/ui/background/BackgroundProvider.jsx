// src/ui/background/BackgroundProvider.jsx
import React, { createContext, useContext, useMemo, useState, useCallback } from "react";

const BackgroundCtx = createContext(null);

export function BackgroundProvider({ children }) {
  const [albumBg, setAlbumBg] = useState({ visible: false, url: "" });

  const showAlbumBackdrop = useCallback((url) => {
    if (!url) return;
    setAlbumBg({ visible: true, url });
  }, []);

  const hideAlbumBackdrop = useCallback(() => {
    // hacemos un pequeño fade-out manteniendo la imagen hasta que termine la transición
    setAlbumBg((prev) => ({ ...prev, visible: false }));
    // opcional: limpiar url después de la animación (300ms)
    setTimeout(() => setAlbumBg({ visible: false, url: "" }), 350);
  }, []);

  const value = useMemo(() => ({ albumBg, showAlbumBackdrop, hideAlbumBackdrop }), [albumBg, showAlbumBackdrop, hideAlbumBackdrop]);

  return (
    <BackgroundCtx.Provider value={value}>
      {children}
    </BackgroundCtx.Provider>
  );
}

export const useBackground = () => {
  const ctx = useContext(BackgroundCtx);
  if (!ctx) throw new Error("useBackground must be used within BackgroundProvider");
  return ctx;
};
