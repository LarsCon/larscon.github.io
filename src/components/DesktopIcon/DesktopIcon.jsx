import { useCallback } from 'react'
import { useWindowManager } from '../../context/WindowManagerContext'
import { useTour } from '../../context/TourContext'
import styles from './DesktopIcon.module.css'

export default function DesktopIcon({ app }) {
  const { openWindow } = useWindowManager()
  const { startTour } = useTour()

  const handleClick = useCallback(() => {
    if (app.id === 'help') {
      startTour()
      return
    }
    if (app.externalUrl) {
      window.open(app.externalUrl, '_blank', 'noopener,noreferrer')
      return
    }
    openWindow({
      appId: app.id,
      title: app.title,
      icon: app.icon,
      defaultSize: app.defaultSize,
    })
  }, [app, openWindow, startTour])

  const iconSrc = `${import.meta.env.BASE_URL}icons/${app.icon}`

  return (
    <div
      className={styles.icon}
      onClick={handleClick}
      data-tour-id={`icon-${app.id}`}
      tabIndex={0}
    >
      <img className={styles.iconImage} src={iconSrc} alt={app.title} draggable={false} />
      <span className={styles.label}>{app.title}</span>
    </div>
  )
}
