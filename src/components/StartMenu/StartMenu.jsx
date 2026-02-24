import { useState } from 'react'
import { useWindowManager } from '../../context/WindowManagerContext'
import { useTour } from '../../context/TourContext'
import appRegistry from '../../config/appRegistry'
import styles from './StartMenu.module.css'

const mainApps = appRegistry.filter(
  (a) => !['help', 'settings'].includes(a.id)
)
const utilApps = appRegistry.filter(
  (a) => ['help', 'settings'].includes(a.id)
)

export default function StartMenu({ onClose }) {
  const { openWindow } = useWindowManager()
  const { startTour } = useTour()
  const [hoveredApp, setHoveredApp] = useState(null)

  const handleOpenApp = (app) => {
    if (app.id === 'help') {
      startTour()
      onClose()
      return
    }
    if (app.externalUrl) {
      window.open(app.externalUrl, '_blank', 'noopener,noreferrer')
      onClose()
      return
    }
    openWindow({
      appId: app.id,
      title: app.title,
      icon: app.icon,
      defaultSize: app.defaultSize,
    })
    onClose()
  }

  const iconUrl = (icon) => `${import.meta.env.BASE_URL}icons/${icon}`

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.menu}>
        <div className={styles.header}>
          <div className={styles.avatar}>
            <svg viewBox="0 0 285.46 314" fill="#fff" className={styles.avatarLogo}>
              <path d="M251.16,121h34.3a146.57,146.57,0,0,0-139-100A148.71,148.71,0,0,0,129,22V54.33A114.67,114.67,0,0,1,251.16,121Z"/>
              <path d="M249.77,217A114.51,114.51,0,0,1,32,167.5c0-.17,0-.33,0-.5h0V76.12A146.51,146.51,0,1,0,284.42,217Z"/>
              <path d="M146.5,217A49.5,49.5,0,0,1,97,167.5c0-.17,0-.33,0-.5h0V0H64V167h0c0,.17,0,.33,0,.5A82.5,82.5,0,0,0,212.5,217Z"/>
              <path d="M146.5,118a49.51,49.51,0,0,1,46.31,67h34.31A82.49,82.49,0,0,0,129,86.88v34.31A49.54,49.54,0,0,1,146.5,118Z"/>
            </svg>
          </div>
          <span>Lars Conard Builds</span>
        </div>

        <div className={styles.body}>
          <div className={styles.appList}>
            {mainApps.map((app) => (
              <button
                key={app.id}
                className={`${styles.appItem} ${hoveredApp?.id === app.id ? styles.active : ''}`}
                onMouseEnter={() => setHoveredApp(app)}
                onClick={() => handleOpenApp(app)}
              >
                <img
                  className={styles.appItemIcon}
                  src={iconUrl(app.icon)}
                  alt=""
                />
                <span>{app.title}</span>
              </button>
            ))}

            <div className={styles.separator} />

            {utilApps.map((app) => (
              <button
                key={app.id}
                className={`${styles.appItem} ${hoveredApp?.id === app.id ? styles.active : ''}`}
                onMouseEnter={() => setHoveredApp(app)}
                onClick={() => handleOpenApp(app)}
              >
                <img
                  className={styles.appItemIcon}
                  src={iconUrl(app.icon)}
                  alt=""
                />
                <span>{app.title}</span>
              </button>
            ))}

          </div>

          <div className={styles.previewPanel}>
            {hoveredApp ? (
              <>
                <img
                  className={styles.previewIcon}
                  src={iconUrl(hoveredApp.icon)}
                  alt=""
                />
                <div className={styles.previewTitle}>{hoveredApp.title}</div>
                <div className={styles.previewDesc}>{hoveredApp.description}</div>
                <button
                  className={styles.openBtn}
                  onClick={() => handleOpenApp(hoveredApp)}
                >
                  Open Application
                </button>
              </>
            ) : (
              <span className={styles.previewDefault}>
                Hover over an application to see details
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
