import styles from './AboutMeApp.module.css'

const BASE = import.meta.env.BASE_URL

const SKILLS = [
  { category: 'Design', items: ['Figma', 'Adobe Illustrator', 'Adobe Photoshop', 'Adobe InDesign', 'Adobe Acrobat', 'After Effects', 'Premiere Pro', 'Blender', 'Rhino 7', 'Branding', 'Motion Graphics'] },
  { category: 'Interactive', items: ['UI/UX', 'Unity', 'Construct 3', 'Godot', 'Unreal', 'Arduino'] },
  { category: 'Development', items: ['React', 'JavaScript', 'HTML/CSS', 'Python', 'Java', 'SQL', 'Node.js', 'C#', 'WordPress'] },
  { category: 'Platforms', items: ['Android', 'iOS', 'macOS', 'Linux', 'Windows'] },
  { category: 'Tools', items: ['Git', 'Vite', 'CNC', 'Adobe Creative Cloud'] },
]

const FACTS = [
  { label: 'Based in', value: 'Indiana' },
  { label: 'Degree', value: 'B.A. in Interactive Media, Indiana University' },
  { label: 'Current Role', value: 'Full-Stack Product Designer & Developer at OsTech' },
  { label: 'Title', value: 'Product Designer' },
]

const BRANDS = [
  { name: 'IGT', logo: 'igt.png' },
  { name: 'Powerball', logo: 'powerball.png' },
  { name: 'Hoosier Lottery', logo: 'hoosierLottery.png' },
  { name: 'Georgia Lottery', logo: 'georgiaLottery.jpg' },
  { name: 'New York Lottery', logo: 'newYorkLottery.png' },
  { name: 'Caribbean Lottery', logo: 'caribbeanLottery.jpg' },
  { name: 'Mega Millions', logo: 'megaMillions.png' },
  { name: 'Indeed', logo: 'indeed.png' },
  { name: 'Tide', logo: 'tide.png' },
  { name: 'Indiana University', logo: 'IU.png' },
  { name: 'Brain Twins', logo: 'brainTwins.jfif' },
  { name: 'OsTech', logo: 'ostech.PNG' },
]

export default function AboutMeApp() {
  const photoUrl = `${BASE}me.jpg`
  const logoUrl = (file) => `${BASE}assets/logos/${file}`

  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.avatarWrap}>
            <img className={styles.avatar} src={photoUrl} alt="Lars Conard" />
          </div>
          <div className={styles.heroText}>
            <h1 className={styles.name}>Lars Conard</h1>
            <p className={styles.title}>Product Designer</p>
            <p className={styles.tagline}>
              Building with technology since childhood, from code to design to interactive experiences.
            </p>
          </div>
        </div>
      </header>

      <div className={styles.body}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>About</h2>
          <p className={styles.bio}>
            I've been building with technology since childhood, growing from code to design to interactive
            experiences. With a background spanning low-voltage systems, museum installations, university
            instruction, multimedia design for major brands, and full-stack product development, I bring a
            rare combination of technical depth and creative instinct to everything I build.
          </p>
          <p className={styles.bio}>
            My career has taken me from wiring audio and network systems at schools and businesses, to
            developing touchscreen Unity exhibits for museums, to producing graphics and campaigns for
            names like Powerball, Hoosier Lottery, and IGT. Today, I work as a full-stack product designer
            and developer, turning ideas into real, marketable products from concept through design,
            development, and deployment on both web and mobile.
          </p>
          <p className={styles.bio}>
            I'm driven by the challenge of creating things that matter at scale. Whether it's a
            polished UI, a complex interactive system, or a creative campaign, I care deeply about craft,
            usability, and getting the details right.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>At a Glance</h2>
          <div className={styles.facts}>
            {FACTS.map(f => (
              <div key={f.label} className={styles.factCard}>
                <div>
                  <span className={styles.factLabel}>{f.label}</span>
                  <span className={styles.factValue}>{f.value}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Skills & Tools</h2>
          <div className={styles.skillGroups}>
            {SKILLS.map(group => (
              <div key={group.category} className={styles.skillGroup}>
                <h3 className={styles.skillCategory}>{group.category}</h3>
                <div className={styles.skillTags}>
                  {group.items.map(s => (
                    <span key={s} className={styles.skillTag}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Brands I've Worked With</h2>
          <div className={styles.brands}>
            {BRANDS.map(b => (
              <img key={b.name} className={styles.brandLogo} src={logoUrl(b.logo)} alt={b.name} title={b.name} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
