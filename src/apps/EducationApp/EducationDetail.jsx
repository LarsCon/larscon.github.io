import { getLogoUrl } from '../../data/educationData'
import portfolioItems, { getImageUrl } from '../../data/portfolioData'
import { useNavigation } from '../../context/NavigationContext'
import WorkBrowserDetail from '../WorkBrowser/WorkBrowserDetail'
import styles from './EducationDetail.module.css'

export default function EducationDetail({ entry }) {
  const { push } = useNavigation()

  const relatedWork = entry.relatedWorkIds
    .map(id => portfolioItems.find(p => p.id === id))
    .filter(Boolean)

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.heroLogoWrap}>
          <img
            className={styles.heroLogo}
            src={getLogoUrl(entry.logo)}
            alt={entry.company}
          />
        </div>
        <div className={styles.heroInfo}>
          <h1 className={styles.heroSchool}>{entry.company}</h1>
          <div className={styles.heroDegree}>{entry.role}</div>
          {entry.status && <div className={styles.heroStatus}>{entry.status}</div>}
          <div className={styles.heroPeriod}>{entry.period}</div>
        </div>
      </div>

      <div className={styles.body}>
        <section className={styles.section}>
          <p className={styles.description}>{entry.description}</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Highlights</h2>
          <ul className={styles.highlights}>
            {entry.highlights.map((h, i) => (
              <li key={i} className={styles.highlight}>{h}</li>
            ))}
          </ul>
        </section>

        {entry.photos.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Photos</h2>
            <div className={styles.photoGrid}>
              {entry.photos.map((photo, i) => (
                <img
                  key={i}
                  className={styles.photo}
                  src={getImageUrl(photo)}
                  alt={`${entry.company} photo ${i + 1}`}
                  loading="lazy"
                />
              ))}
            </div>
          </section>
        )}

        {relatedWork.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Related Portfolio Work</h2>
            <div className={styles.relatedGrid}>
              {relatedWork.map(item => (
                <div
                  key={item.id}
                  className={styles.relatedCard}
                  onClick={() => push(WorkBrowserDetail, { item })}
                >
                  <img
                    className={styles.relatedImage}
                    src={getImageUrl(item.image)}
                    alt={item.title}
                    loading="lazy"
                  />
                  <div className={styles.relatedTitle}>{item.title}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
