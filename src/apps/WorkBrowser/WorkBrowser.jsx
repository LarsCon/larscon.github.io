import { memo, useState, useMemo, useCallback } from 'react'
import { useNavigation } from '../../context/NavigationContext'
import portfolioItems, { getImageUrl } from '../../data/portfolioData'
import WorkBrowserDetail from './WorkBrowserDetail'
import styles from './WorkBrowser.module.css'

const categories = [
  'All',
  'Design',
  'Programming',
  'Engineering',
  'Art',
  'Photography',
  'Educational',
  'Professional',
  'Recreational',
]
const PAGE_SIZE = 12

const ExternalLinkIcon = memo(function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
})

const PortfolioCard = memo(function PortfolioCard({ item, onOpen }) {
  const hasLink = item.link && item.link !== '#'

  return (
    <div className={styles.card} onClick={() => onOpen(item)}>
      <div className={styles.cardImageWrap}>
        <img
          className={styles.cardImage}
          src={getImageUrl(item.image)}
          alt={item.title}
          loading="lazy"
        />
        {hasLink && (
          <a
            className={styles.liveBadge}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            title="Live project"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLinkIcon />
          </a>
        )}
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardTitle}>{item.title}</div>
        <div className={styles.cardCategories}>
          {item.categories.map(c => (
            <span key={c} className={styles.categoryBadge}>{c}</span>
          ))}
        </div>
      </div>
    </div>
  )
})

export default function WorkBrowser() {
  const { push } = useNavigation()
  const [activeFilter, setActiveFilter] = useState('All')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const filtered = useMemo(() => {
    if (activeFilter === 'All') return portfolioItems
    return portfolioItems.filter(item =>
      item.categories.some(c => c.toLowerCase() === activeFilter.toLowerCase())
    )
  }, [activeFilter])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  const handleFilterChange = (cat) => {
    setActiveFilter(cat)
    setVisibleCount(PAGE_SIZE)
  }

  const handleOpen = useCallback((item) => {
    push(WorkBrowserDetail, { item })
  }, [push])

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        {categories.map((cat) => (
          <span key={cat} style={{ display: 'contents' }}>
            <button
              className={`${styles.filterBtn} ${activeFilter === cat ? styles.filterBtnActive : ''}`}
              onClick={() => handleFilterChange(cat)}
            >
              {cat}
            </button>
            {cat === 'All' && <span className={styles.separator} />}
          </span>
        ))}
      </div>

      <div className={styles.grid}>
        {visible.length === 0 && (
          <div className={styles.empty}>No items found for this filter.</div>
        )}
        {visible.map(item => (
          <PortfolioCard key={item.id} item={item} onOpen={handleOpen} />
        ))}
        {hasMore && (
          <div className={styles.loadMore}>
            <button
              className={styles.loadMoreBtn}
              onClick={(e) => {
                e.stopPropagation()
                setVisibleCount(prev => prev + PAGE_SIZE)
              }}
            >
              Load More ({filtered.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
