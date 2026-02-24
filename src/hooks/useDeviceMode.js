import { useState, useEffect } from 'react'

const MOBILE_BREAKPOINT = 768

function getDeviceMode() {
  if (typeof window === 'undefined') return 'desktop'
  const isCoarse = window.matchMedia('(pointer: coarse)').matches
  const isNarrow = window.innerWidth <= MOBILE_BREAKPOINT
  return isCoarse || isNarrow ? 'mobile' : 'desktop'
}

export default function useDeviceMode() {
  const [mode, setMode] = useState(getDeviceMode)

  useEffect(() => {
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
