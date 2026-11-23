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
  // Originals:
  // { label: 'Based in', value: 'Indiana' },
  // { label: 'Degree', value: 'B.A. in Interactive Media, Indiana University' },  (DO NOT re-enable: degree is B.A. in Media)
  // { label: 'Current Role', value: 'Full-Stack Product Designer & Developer at OsTech' },
  { label: 'Based in', value: 'Indianapolis, IN (open to relocation)' },
  { label: 'Degree', value: 'B.A. in Media (Interactive and Digital Media), Indiana University' },
  { label: 'Current Role', value: 'Full-Stack Product Designer & Developer at OsTech (part-time)' },
  { label: 'Title', value: 'Creative Technologist' },
]

const BRANDS = [
  { name: 'IGT', logo: 'igt.png' },
  { name: 'Powerball', logo: 'powerball.png' },
  { name: 'Hoosier Lottery', logo: 'hoosierLottery.png' },
  { name: 'Georgia Lottery', logo: 'georgiaLottery.jpg' },
  { name: 'New York Lottery', logo: 'newYorkLottery.png' },
  { name: 'Caribbean Lottery', logo: 'caribbeanLottery.jpg' },
  { name: 'Mega Millions', logo: 'megaMillions.png' },
  // Indeed and Tide were NSAC student-competition clients; IU is the school. Commented out:
  // { name: 'Indeed', logo: 'indeed.png' },
  // { name: 'Tide', logo: 'tide.png' },
  // { name: 'Indiana University', logo: 'IU.png' },
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
            <p className={styles.title}>Creative Technologist</p>
            <p className={styles.tagline}>
              Designer and developer who builds the whole thing, from the first sketch to the hardware it runs on.
            </p>
          </div>
        </div>
      </header>

      <div className={styles.body}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>About</h2>
          {/* Original paragraph 1:
            Welcome to my website, thanks for stopping by! I've been building with technology since childhood, progressing from hardware to code to full-on interactive experiences! With a background spanning configuring & installation, mentorship, multimedia design for major brands, and full stack product development, I bring a rare combination of skills to the table.
          */}
          {/* Original paragraph 2:
            My career has spanned large-scale IT projects, mentorship & team management, to personal 1:1 product development/marketing/design. Today, I work as a full-stack product designer and developer at OsTech, turning vague ideas into real, marketable digital products! In my free time at home, I'm truly (and happily) glued to my craft, working full time on recreational and freelancing projects.
          */}
          {/* Original paragraph 4:
            My personality is hands-on and driven, steeped in southern hospitality, and above all, understanding. I've been acknowledged for my skills, leadership, and especially drive more times than I can count. I make a difference in anything and everything I do; my best is the only gear I have. If you like what you see, you know where to find me :)
          */}
          <p className={styles.bio}>
            I've been building with technology since childhood, starting with hardware, then code, then interactive experiences that combine both. My work has ranged from installing AV and network systems in schools, to touchscreen museum exhibits, to launch campaigns for national lottery brands, to full-stack products I design, build, and host myself.
          </p>
          <p className={styles.bio}>
            Today I'm the designer and developer at OsTech, where I turn rough client ideas into shipped products like Reblade, a Beyblade battle-recording app on Android and iOS. Outside client work I build my own: The Trader's Spot, a trading-card marketplace running on a Linux server I administer, and a CNC machine I built from scratch and use to make the playmats I sell.
          </p>
          <p className={styles.bio}>
            My education after high school began at IUPUI, where I entered an IT degree path, a path I was obsessed with since my first Dell PC. Midway into my Junior year, my life came to a screeching halt. My sister had passed, I couldn't maintain my grades, and I withdrew from my second semester. With my friends and family, I fought through it, and started my journey again at Eleven Fifty certification school and Herron School of Art & Design, where I explored coding and design respectively. I eventually chose Indiana University in Bloomington as my university, and graduated in December 2024 with a Bachelor of Arts in Media, concentrating in Interactive and Digital Media.
          </p>
          <p className={styles.bio}>
            I like owning a problem from the first sketch to the hardware it runs on, and I do my best work on teams that need someone to bridge design and engineering. If that sounds like your team, I'd love to hear from you.
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
