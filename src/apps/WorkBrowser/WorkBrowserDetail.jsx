import { getImageUrl } from '../../data/portfolioData'
import styles from './WorkBrowserDetail.module.css'

export default function WorkBrowserDetail({ item }) {
  const hasLink = item.link && item.link !== '#'

  return (
    <div className={styles.container}>
      <div className={styles.imageWrap}>
        <img
          className={styles.image}
          src={getImageUrl(item.image)}
          alt={item.title}
        />
        {hasLink && (
          <a
            className={styles.linkBtn}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            {item.linkText || 'See Work'}
          </a>
        )}
      </div>

      <div className={styles.body}>
        <h2 className={styles.title}>{item.title}</h2>

        <div className={styles.meta}>
          {item.categories.map(c => (
            <span key={c} className={styles.categoryBadge}>{c}</span>
          ))}
        </div>

        <p className={styles.description}>{item.description}</p>

        {item.tags.length > 0 && (
          <div className={styles.tags}>
            {item.tags.map(t => (
              <span key={t} className={styles.tag}>{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
