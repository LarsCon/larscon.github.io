import { useWindowManager } from '../../context/WindowManagerContext'
import { getApp } from '../../config/appRegistry'
import appRegistry from '../../config/appRegistry'
import { NavigationProvider, NavigationView } from '../../context/NavigationContext'
import DesktopIcon from '../DesktopIcon/DesktopIcon'
import Window from '../Window/Window'
import styles from './Desktop.module.css'

export default function Desktop() {
  const { windows, activeWindowId } = useWindowManager()

  return (
    <div className={styles.desktop}>
      <div className={styles.bgBrand}>
        <svg className={styles.bgLogo} viewBox="0 0 285.46 314" fill="currentColor">
          <path d="M251.16,121h34.3a146.57,146.57,0,0,0-139-100A148.71,148.71,0,0,0,129,22V54.33A114.67,114.67,0,0,1,251.16,121Z"/>
          <path d="M249.77,217A114.51,114.51,0,0,1,32,167.5c0-.17,0-.33,0-.5h0V76.12A146.51,146.51,0,1,0,284.42,217Z"/>
          <path d="M146.5,217A49.5,49.5,0,0,1,97,167.5c0-.17,0-.33,0-.5h0V0H64V167h0c0,.17,0,.33,0,.5A82.5,82.5,0,0,0,212.5,217Z"/>
          <path d="M146.5,118a49.51,49.51,0,0,1,46.31,67h34.31A82.49,82.49,0,0,0,129,86.88v34.31A49.54,49.54,0,0,1,146.5,118Z"/>
        </svg>
        <span className={styles.bgSubtitle}>Lars Conard Builds</span>
      </div>

      <div className={styles.iconGrid}>
        {appRegistry.map((app) => (
          <DesktopIcon key={app.id} app={app} />
        ))}
      </div>

      {windows.map((win) => {
        const appConfig = getApp(win.appId)
        if (!appConfig) return null
        return (
          <NavigationProvider
            key={win.id}
            rootComponent={appConfig.component}
            rootProps={{ appId: win.appId, title: win.title }}
          >
            <Window windowData={win} isActive={win.id === activeWindowId}>
              <NavigationView />
            </Window>
          </NavigationProvider>
        )
      })}
    </div>
  )
}
