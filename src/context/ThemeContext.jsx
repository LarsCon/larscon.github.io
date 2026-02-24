import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ThemeContext = createContext()

const STORAGE_KEY = 'portfolio-accent-color'
const DEFAULT_ACCENT = '#0078d4'

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b]
    .map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
    .join('')
}

function lighten(hex, amount = 0.25) {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex(
    r + (255 - r) * amount,
    g + (255 - g) * amount,
    b + (255 - b) * amount
  )
}

function darken(hex, amount = 0.25) {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount))
}

function applyAccent(color) {
  const root = document.documentElement
  root.style.setProperty('--accent', color)
  root.style.setProperty('--accent-light', lighten(color))
  root.style.setProperty('--accent-dark', darken(color))
}

export function ThemeProvider({ children }) {
  const [accent, setAccentState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_ACCENT
    } catch {
      return DEFAULT_ACCENT
    }
  })

  useEffect(() => {
    applyAccent(accent)
  }, [accent])

  const setAccent = useCallback((color) => {
    setAccentState(color)
    try {
      localStorage.setItem(STORAGE_KEY, color)
    } catch { /* noop */ }
  }, [])

  return (
    <ThemeContext.Provider value={{ accent, setAccent }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
