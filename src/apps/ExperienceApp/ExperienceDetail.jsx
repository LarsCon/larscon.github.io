import { getLogoUrl } from '../../data/experienceData'
import portfolioItems, { getImageUrl } from '../../data/portfolioData'
import { useNavigation } from '../../context/NavigationContext'
import WorkBrowserDetail from '../WorkBrowser/WorkBrowserDetail'
import styles from './ExperienceDetail.module.css'

export default function ExperienceDetail({ job }) {
  const { push } = useNavigation()

  const relatedWork = job.relatedWorkIds
    .map(id => portfolioItems.find(p => p.id === id))
    .filter(Boolean)

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.heroLogoWrap}>
          <img
            className={styles.heroLogo}
            src={getLogoUrl(job.logo)}
            alt={job.company}
          />
        </div>
        <div className={styles.heroInfo}>
          <h1 className={styles.heroRole}>{job.role}</h1>
          <div className={styles.heroCompany}>{job.company}</div>
          <div className={styles.heroPeriod}>{job.period}</div>
        </div>
      </div>

      <div className={styles.body}>
        <section className={styles.section}>
          <p className={styles.description}>{job.description}</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Key Contributions</h2>
          <ul className={styles.highlights}>
            {job.highlights.map((h, i) => (
              <li key={i} className={styles.highlight}>{h}</li>
            ))}
          </ul>
        </section>

        {job.photos.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Photos</h2>
            <div className={styles.photoGrid}>
              {job.photos.map((photo, i) => (
                <img
                  key={i}
                  className={styles.photo}
                  src={getImageUrl(photo)}
                  alt={`${job.company} photo ${i + 1}`}
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
