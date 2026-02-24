import styles from './DummyApp.module.css'

export default function DummyApp({ appId, title }) {
  return (
    <div className={styles.dummy}>
      <p className={styles.message}>
        <strong>{title}</strong> is under construction.
      </p>
      <p className={styles.sub}>This application will be available soon.</p>
    </div>
  )
}
