import { useState } from 'react'
import styles from './ContactApp.module.css'

const SOCIAL_LINKS = [
  {
    label: 'GitHub',
    url: 'https://github.com/LarsCon/',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 20.93c-3.36.73-4.07-1.62-4.07-1.62a3.2 3.2 0 0 0-1.34-1.77c-1.1-.75.08-.73.08-.73a2.54 2.54 0 0 1 1.85 1.24 2.57 2.57 0 0 0 3.52 1 2.57 2.57 0 0 1 .76-1.61c-2.68-.3-5.5-1.34-5.5-5.96a4.66 4.66 0 0 1 1.24-3.23 4.33 4.33 0 0 1 .12-3.19s1-.33 3.3 1.23a11.4 11.4 0 0 1 6.01 0c2.3-1.56 3.3-1.23 3.3-1.23a4.33 4.33 0 0 1 .11 3.19 4.66 4.66 0 0 1 1.24 3.23c0 4.63-2.82 5.66-5.51 5.96a2.88 2.88 0 0 1 .82 2.24l-.01 3.32c0 .32.22.7.84.57A12 12 0 0 0 12 .3" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/in/larsvconard/',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77A1.75 1.75 0 0 0 0 1.73v20.54A1.75 1.75 0 0 0 1.77 24h20.45A1.75 1.75 0 0 0 24 22.27V1.73A1.75 1.75 0 0 0 22.22 0Z" />
      </svg>
    ),
  },
  {
    label: 'Resume',
    url: 'https://drive.google.com/file/d/1bMBkPyt4bbTAp-KvzPOeXYmKwynTJZuB/view?usp=sharing',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
]

export default function ContactApp() {
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState('idle')

  function handleChange(e) {
    setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('https://formspree.io/f/xovwokjy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      })
      if (res.ok) {
        setStatus('sent')
        setFormState({ name: '', email: '', subject: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.infoPanel}>
        <h2 className={styles.heading}>Let's Work Together</h2>
        <p className={styles.blurb}>
          I'm always interested in new opportunities and exciting projects. Whether you have a question or just want to say hi, feel free to reach out!
        </p>

        <div className={styles.details}>
          <div className={styles.detailItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <a href="mailto:lars.conard@gmail.com" className={styles.detailLink}>lars.conard@gmail.com</a>
          </div>
          <div className={styles.detailItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Indiana</span>
          </div>
        </div>

        <div className={styles.socials}>
          {SOCIAL_LINKS.map(link => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialBtn}
              title={link.label}
            >
              {link.icon}
              <span>{link.label}</span>
            </a>
          ))}
        </div>

        <p className={styles.refNote}>References available upon request.</p>
      </div>

      <div className={styles.formPanel}>
        <h3 className={styles.formTitle}>Send a Message</h3>
        {status === 'sent' ? (
          <div className={styles.success}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p>Message sent successfully!</p>
            <button className={styles.resetBtn} onClick={() => setStatus('idle')}>Send Another</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.row}>
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formState.name}
                onChange={handleChange}
                required
                className={styles.input}
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formState.email}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>
            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={formState.subject}
              onChange={handleChange}
              required
              className={styles.input}
            />
            <textarea
              name="message"
              placeholder="Your Message"
              value={formState.message}
              onChange={handleChange}
              required
              rows={5}
              className={styles.textarea}
            />
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={status === 'sending'}
            >
              {status === 'sending' ? 'Sending…' : 'Send Message'}
            </button>
            {status === 'error' && (
              <p className={styles.error}>Something went wrong. Please try again.</p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
