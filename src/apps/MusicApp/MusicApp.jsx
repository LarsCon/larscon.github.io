import { useState } from 'react'
import styles from './MusicApp.module.css'

const SPOTIFY_EMBED_URL =
  'https://open.spotify.com/embed/playlist/42SzQTNbJTct7xW8ffVdR5?utm_source=generator&theme=0'

export default function MusicApp() {
  const [showPlayer, setShowPlayer] = useState(false)

  if (showPlayer) {
    return (
      <div className={styles.playerContainer}>
        <iframe
          src={SPOTIFY_EMBED_URL}
          className={styles.iframe}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="Spotify Playlist"
        />
      </div>
    )
  }

  return (
    <div className={styles.intro}>
      <div className={styles.textBlock}>
        <h2 className={styles.title}>
          Learn about me through the music<br />I listen to as you browse!
        </h2>
      </div>

      <button className={styles.continueBtn} onClick={() => setShowPlayer(true)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
        Browse Playlist
      </button>
    </div>
  )
}
