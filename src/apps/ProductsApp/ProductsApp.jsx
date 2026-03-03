import { useState, useEffect, useCallback, useRef } from 'react'
import productsData, { getProductImageUrl } from '../../data/productsData'
import styles from './ProductsApp.module.css'

export default function ProductsApp() {
  const [selected, setSelected] = useState(null)

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {productsData.map(product => (
          <div
            key={product.id}
            className={styles.card}
            onClick={() => setSelected(product)}
          >
            <div className={styles.thumbWrap}>
              <img
                className={styles.thumb}
                src={getProductImageUrl(product.images[0])}
                alt={product.title}
                loading="lazy"
              />
            </div>
            <div className={styles.cardInfo}>
              <span className={styles.cardTitle}>{product.title}</span>
              <span className={styles.cardPrice}>{product.price}</span>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <ProductPopup product={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

function ProductPopup({ product, onClose }) {
  const [imgIdx, setImgIdx] = useState(0)
  const [direction, setDirection] = useState(1)
  const timerRef = useRef(null)
  const userInteracted = useRef(false)

  const startAutoRotate = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (userInteracted.current) return
    timerRef.current = setInterval(() => {
      setDirection(1)
      setImgIdx(prev => (prev + 1) % product.images.length)
    }, 4000)
  }, [product.images.length])

  useEffect(() => {
    startAutoRotate()
    return () => clearInterval(timerRef.current)
  }, [startAutoRotate])

  const goTo = (i, dir) => {
    userInteracted.current = true
    if (timerRef.current) clearInterval(timerRef.current)
    setDirection(dir ?? 1)
    setImgIdx(i)
  }

  const prev = () => goTo(
    (imgIdx - 1 + product.images.length) % product.images.length,
    -1
  )
  const next = () => goTo(
    (imgIdx + 1) % product.images.length,
    1
  )

  const descLines = product.description.split('\n')

  return (
    <div className={styles.popupOverlay} onClick={onClose}>
      <div className={styles.popup} onClick={e => e.stopPropagation()}>
        <div className={styles.popupContent}>
          <div className={styles.banner}>
            <div
              className={styles.bannerTrack}
              key={imgIdx}
              style={{ '--slide-dir': direction }}
            >
              <img
                className={styles.bannerImg}
                src={getProductImageUrl(product.images[imgIdx])}
                alt={product.title}
              />
            </div>
            {product.images.length > 1 && (
              <>
                <button className={`${styles.bannerArrow} ${styles.bannerArrowLeft}`} onClick={prev}>‹</button>
                <button className={`${styles.bannerArrow} ${styles.bannerArrowRight}`} onClick={next}>›</button>
                <div className={styles.dots}>
                  {product.images.map((_, i) => (
                    <button
                      key={i}
                      className={`${styles.dot} ${i === imgIdx ? styles.dotActive : ''}`}
                      onClick={() => goTo(i, i > imgIdx ? 1 : -1)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className={styles.popupBody}>
            <div className={styles.popupInfo}>
              <h3 className={styles.popupTitle}>{product.title}</h3>
              <span className={styles.popupPrice}>{product.price}</span>
              <div className={styles.popupDesc}>
                {descLines.map((line, i) =>
                  line === '' ? <br key={i} /> : <p key={i}>{line}</p>
                )}
              </div>
            </div>
            <div className={styles.popupButtons}>
              <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
              {product.link && (
                <a
                  className={styles.buyBtn}
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {product.linkLabel}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
