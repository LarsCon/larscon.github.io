import { useState, useEffect, useRef, useCallback } from 'react'
import { useTour } from '../../context/TourContext'
import styles from './TourOverlay.module.css'

const DESKTOP_STEPS = [
  {
    id: 'welcome',
    target: null,
    title: 'Welcome to my portfolio!',
    body: "I've designed it to act like a Windows machine! Let me give you a quick tour of how everything works.",
    primary: 'Start Tour',
    secondary: 'No Thanks',
  },
  {
    id: 'open-about',
    target: '[data-tour-id="icon-about-me"]',
    position: 'right',
    title: 'Desktop Icons',
    body: 'Click any icon on the desktop to open an application. Try clicking About Me!',
    primary: 'Open It',
    action: 'open-about-me',
  },
  {
    id: 'move-window',
    target: '[data-tour-id="window-titlebar-about-me"]',
    position: 'bottom',
    title: 'Move Windows',
    body: 'Drag the title bar to move a window around the desktop, just like real Windows!',
    primary: 'Next',
  },
  {
    id: 'resize-window',
    target: '[data-tour-id="window-about-me"]',
    position: 'right',
    title: 'Resize Windows',
    body: 'Drag any edge or corner to resize the window. Give it a try!',
    primary: 'Next',
  },
  {
    id: 'window-controls',
    target: '[data-tour-id="window-buttons-about-me"]',
    position: 'bottom',
    title: 'Window Controls',
    body: 'Use these buttons to minimize (─), maximize (□), or close (✕) the window.',
    primary: 'Next',
  },
  {
    id: 'start-menu',
    target: '[data-tour-id="start-button"]',
    position: 'top',
    title: 'Start Menu',
    body: 'Click the Start button to browse all apps, or click open windows on the taskbar to switch between them.',
    primary: 'Next',
  },
  {
    id: 'done',
    target: null,
    title: "You're all set!",
    body: "A few more tips:\n\n• Try Settings for some fun options\n• Try on mobile for a different experience too!",
    primary: 'Finish',
  },
]

const MOBILE_STEPS = [
  {
    id: 'welcome',
    target: null,
    title: 'Welcome to my portfolio!',
    body: "I've designed it to act like an Android OS! Let me give you a quick tour.",
    primary: 'Start Tour',
    secondary: 'No Thanks',
  },
  {
    id: 'app-icons',
    target: '[data-tour-id="app-icon-about-me"]',
    position: 'bottom',
    title: 'App Icons',
    body: 'Tap any app icon to open it and start exploring.',
    primary: 'Next',
  },
  {
    id: 'nav-bar',
    target: '[data-tour-id="mobile-navbar"]',
    position: 'top',
    title: 'Navigation',
    body: 'Use the back (◁) and home (○) buttons to navigate between apps and screens.',
    primary: 'Next',
  },
  {
    id: 'done',
    target: null,
    title: "You're all set!",
    body: "A few more tips:\n\n• Try Settings for some fun options\n• Try on desktop for a different experience too!",
    primary: 'Finish',
  },
]

const SPOTLIGHT_PAD = 8

function queryVisible(selector) {
  const els = document.querySelectorAll(selector)
  return Array.from(els).find(el => el.offsetParent !== null) || els[0] || null
}

function getClipPath(rect) {
  if (!rect) return 'none'
  const l = rect.left - SPOTLIGHT_PAD
  const t = rect.top - SPOTLIGHT_PAD
  const r = rect.right + SPOTLIGHT_PAD
  const b = rect.bottom + SPOTLIGHT_PAD
  return `polygon(
    0% 0%, 0% 100%,
    ${l}px 100%, ${l}px ${t}px,
    ${r}px ${t}px, ${r}px ${b}px,
    ${l}px ${b}px, ${l}px 100%,
    100% 100%, 100% 0%
  )`
}

function calcTooltipPos(rect, position, vpW, vpH) {
  const gap = 16
  const tw = Math.min(320, vpW - 24)
  let top, bottom, left, arrow, useBottom = false

  switch (position) {
    case 'bottom':
      top = rect.bottom + SPOTLIGHT_PAD + gap
      left = rect.left + rect.width / 2 - tw / 2
      arrow = 'top'
      break
    case 'top':
      bottom = vpH - rect.top + SPOTLIGHT_PAD + gap
      left = rect.left + rect.width / 2 - tw / 2
      arrow = 'bottom'
      useBottom = true
      break
    case 'right':
      top = rect.top + rect.height / 2
      left = rect.right + SPOTLIGHT_PAD + gap
      arrow = 'left'
      break
    case 'left':
      top = rect.top + rect.height / 2
      left = rect.left - SPOTLIGHT_PAD - tw - gap
      arrow = 'right'
      break
    default:
      top = rect.bottom + SPOTLIGHT_PAD + gap
      left = rect.left + rect.width / 2 - tw / 2
      arrow = 'top'
  }

  left = Math.max(12, Math.min(vpW - tw - 12, left))
  if (!useBottom) {
    top = Math.max(12, Math.min(vpH - 80, top))
  }

  return { top, bottom, left, arrow, width: tw, useBottom }
}

export default function TourOverlay({ mode, openApp }) {
  const { active, step, nextStep, endTour } = useTour()
  const [targetRect, setTargetRect] = useState(null)
  const tooltipRef = useRef(null)
  const [tooltipHeight, setTooltipHeight] = useState(0)
  const advancedRef = useRef(false)

  const steps = mode === 'desktop' ? DESKTOP_STEPS : MOBILE_STEPS
  const currentStep = step < steps.length ? steps[step] : null

  useEffect(() => {
    advancedRef.current = false
  }, [step])

  const safeAdvance = useCallback(() => {
    if (advancedRef.current) return
    advancedRef.current = true
    nextStep()
  }, [nextStep])

  useEffect(() => {
    if (!active || !currentStep?.target) {
      setTargetRect(null)
      return
    }

    let cancelled = false
    let attempts = 0

    const find = () => {
      if (cancelled) return
      const el = queryVisible(currentStep.target)
      if (el) {
        setTargetRect(el.getBoundingClientRect())
      } else if (attempts < 30) {
        attempts++
        setTimeout(find, 100)
      }
    }

    find()
    return () => { cancelled = true }
  }, [active, step, currentStep])

  useEffect(() => {
    if (!active || !currentStep?.target || !targetRect) return

    const update = () => {
      const el = queryVisible(currentStep.target)
      if (el) setTargetRect(el.getBoundingClientRect())
    }

    const id = setInterval(update, 300)
    return () => clearInterval(id)
  }, [active, step, currentStep, targetRect])

  useEffect(() => {
    if (tooltipRef.current) {
      setTooltipHeight(tooltipRef.current.offsetHeight)
    }
  })

  // Auto-advance: "open-about" — watch for the About Me window to appear, or advance if already open
  useEffect(() => {
    if (!active || currentStep?.id !== 'open-about') return

    const alreadyOpen = !!document.querySelector('[data-tour-id="window-about-me"]')
    if (alreadyOpen) {
      setTimeout(() => safeAdvance(), 400)
      return
    }

    let cancelled = false
    const poll = () => {
      if (cancelled) return
      const win = document.querySelector('[data-tour-id="window-about-me"]')
      if (win) {
        setTimeout(() => safeAdvance(), 400)
      } else {
        setTimeout(poll, 200)
      }
    }
    poll()
    return () => { cancelled = true }
  }, [active, step, currentStep, safeAdvance])

  // Auto-advance: "move-window" — detect position change on mouseup
  useEffect(() => {
    if (!active || currentStep?.id !== 'move-window') return

    const el = document.querySelector('[data-tour-id="window-about-me"]')
    if (!el) return

    const initRect = el.getBoundingClientRect()

    const onUp = () => {
      const cur = el.getBoundingClientRect()
      if (Math.abs(cur.left - initRect.left) > 10 || Math.abs(cur.top - initRect.top) > 10) {
        setTimeout(() => safeAdvance(), 400)
      }
    }

    document.addEventListener('mouseup', onUp)
    return () => document.removeEventListener('mouseup', onUp)
  }, [active, step, currentStep, safeAdvance])

  // Auto-advance: "resize-window" — detect size change on mouseup
  useEffect(() => {
    if (!active || currentStep?.id !== 'resize-window') return

    const el = document.querySelector('[data-tour-id="window-about-me"]')
    if (!el) return

    const initRect = el.getBoundingClientRect()

    const onUp = () => {
      const cur = el.getBoundingClientRect()
      if (Math.abs(cur.width - initRect.width) > 5 || Math.abs(cur.height - initRect.height) > 5) {
        setTimeout(() => safeAdvance(), 400)
      }
    }

    document.addEventListener('mouseup', onUp)
    return () => document.removeEventListener('mouseup', onUp)
  }, [active, step, currentStep, safeAdvance])

  // Auto-advance: "window-controls" — detect click on any window button
  useEffect(() => {
    if (!active || currentStep?.id !== 'window-controls') return

    const el = document.querySelector('[data-tour-id="window-buttons-about-me"]')
    if (!el) return

    const onClick = () => {
      setTimeout(() => safeAdvance(), 300)
    }

    el.addEventListener('click', onClick, true)
    return () => el.removeEventListener('click', onClick, true)
  }, [active, step, currentStep, safeAdvance])

  // Auto-advance: "start-menu" — detect start button click
  useEffect(() => {
    if (!active || currentStep?.id !== 'start-menu') return

    const el = document.querySelector('[data-tour-id="start-button"]')
    if (!el) return

    const onClick = () => {
      setTimeout(() => safeAdvance(), 600)
    }

    el.addEventListener('click', onClick, true)
    return () => el.removeEventListener('click', onClick, true)
  }, [active, step, currentStep, safeAdvance])

  // Auto-advance: mobile "app-icons" — detect when user taps an app (icons leave DOM)
  useEffect(() => {
    if (!active || currentStep?.id !== 'app-icons') return

    let iconSeen = false
    let cancelled = false

    const poll = () => {
      if (cancelled) return
      const el = queryVisible('[data-tour-id="app-icon-about-me"]')
      if (el) {
        iconSeen = true
      } else if (iconSeen) {
        setTimeout(() => safeAdvance(), 300)
        return
      }
      setTimeout(poll, 200)
    }

    poll()
    return () => { cancelled = true }
  }, [active, step, currentStep, safeAdvance])

  // If the About Me window disappears during a step that needs it, skip to done
  useEffect(() => {
    if (!active) return
    const windowStepIds = ['move-window', 'resize-window', 'window-controls']
    if (!windowStepIds.includes(currentStep?.id)) return

    let windowSeen = false

    const id = setInterval(() => {
      const win = document.querySelector('[data-tour-id="window-about-me"]')
      if (win) {
        windowSeen = true
      } else if (windowSeen) {
        const doneIdx = steps.findIndex(s => s.id === 'done')
        if (doneIdx > step) {
          for (let i = step; i < doneIdx; i++) nextStep()
        }
      }
    }, 500)

    return () => clearInterval(id)
  }, [active, step, currentStep, steps, nextStep])

  const handlePrimary = useCallback(() => {
    if (!currentStep) return

    if (currentStep.action === 'open-about-me' && openApp) {
      openApp('about-me')
      return
    }

    if (currentStep.primary === 'Finish') {
      endTour()
      return
    }

    if (step >= steps.length - 1) {
      endTour()
      return
    }

    nextStep()
  }, [currentStep, step, steps.length, openApp, nextStep, endTour])

  const handleSecondary = useCallback(() => {
    endTour()
  }, [endTour])

  if (!active || !currentStep) return null

  const isCenter = !currentStep.target
  const clipPath = getClipPath(targetRect)

  const vpW = window.innerWidth
  const vpH = window.innerHeight

  let tooltipPos = null
  if (!isCenter && targetRect && currentStep.position) {
    tooltipPos = calcTooltipPos(targetRect, currentStep.position, vpW, vpH)
  }

  const bodyLines = currentStep.body.split('\n')

  return (
    <div className={styles.overlay}>
      <div
        className={styles.backdrop}
        style={{ clipPath: isCenter ? 'none' : clipPath }}
        onClick={isCenter ? undefined : (e) => e.stopPropagation()}
      />

      {targetRect && (
        <div
          className={styles.spotlight}
          style={{
            top: targetRect.top - SPOTLIGHT_PAD,
            left: targetRect.left - SPOTLIGHT_PAD,
            width: targetRect.width + SPOTLIGHT_PAD * 2,
            height: targetRect.height + SPOTLIGHT_PAD * 2,
          }}
        />
      )}

      {isCenter ? (
        <div className={styles.modal}>
          <div className={styles.modalCard}>
            {currentStep.title && <h2 className={styles.modalTitle}>{currentStep.title}</h2>}
            <div className={styles.modalBody}>
              {bodyLines.map((line, i) =>
                line === '' ? <br key={i} /> : <p key={i} className={styles.bodyLine}>{line}</p>
              )}
            </div>
            <div className={styles.modalButtons}>
              {currentStep.secondary && (
                <button className={styles.secondaryBtn} onClick={handleSecondary}>
                  {currentStep.secondary}
                </button>
              )}
              <button className={styles.primaryBtn} onClick={handlePrimary}>
                {currentStep.primary}
              </button>
            </div>
          </div>
        </div>
      ) : tooltipPos && (
        <div
          ref={tooltipRef}
          className={styles.tooltip}
          data-arrow={tooltipPos.arrow}
          style={{
            ...(tooltipPos.useBottom ? { bottom: tooltipPos.bottom } : { top: tooltipPos.top }),
            left: tooltipPos.left,
            maxWidth: tooltipPos.width,
          }}
        >
          {currentStep.title && <h3 className={styles.tooltipTitle}>{currentStep.title}</h3>}
          <p className={styles.tooltipBody}>{currentStep.body}</p>
          <div className={styles.tooltipFooter}>
            <span className={styles.stepCount}>{step + 1} / {steps.length}</span>
            <button className={styles.primaryBtn} onClick={handlePrimary}>
              {currentStep.primary}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
