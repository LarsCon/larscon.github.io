import { useState } from 'react'
import gamesData, { getImageUrl } from '../../data/gamesData'
import styles from './GamesApp.module.css'

export default function GamesApp() {
  const [selected, setSelected] = useState(null)

  const handlePlay = () => {
    if (!selected) return
    window.open(selected.itchUrl, '_blank', 'noopener')
    setSelected(null)
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {gamesData.map(game => (
          <button
            key={game.id}
            className={styles.card}
            onClick={() => setSelected(game)}
          >
            <div className={styles.thumbWrap}>
              <img
                src={getImageUrl(game.image)}
                alt={game.title}
                className={styles.thumb}
                loading="lazy"
              />
              <span className={styles.badge}>
                {game.embeddable ? '▶ Play Now' : '↓ Download'}
              </span>
            </div>
            <div className={styles.cardInfo}>
              <span className={styles.cardTitle}>{game.title}</span>
              <div className={styles.tags}>
                {game.tags.map(t => (
                  <span key={t} className={styles.tag}>{t}</span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className={styles.popupOverlay} onClick={() => setSelected(null)}>
          <div className={styles.popup} onClick={e => e.stopPropagation()}>
            <img
              src={getImageUrl(selected.image)}
              alt={selected.title}
              className={styles.popupImage}
            />
            <h3 className={styles.popupTitle}>{selected.title}</h3>
            <p className={styles.popupDesc}>{selected.description}</p>
            <div className={styles.popupTags}>
              {selected.tags.map(t => (
                <span key={t} className={styles.tag}>{t}</span>
              ))}
            </div>
            <div className={styles.popupButtons}>
              <button className={styles.cancelBtn} onClick={() => setSelected(null)}>
                Cancel
              </button>
              <button className={styles.playBtn} onClick={handlePlay}>
                {selected.embeddable ? '▶ Play now at itch.io' : '↓ Download at itch.io'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
