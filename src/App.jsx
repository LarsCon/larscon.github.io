import { useCallback } from 'react'
import useDeviceMode from './hooks/useDeviceMode'
import { ThemeProvider } from './context/ThemeContext'
import { TourProvider } from './context/TourContext'
import { WindowManagerProvider, useWindowManager } from './context/WindowManagerContext'
import { getApp } from './config/appRegistry'
import Desktop from './components/Desktop/Desktop'
import Taskbar from './components/Taskbar/Taskbar'
import TourOverlay from './components/TourOverlay/TourOverlay'
import MobileShell from './components/MobileShell/MobileShell'

function DesktopTourBridge() {
  const { openWindow } = useWindowManager()

  const openApp = useCallback((appId) => {
    const app = getApp(appId)
    if (app) {
      openWindow({
        appId: app.id,
        title: app.title,
        icon: app.icon,
        defaultSize: app.defaultSize,
      })
    }
  }, [openWindow])

  return <TourOverlay mode="desktop" openApp={openApp} />
}

export default function App() {
  const mode = useDeviceMode()

  return (
    <ThemeProvider>
      <TourProvider>
        {mode === 'mobile' ? (
          <MobileShell />
        ) : (
          <WindowManagerProvider>
            <Desktop />
            <Taskbar />
            <DesktopTourBridge />
          </WindowManagerProvider>
        )}
      </TourProvider>
    </ThemeProvider>
  )
}
