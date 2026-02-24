import { useState, useEffect, useCallback } from 'react'
import styles from './SplashCurtain.module.css'

const STORAGE_KEY = 'portfolio-splash-seen'

export default function SplashCurtain() {
  const [seen] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === '1' } catch { return false }
  })
  const [countdown, setCountdown] = useState(3)
  const [dismissing, setDismissing] = useState(false)

  const dismiss = useCallback(() => {
    if (dismissing) return
    setDismissing(true)
    try { localStorage.setItem(STORAGE_KEY, '1') } catch {}
  }, [dismissing])

  useEffect(() => {
    if (seen) return
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown, seen])

  useEffect(() => {
    if (seen) return
    const onKey = (e) => {
      if (e.key === 'F11') dismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [seen, dismiss])

  useEffect(() => {
    if (seen) return
    const onChange = () => {
      if (document.fullscreenElement) dismiss()
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [seen, dismiss])

  if (seen) return null

  const ready = countdown <= 0

  return (
    <div className={`${styles.curtain} ${dismissing ? styles.curtainOut : ''}`}
      onAnimationEnd={dismissing ? (e) => {
        if (e.target === e.currentTarget) e.target.remove()
      } : undefined}
    >
      <div className={`${styles.inner} ${dismissing ? styles.innerOut : ''}`}>
        <svg className={styles.logo} viewBox="0 0 285.46 314" fill="currentColor">
          <path d="M251.16,121h34.3a146.57,146.57,0,0,0-139-100A148.71,148.71,0,0,0,129,22V54.33A114.67,114.67,0,0,1,251.16,121Z"/>
          <path d="M249.77,217A114.51,114.51,0,0,1,32,167.5c0-.17,0-.33,0-.5h0V76.12A146.51,146.51,0,1,0,284.42,217Z"/>
          <path d="M146.5,217A49.5,49.5,0,0,1,97,167.5c0-.17,0-.33,0-.5h0V0H64V167h0c0,.17,0,.33,0,.5A82.5,82.5,0,0,0,212.5,217Z"/>
          <path d="M146.5,118a49.51,49.51,0,0,1,46.31,67h34.31A82.49,82.49,0,0,0,129,86.88v34.31A49.54,49.54,0,0,1,146.5,118Z"/>
        </svg>

        <p className={styles.message}>
          For the best experience, press <kbd className={styles.kbd}>F11</kbd> to go fullscreen
        </p>

        <button
          className={`${styles.btn} ${ready ? styles.btnReady : ''}`}
          disabled={!ready}
          onClick={ready ? dismiss : undefined}
        >
          <span key={countdown} className={styles.btnText}>
            {ready ? 'No Thanks' : `${countdown}...`}
          </span>
        </button>
      </div>
    </div>
  )
}
