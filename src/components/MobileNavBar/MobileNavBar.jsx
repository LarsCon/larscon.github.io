import styles from './MobileNavBar.module.css'

export default function MobileNavBar({ onBack, onHome }) {
  return (
    <div className={styles.navBar} data-tour-id="mobile-navbar">
      <button
        className={styles.navBtn}
        onClick={onBack}
        disabled={!onBack}
        aria-label="Back"
      >
        ◁
      </button>
      <button
        className={styles.navBtn}
        onClick={onHome}
        aria-label="Home"
      >
        ○
      </button>
    </div>
  )
}
