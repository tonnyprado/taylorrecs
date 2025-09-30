import React from "react";
import { useBackground } from "./BackgroundProvider";
import "./album-backdrop.css";

export default function AlbumBackdrop() {
  const { albumBg } = useBackground();
  const { visible, url } = albumBg;

  return (
    <div
      className={`album-backdrop ${visible ? "album-backdrop--visible" : ""}`}
      style={url ? { backgroundImage: `url(${url})` } : {}}
      aria-hidden
    />
  );
}
