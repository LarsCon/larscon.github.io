import { useState, useRef, useEffect } from 'react'
import gamesData from '../../data/gamesData'
import styles from './GameEmbedApp.module.css'

export default function GameEmbedApp({ appId }) {
  const gameId = appId.replace('game-', '')
  const game = gamesData.find(g => g.id === gameId)
  const [showFallback, setShowFallback] = useState(false)
  const [loading, setLoading] = useState(true)
  const iframeRef = useRef(null)

  useEffect(() => {
    if (!game?.embedUrl) return
    const timer = setTimeout(() => {
      setLoading(false)
      try {
        const doc = iframeRef.current?.contentDocument
        if (!doc || !doc.body || doc.body.children.length === 0) {
          setShowFallback(true)
        }
      } catch {
        setShowFallback(true)
      }
    }, 4000)
    return () => clearTimeout(timer)
  }, [game])

  if (!game || !game.embedUrl) {
    return (
      <div className={styles.fallback}>
        <p>Game not found.</p>
      </div>
    )
  }

  if (showFallback) {
    return (
      <div className={styles.fallback}>
        <h3 className={styles.fallbackTitle}>{game.title}</h3>
        <p className={styles.fallbackText}>This game couldn't be embedded directly.</p>
        <a
          href={game.itchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.itchBtn}
        >
          ▶ Play on itch.io
        </a>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {loading && (
        <div className={styles.loader}>Loading game…</div>
      )}
      <iframe
        ref={iframeRef}
        src={game.embedUrl}
        className={styles.iframe}
        title={game.title}
        allowFullScreen
        allow="autoplay; fullscreen; gamepad"
        onLoad={() => setLoading(false)}
        onError={() => setShowFallback(true)}
      />
    </div>
  )
}
