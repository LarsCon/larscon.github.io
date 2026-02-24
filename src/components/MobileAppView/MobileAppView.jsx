import { useRef, useEffect } from 'react'
import { useNavigation, NavigationView } from '../../context/NavigationContext'
import MobileNavBar from '../MobileNavBar/MobileNavBar'
import styles from './MobileAppView.module.css'

export default function MobileAppView({ app, onHome }) {
  const { canGoBack, depth, pop } = useNavigation()
  const contentRef = useRef(null)

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0
  }, [depth])

  const iconUrl = `${import.meta.env.BASE_URL}icons/${app.icon}`

  const handleBack = () => {
    if (canGoBack) {
      pop()
    } else {
      onHome()
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img className={styles.headerIcon} src={iconUrl} alt="" />
        <span className={styles.headerTitle}>{app.title}</span>
      </div>
      <div ref={contentRef} className={styles.content}>
        <NavigationView />
      </div>
      <MobileNavBar onBack={handleBack} onHome={onHome} />
    </div>
  )
}
