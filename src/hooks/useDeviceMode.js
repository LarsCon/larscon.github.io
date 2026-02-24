import { useState, useEffect } from 'react'

const MOBILE_BREAKPOINT = 768
const STORAGE_KEY = 'portfolio-os-mode'

function getAutoMode() {
  if (typeof window === 'undefined') return 'desktop'
  const isCoarse = window.matchMedia('(pointer: coarse)').matches
  const isNarrow = window.innerWidth <= MOBILE_BREAKPOINT
  return isCoarse || isNarrow ? 'mobile' : 'desktop'
}

function getDeviceMode() {
  try {
    const override = localStorage.getItem(STORAGE_KEY)
    if (override === 'desktop' || override === 'mobile') return override
  } catch {}
  return getAutoMode()
}

export default function useDeviceMode() {
  const [mode, setMode] = useState(getDeviceMode)

  useEffect(() => {
    const override = localStorage.getItem(STORAGE_KEY)
    if (override) return

    const handleResize = () => setMode(getDeviceMode())
    window.addEventListener('resize', handleResize)

    const mql = window.matchMedia('(pointer: coarse)')
    const handlePointerChange = () => setMode(getDeviceMode())
    mql.addEventListener('change', handlePointerChange)

    return () => {
      window.removeEventListener('resize', handleResize)
      mql.removeEventListener('change', handlePointerChange)
    }
  }, [])

  return mode
}
