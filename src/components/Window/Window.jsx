import { useRef, useState, useCallback, useEffect } from 'react'
import { useWindowManager } from '../../context/WindowManagerContext'
import { useNavigation } from '../../context/NavigationContext'
import styles from './Window.module.css'

const MIN_WIDTH = 200
const MIN_HEIGHT = 120
const TASKBAR_HEIGHT = 48

export default function Window({ windowData, isActive, children }) {
  const {
    closeWindow, minimizeWindow, animateMinimize, maximizeWindow,
    restoreWindow, focusWindow, moveWindow, resizeWindow, animationComplete,
  } = useWindowManager()
  const { canGoBack, depth, pop } = useNavigation()

  const dragRef = useRef(null)
  const windowRef = useRef(null)
  const contentRef = useRef(null)
  const [transformOrigin, setTransformOrigin] = useState('50% 100%')

  useEffect(() => {
    if (windowData.animState) {
      const btn = document.querySelector(`[data-window-id="${windowData.id}"]`)
      if (btn) {
        const btnRect = btn.getBoundingClientRect()
        const x = btnRect.left + btnRect.width / 2 - windowData.position.x
        const y = btnRect.top + btnRect.height / 2 - windowData.position.y
        setTransformOrigin(`${x}px ${y}px`)
      } else {
        setTransformOrigin('50% 100%')
      }
    }
  }, [windowData.animState, windowData.id, windowData.position.x, windowData.position.y])

  const handleAnimationEnd = useCallback(() => {
    if (windowData.animState === 'minimizing') {
      minimizeWindow(windowData.id)
    } else if (windowData.animState === 'restoring') {
      animationComplete(windowData.id)
    }
  }, [windowData.animState, windowData.id, minimizeWindow, animationComplete])

  const handleMouseDown = useCallback(
    (e) => {
      if (windowData.isMaximized) return
      e.preventDefault()
      focusWindow(windowData.id)

      const offsetX = e.clientX - windowData.position.x
      const offsetY = e.clientY - windowData.position.y
      const winW = windowData.size.width

      dragRef.current = true

      const handleMouseMove = (e) => {
        if (!dragRef.current) return
        let newX = e.clientX - offsetX
        let newY = e.clientY - offsetY

        const desktopH = window.innerHeight - TASKBAR_HEIGHT
        newY = Math.max(0, Math.min(desktopH - 32, newY))
        newX = Math.max(-(winW - 100), Math.min(window.innerWidth - 100, newX))

        moveWindow(windowData.id, { x: newX, y: newY })
      }

      const handleMouseUp = () => {
        dragRef.current = null
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [windowData.id, windowData.position, windowData.size.width, windowData.isMaximized, focusWindow, moveWindow]
  )

  const handleResizeStart = useCallback(
    (e, direction) => {
      if (windowData.isMaximized) return
      e.preventDefault()
      e.stopPropagation()
      focusWindow(windowData.id)

      const startX = e.clientX
      const startY = e.clientY
      const startPos = { ...windowData.position }
      const startSize = { ...windowData.size }
      const desktopW = window.innerWidth
      const desktopH = window.innerHeight - TASKBAR_HEIGHT

      const handleMouseMove = (e) => {
        const dx = e.clientX - startX
        const dy = e.clientY - startY

        let newX = startPos.x
        let newY = startPos.y
        let newW = startSize.width
        let newH = startSize.height

        if (direction.includes('e')) newW = startSize.width + dx
        if (direction.includes('s')) newH = startSize.height + dy
        if (direction.includes('w')) {
          newW = startSize.width - dx
          newX = startPos.x + dx
        }
        if (direction.includes('n')) {
          newH = startSize.height - dy
          newY = startPos.y + dy
        }

        if (direction.includes('w') && newX < 0) {
          newW += newX
          newX = 0
        }
        if (direction.includes('n') && newY < 0) {
          newH += newY
          newY = 0
        }
        if (direction.includes('e') && newX + newW > desktopW) {
          newW = desktopW - newX
        }
        if (direction.includes('s') && newY + newH > desktopH) {
          newH = desktopH - newY
        }

        if (newW < MIN_WIDTH) {
          if (direction.includes('w')) newX = startPos.x + startSize.width - MIN_WIDTH
          newW = MIN_WIDTH
        }
        if (newH < MIN_HEIGHT) {
          if (direction.includes('n')) newY = startPos.y + startSize.height - MIN_HEIGHT
          newH = MIN_HEIGHT
        }

        resizeWindow(
          windowData.id,
          { width: newW, height: newH },
          { x: newX, y: newY }
        )
      }

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [windowData.id, windowData.position, windowData.size, windowData.isMaximized, focusWindow, resizeWindow]
  )

  useEffect(() => {
    return () => { dragRef.current = null }
  }, [])

  const prevDepthRef = useRef(depth)
  const scrollStackRef = useRef([])

  useEffect(() => {
    const prev = prevDepthRef.current
    prevDepthRef.current = depth

    if (!contentRef.current) return

    if (depth > prev) {
      scrollStackRef.current.push(contentRef.current.scrollTop)
      contentRef.current.scrollTop = 0
    } else if (depth < prev) {
      const saved = scrollStackRef.current.pop()
      if (saved != null) contentRef.current.scrollTop = saved
    }
  }, [depth])

  const handleMaximizeToggle = () => {
    if (windowData.isMaximized) {
      restoreWindow(windowData.id)
    } else {
      maximizeWindow(windowData.id)
    }
  }

  const classNames = [
    styles.window,
    !isActive && styles.inactive,
    windowData.isMaximized && styles.maximized,
    windowData.animState === 'minimizing' && styles.minimizing,
    windowData.animState === 'restoring' && styles.restoring,
  ]
    .filter(Boolean)
    .join(' ')

  const iconSrc = windowData.icon
    ? `${import.meta.env.BASE_URL}icons/${windowData.icon}`
    : undefined

  return (
    <div
      ref={windowRef}
      className={classNames}
      data-tour-id={`window-${windowData.appId}`}
      style={{
        left: windowData.position.x,
        top: windowData.position.y,
        width: windowData.size.width,
        height: windowData.size.height,
        zIndex: windowData.zIndex,
        display: windowData.isMinimized ? 'none' : 'flex',
        ...(windowData.animState && { transformOrigin }),
      }}
      onMouseDown={() => focusWindow(windowData.id)}
      onAnimationEnd={handleAnimationEnd}
    >
      {!windowData.isMaximized && (
        <>
          <div className={styles.resizeN} onMouseDown={(e) => handleResizeStart(e, 'n')} />
          <div className={styles.resizeS} onMouseDown={(e) => handleResizeStart(e, 's')} />
          <div className={styles.resizeE} onMouseDown={(e) => handleResizeStart(e, 'e')} />
          <div className={styles.resizeW} onMouseDown={(e) => handleResizeStart(e, 'w')} />
          <div className={styles.resizeNE} onMouseDown={(e) => handleResizeStart(e, 'ne')} />
          <div className={styles.resizeNW} onMouseDown={(e) => handleResizeStart(e, 'nw')} />
          <div className={styles.resizeSE} onMouseDown={(e) => handleResizeStart(e, 'se')} />
          <div className={styles.resizeSW} onMouseDown={(e) => handleResizeStart(e, 'sw')} />
        </>
      )}
      <div className={styles.titleBar} data-tour-id={`window-titlebar-${windowData.appId}`} onMouseDown={handleMouseDown}>
        {iconSrc && <img className={styles.titleIcon} src={iconSrc} alt="" />}
        <span className={styles.titleText}>{windowData.title}</span>
        <div className={styles.titleButtons} data-tour-id={`window-buttons-${windowData.appId}`}>
          <button
            className={`${styles.titleBtn} ${styles.minimizeBtn}`}
            onClick={(e) => {
              e.stopPropagation()
              animateMinimize(windowData.id)
            }}
            aria-label="Minimize"
          >
            ─
          </button>
          <button
            className={`${styles.titleBtn} ${styles.maximizeBtn}`}
            onClick={(e) => {
              e.stopPropagation()
              handleMaximizeToggle()
            }}
            aria-label={windowData.isMaximized ? 'Restore' : 'Maximize'}
          >
            {windowData.isMaximized ? '❐' : '□'}
          </button>
          <button
            className={`${styles.titleBtn} ${styles.closeBtn}`}
            onClick={(e) => {
              e.stopPropagation()
              closeWindow(windowData.id)
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>
      {canGoBack && (
        <div className={styles.navBar}>
          <button
            className={styles.backBtn}
            onClick={() => pop()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
        </div>
      )}
      <div ref={contentRef} className={styles.content}>{children}</div>
    </div>
  )
}
