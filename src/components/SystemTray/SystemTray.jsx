import { useState, useEffect } from 'react'
import styles from './SystemTray.module.css'

export default function SystemTray() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 30000)
    return () => clearInterval(interval)
  }, [])

  const formatted = time.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div className={styles.tray}>
      <span className={styles.clock}>{formatted}</span>
    </div>
  )
}
