import { useRef, useEffect } from 'react'
import { useNavigation, NavigationView } from '../../context/NavigationContext'
import MobileNavBar from '../MobileNavBar/MobileNavBar'
import styles from './MobileAppView.module.css'

export default function MobileAppView({ app, onHome }) {
  const { canGoBack, depth, pop } = useNavigation()
  const contentRef = useRef(null)
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
