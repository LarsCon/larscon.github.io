import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import styles from './SettingsApp.module.css'

const ACCENT_COLORS = [
  { color: '#ffb900', name: 'Gold' },
  { color: '#ff8c00', name: 'Orange Bright' },
  { color: '#f7630c', name: 'Orange' },
  { color: '#ca5010', name: 'Rust' },
  { color: '#da3b01', name: 'Sienna' },
  { color: '#d13438', name: 'Red' },
  { color: '#e74856', name: 'Rose' },
  { color: '#e81123', name: 'Crimson' },
  { color: '#ea005e', name: 'Magenta' },
  { color: '#c30052', name: 'Berry' },
  { color: '#e3008c', name: 'Fuchsia' },
  { color: '#bf0077', name: 'Plum' },
  { color: '#0078d4', name: 'Default Blue' },
  { color: '#0063b1', name: 'Navy' },
  { color: '#8e8cd8', name: 'Lavender' },
  { color: '#6b69d6', name: 'Iris' },
  { color: '#8764b8', name: 'Violet' },
  { color: '#744da9', name: 'Purple' },
  { color: '#b146c2', name: 'Orchid' },
  { color: '#881798', name: 'Grape' },
  { color: '#00b7c3', name: 'Light Teal' },
  { color: '#038387', name: 'Teal' },
  { color: '#00b294', name: 'Seafoam' },
  { color: '#018574', name: 'Dark Teal' },
  { color: '#00cc6a', name: 'Mint' },
  { color: '#10893e', name: 'Green' },
  { color: '#107c10', name: 'Emerald' },
  { color: '#498205', name: 'Olive' },
  { color: '#515c6b', name: 'Steel' },
  { color: '#68768a', name: 'Storm' },
  { color: '#767676', name: 'Grey' },
  { color: '#4c4a48', name: 'Charcoal' },
]

const OS_MODE_KEY = 'portfolio-os-mode'

function getCurrentOsMode() {
  try { return localStorage.getItem(OS_MODE_KEY) || 'auto' } catch { return 'auto' }
}

export default function SettingsApp() {
  const { accent, setAccent } = useTheme()
  const [osMode, setOsMode] = useState(getCurrentOsMode)
  const [confirmMode, setConfirmMode] = useState(null)

  const handleOsModeChange = (mode) => {
    if (mode === osMode) return
    setConfirmMode(mode)
  }

  const confirmSwitch = () => {
    try {
      if (confirmMode === 'auto') {
        localStorage.removeItem(OS_MODE_KEY)
      } else {
        localStorage.setItem(OS_MODE_KEY, confirmMode)
      }
    } catch {}
    setConfirmMode(null)
    window.location.reload()
  }

  const cancelSwitch = () => {
    setConfirmMode(null)
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.pageTitle}>Personalization</h1>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Accent color</h2>
          <p className={styles.sectionDesc}>
            Pick an accent color for title bars, buttons, and highlights throughout the interface.
          </p>

          <div className={styles.colorGrid}>
            {ACCENT_COLORS.map(({ color, name }) => (
              <button
                key={color}
                className={`${styles.swatch} ${accent === color ? styles.swatchActive : ''}`}
                style={{ background: color }}
                onClick={() => setAccent(color)}
                aria-label={name}
                title={name}
              >
                {accent === color && <span className={styles.check}>✓</span>}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Preview</h2>
          <div className={styles.preview}>
            <div className={styles.previewTitlebar} style={{ background: accent }}>
              <span className={styles.previewTitleText}>Sample Window</span>
              <span className={styles.previewBtns}>
                <span className={styles.previewBtn}>─</span>
                <span className={styles.previewBtn}>□</span>
                <span className={`${styles.previewBtn} ${styles.previewCloseBtn}`}>✕</span>
              </span>
            </div>
            <div className={styles.previewBody}>
              <p>This is a live preview of your selected accent color.</p>
              <button className={styles.previewAccentBtn} style={{ background: accent }}>
                Accent Button
              </button>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>OS Mode</h2>
          <p className={styles.sectionDesc}>
            Switch between the Windows desktop and Android mobile interfaces.
          </p>

          <div className={styles.osToggle}>
            {['auto', 'desktop', 'mobile'].map(mode => (
              <button
                key={mode}
                className={`${styles.osBtn} ${osMode === mode ? styles.osBtnActive : ''}`}
                onClick={() => handleOsModeChange(mode)}
              >
                {mode === 'auto' ? 'Auto' : mode === 'desktop' ? 'Desktop' : 'Mobile'}
              </button>
            ))}
          </div>
        </section>
      </div>

      {confirmMode && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmBox}>
            <p className={styles.confirmText}>
              Switching OS mode will refresh the page. Any unsaved state will be lost.
            </p>
            <div className={styles.confirmButtons}>
              <button className={styles.confirmCancel} onClick={cancelSwitch}>Cancel</button>
              <button className={styles.confirmOk} style={{ background: accent }} onClick={confirmSwitch}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
