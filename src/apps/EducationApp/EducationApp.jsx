import { useNavigation } from '../../context/NavigationContext'
import educationData, { getLogoUrl } from '../../data/educationData'
import EducationDetail from './EducationDetail'
import styles from './EducationApp.module.css'

export default function EducationApp() {
  const { push } = useNavigation()

  return (
    <div className={styles.container}>
      <div className={styles.timeline}>
        {educationData.map((entry, i) => (
          <div
            key={entry.id}
            className={styles.card}
            onClick={() => push(EducationDetail, { entry })}
          >
            <div className={styles.indicator}>
              <div className={styles.dot} />
              {i < educationData.length - 1 && <div className={styles.line} />}
            </div>
            <div className={styles.cardContent}>
              <div className={styles.logoWrap}>
                <img
                  className={styles.logo}
                  src={getLogoUrl(entry.logo)}
                  alt={entry.company}
                  loading="lazy"
                />
              </div>
              <div className={styles.info}>
                <div className={styles.school}>{entry.company}</div>
                <div className={styles.degree}>{entry.role}</div>
                <div className={styles.period}>{entry.shortPeriod}</div>
              </div>
              <div className={styles.arrow}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
