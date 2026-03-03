import { useState, useCallback } from 'react'
import { useWindowManager } from '../../context/WindowManagerContext'
import StartMenu from '../StartMenu/StartMenu'
import SystemTray from '../SystemTray/SystemTray'
import styles from './Taskbar.module.css'

export default function Taskbar() {
  const { windows, activeWindowId, focusWindow, animateMinimize, restoreWindow } =
    useWindowManager()
  const [startOpen, setStartOpen] = useState(false)

  const handleWindowClick = useCallback(
    (win) => {
      if (win.isMinimized) {
        restoreWindow(win.id)
      } else if (win.id === activeWindowId) {
        animateMinimize(win.id)
      } else {
        focusWindow(win.id)
      }
    },
    [activeWindowId, focusWindow, animateMinimize, restoreWindow]
  )

  const iconUrl = (icon) => `${import.meta.env.BASE_URL}icons/${icon}`

  return (
    <>
      <div className={styles.taskbar}>
        <button
          className={styles.startBtn}
          data-tour-id="start-button"
          onClick={() => setStartOpen((prev) => !prev)}
          aria-label="Start"
        >
          <svg className={styles.startLogo} viewBox="0 0 285.46 314" fill="url(#rainbowGrad)">
            <defs>
              <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="100%" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ff6b6b">
                  <animate attributeName="stop-color" values="#ff6b6b;#ffa500;#ffd93d;#6bcb77;#4d96ff;#9b59b6;#ff6b6b" dur="6s" repeatCount="indefinite"/>
                </stop>
                <stop offset="50%" stopColor="#4d96ff">
                  <animate attributeName="stop-color" values="#4d96ff;#9b59b6;#ff6b6b;#ffa500;#ffd93d;#6bcb77;#4d96ff" dur="6s" repeatCount="indefinite"/>
                </stop>
                <stop offset="100%" stopColor="#6bcb77">
                  <animate attributeName="stop-color" values="#6bcb77;#4d96ff;#9b59b6;#ff6b6b;#ffa500;#ffd93d;#6bcb77" dur="6s" repeatCount="indefinite"/>
                </stop>
              </linearGradient>
            </defs>
            <path d="M251.16,121h34.3a146.57,146.57,0,0,0-139-100A148.71,148.71,0,0,0,129,22V54.33A114.67,114.67,0,0,1,251.16,121Z"/>
            <path d="M249.77,217A114.51,114.51,0,0,1,32,167.5c0-.17,0-.33,0-.5h0V76.12A146.51,146.51,0,1,0,284.42,217Z"/>
            <path d="M146.5,217A49.5,49.5,0,0,1,97,167.5c0-.17,0-.33,0-.5h0V0H64V167h0c0,.17,0,.33,0,.5A82.5,82.5,0,0,0,212.5,217Z"/>
            <path d="M146.5,118a49.51,49.51,0,0,1,46.31,67h34.31A82.49,82.49,0,0,0,129,86.88v34.31A49.54,49.54,0,0,1,146.5,118Z"/>
          </svg>
        </button>

        <div className={styles.windowList}>
          {windows.map((win) => {
            const btnClass = [
              styles.windowBtn,
              win.id === activeWindowId && !win.isMinimized && styles.windowBtnActive,
              win.isMinimized && styles.windowBtnMinimized,
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <button
                key={win.id}
                className={btnClass}
                onClick={() => handleWindowClick(win)}
                data-window-id={win.id}
              >
                {win.icon && (
                  <img
                    className={styles.windowBtnIcon}
                    src={iconUrl(win.icon)}
                    alt=""
                  />
                )}
                <span className={styles.windowBtnTitle}>{win.title}</span>
              </button>
            )
          })}
        </div>

        <SystemTray />
      </div>

      {startOpen && <StartMenu onClose={() => setStartOpen(false)} />}
    </>
  )
}
