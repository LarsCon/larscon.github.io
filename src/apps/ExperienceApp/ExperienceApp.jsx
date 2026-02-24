import { useNavigation } from '../../context/NavigationContext'
import experienceData, { getLogoUrl } from '../../data/experienceData'
import ExperienceDetail from './ExperienceDetail'
import styles from './ExperienceApp.module.css'

export default function ExperienceApp() {
  const { push } = useNavigation()

  return (
    <div className={styles.container}>
      <div className={styles.timeline}>
        {experienceData.map((job, i) => (
          <div
            key={job.id}
            className={styles.card}
            onClick={() => push(ExperienceDetail, { job })}
          >
            <div className={styles.indicator}>
              <div className={styles.dot} />
              {i < experienceData.length - 1 && <div className={styles.line} />}
            </div>
            <div className={styles.cardContent}>
              <div className={styles.logoWrap}>
                <img
                  className={styles.logo}
                  src={getLogoUrl(job.logo)}
                  alt={job.company}
                  loading="lazy"
                />
              </div>
              <div className={styles.info}>
                <div className={styles.role}>{job.role}</div>
                <div className={styles.company}>{job.company}</div>
                <div className={styles.period}>{job.shortPeriod}</div>
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
