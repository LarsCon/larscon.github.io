const ASSETS_BASE = import.meta.env.BASE_URL

export function getLogoUrl(filename) {
  return ASSETS_BASE + 'assets/logos/' + filename
}

const experienceData = [
  {
    id: 'ostech',
    company: 'OsTech',
    role: 'Full-Stack Product Designer & Developer (Part-time)',
    period: 'August 2025 – Present',
    shortPeriod: '2025–Present',
    logo: 'ostech.PNG',
    // Original role: 'Full-Stack Product Designer & Developer'
    // Nov 2026 rewrite (wrong, Lars doesn't own OsTech): 'Sole technical owner in a two-person shop, working remotely: I take client ideas from research and design through development, deployment, and maintenance.'
    description:
      'Remotely employed, act as the de facto technical brain and hands, turning vague ideas into real, marketable products.',
    highlights: [
      'Handle end to end work: design, development, research, and problem solving',
      'Built multiple client websites, with others in the making',
      'Designed, developed, published, and currently maintaining Reblade, a Beyblade battle-recording app, on Android & iOS',
      // Nov 2026 rewrites, commented out:
      // 'Build and maintain multiple production client websites',
      // 'Own the full cycle: user research, UI design, development, store publishing, and ongoing support',
    ],
    photos: [],
    relatedWorkIds: [74, 72, 71],
  },
  {
    id: 'tyler-automotive',
    company: 'Tyler Automotive',
    role: 'Service Writer',
    period: 'February 2026 – Present',
    shortPeriod: '2026–Present',
    // From the header of tylerautoindy.com
    logo: 'tylerAutomotive.webp',
    description:
      'Front-of-house at a 4.9-rated independent auto repair shop in Indianapolis (est. 1977, Indianapolis "#1 Neighborhood Favorite" for auto repair).',
    highlights: [
      'Translate technician diagnoses into plain-language estimates for customers',
      'Manage the repair queue for customers',
    ],
    photos: [],
    relatedWorkIds: [],
  },
  {
    id: 'igt',
    company: 'IGT (International Game Technology)',
    role: 'Multimedia Designer (Internship)',
    period: 'Dec 2023 – Mar 2025',
    shortPeriod: '2023–2025',
    logo: 'igt.png',
    // Original role: 'Multimedia Designer'
    // Original description: 'Remotely employed, invited to join multiple teams (Hoosier Lottery, Powerball, Georgia Lottery, New York Lottery, Caribbean Lottery, and more) to build interactive experiences and digital/physical products.'
    description:
      'Remote internship embedded with brand teams for Powerball, Hoosier Lottery, Georgia Lottery, New York Lottery, and Caribbean Lottery.',
    highlights: [
      'Produced game-launch campaigns (how-to-play video, point-of-sale advertising) used across US and Caribbean markets',
      'Created branding, documentation, animation, and video for lottery brands',
      'Designed and styled decks for retailers, employees, and prospective clients',
      'Developed web components for retailer accounting workflows in HTML, CSS, and JavaScript',
      // Original highlights:
      // 'Produced graphics, documentation, branding, animations, and videos for various brands',
      // 'Created advertising campaigns and supporting material for product launches',
      // 'Design and/or stylize decks meant for retailers, employees, and prospective clients',
      // 'Developed web components for accounting needs using HTML, CSS, and JavaScript',
    ],
    photos: [],
    relatedWorkIds: [2, 3, 4, 7, 12],
  },
  {
    id: 'iu-ta',
    company: 'Indiana University',
    role: 'Undergraduate Teaching Assistant and Lab Instructor', // Original: 'Teaching Assistant and Lab Instructor'
    period: 'Jan 2024 – Mar 2024',
    shortPeriod: '2024',
    logo: 'IU.png',
    description:
      'Instructed a 200-level class of 30 students as an undergraduate, focusing on digital asset creation, storyboarding, and multimedia techniques.',
    highlights: [
      'Instructed a 200-level class at Indiana University of 30 students as an undergraduate',
      'Guided students through a variety of projects using primarily Adobe Creative Cloud',
      'Conducted live demonstrations and tutorials on digital asset creation',
    ],
    photos: [],
    relatedWorkIds: [],
  },
  {
    id: 'nsac',
    company: 'National Student Advertising Competition',
    role: 'Group Leader',
    period: '2023 & 2024',
    shortPeriod: '2023–2024',
    logo: 'NSAC_Logo_color.png',
    description:
      "Led Indiana University's participation in the national advertising competition as a student leader.",
    highlights: [
      "Led a 30 student class, as a student, in Indiana University's participation in the NSAC",
      'Designed our playbook, presentation deck, and many other video/graphic assets',
      'Conducted primary research through surveys and in-person interviews',
    ],
    photos: [],
    relatedWorkIds: [5, 8, 19, 20, 24, 29],
  },
  {
    id: 'brain-twins',
    company: 'Brain Twins',
    role: 'Product Designer',
    period: 'May 2022 – Aug 2023',
    shortPeriod: '2022–2023',
    logo: 'brainTwins.jfif',
    // Original description: 'Remotely employed, developed interactive museum exhibits and custom hardware systems for public installations.'
    description:
      'Remote contract building interactive museum exhibits and the hardware that houses them.',
    highlights: [
      'Built touchscreen Unity installations for public museum exhibits, including the hardware framing that houses them',
      'Built a multi-PC testing rig mirroring exhibit hardware to reproduce issues and troubleshoot installations remotely',
      'Designed and rigged 3D models for animated exhibit content',
      // Original highlights:
      // 'Developed touchscreen Unity installations for museum exhibits',
      // 'Designed and rigged 3D models for animation',
      // 'Built interactive displays, including remote troubleshooting and testing',
    ],
    photos: [],
    relatedWorkIds: [31, 53],
  },
  {
    id: 'ids',
    company: 'Indiana Daily Student',
    role: 'Web Developer and IT Support',
    period: 'Aug 2022 – May 2023',
    shortPeriod: '2022–2023',
    logo: 'ids.jpg',
    // Original description: "Remotely employed, developed web solutions and provided technical support for the university newspaper's digital platform."
    description:
      "Built web pages and provided technical support for the university newspaper's digital platform.",
    highlights: [
      // Original: 'Developed article directories and user-friendly landing pages using HTML, CSS, and JS',
      "Built article directories and special-coverage landing pages in HTML, CSS, and JS, including the paper's Roe v. Wade explainer, still live",
      'Assisted in resolving software, hardware, and coding issues for new hires',
      "Managed integration of digital content into the site's CMS and tracked changes via Git",
    ],
    photos: [],
    relatedWorkIds: [17],
  },
  {
    id: 'shoemaker',
    company: 'Shoemaker Motion Picture',
    role: 'Low-Voltage Technician',
    period: 'Apr 2016 – Jun 2017, Mar 2019 – May 2022, May 2023 – Aug 2023',
    shortPeriod: '2016–2023',
    logo: 'shoemaker.PNG',
    description:
      'Designed and implemented advanced audio, internet, and digital systems for clients, including schools and businesses.',
    highlights: [
      'Implemented advanced audio, internet, and digital systems for schools and businesses',
      'Configured and deployed servers, ran cabling, and programmed AV control systems',
      'Tailored audiovisual and network solutions to meet diverse needs and environments',
    ],
    photos: [],
    relatedWorkIds: [],
  },
]

export default experienceData
