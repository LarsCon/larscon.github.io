import { useState, useEffect } from 'react'
import appRegistry from '../../config/appRegistry'
import { useTour } from '../../context/TourContext'
import { NavigationProvider, NavigationView } from '../../context/NavigationContext'
import MobileAppView from '../MobileAppView/MobileAppView'
import MobileNavBar from '../MobileNavBar/MobileNavBar'
import TourOverlay from '../TourOverlay/TourOverlay'
import styles from './MobileShell.module.css'

export default function MobileShell() {
  const [activeApp, setActiveApp] = useState(null)
  const [time, setTime] = useState(new Date())
  const { startTour } = useTour()

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 30000)
    return () => clearInterval(interval)
  }, [])

  const formatted = time.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })

  const iconUrl = (icon) => `${import.meta.env.BASE_URL}icons/${icon}`

  const handleOpenApp = (app) => {
    if (app.id === 'help') {
      startTour()
      return
    }
    if (app.externalUrl) {
      window.open(app.externalUrl, '_blank', 'noopener,noreferrer')
      return
    }
    setActiveApp(app)
  }

  const handleGoHome = () => {
    setActiveApp(null)
  }

  return (
    <>
      {activeApp ? (
        <NavigationProvider
          key={activeApp.id}
          rootComponent={activeApp.component}
          rootProps={{ appId: activeApp.id, title: activeApp.title }}
        >
          <MobileAppView app={activeApp} onHome={handleGoHome} />
        </NavigationProvider>
      ) : (
        <div className={styles.shell}>
          <div className={styles.bgBrand}>
            <svg className={styles.bgLogo} viewBox="0 0 285.46 314" fill="currentColor">
              <path d="M251.16,121h34.3a146.57,146.57,0,0,0-139-100A148.71,148.71,0,0,0,129,22V54.33A114.67,114.67,0,0,1,251.16,121Z"/>
              <path d="M249.77,217A114.51,114.51,0,0,1,32,167.5c0-.17,0-.33,0-.5h0V76.12A146.51,146.51,0,1,0,284.42,217Z"/>
              <path d="M146.5,217A49.5,49.5,0,0,1,97,167.5c0-.17,0-.33,0-.5h0V0H64V167h0c0,.17,0,.33,0,.5A82.5,82.5,0,0,0,212.5,217Z"/>
              <path d="M146.5,118a49.51,49.51,0,0,1,46.31,67h34.31A82.49,82.49,0,0,0,129,86.88v34.31A49.54,49.54,0,0,1,146.5,118Z"/>
            </svg>
            <span className={styles.bgSubtitle}>Lars Conard Builds</span>
          </div>
          <div className={styles.statusBar}>
            <span>{formatted}</span>
          </div>
          <div className={styles.homeScreen}>
            {appRegistry.map((app) => (
              <button
                key={app.id}
                className={styles.appIcon}
                data-tour-id={`app-icon-${app.id}`}
                onClick={() => handleOpenApp(app)}
              >
                <img className={styles.appIconImage} src={iconUrl(app.icon)} alt="" />
                <span className={styles.appIconLabel}>{app.title}</span>
              </button>
            ))}
          </div>
          <MobileNavBar onBack={null} onHome={handleGoHome} />
        </div>
      )}
      <TourOverlay mode="mobile" />
    </>
  )
}
