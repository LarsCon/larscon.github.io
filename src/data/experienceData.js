const ASSETS_BASE = import.meta.env.BASE_URL

export function getLogoUrl(filename) {
  return ASSETS_BASE + 'assets/logos/' + filename
}

const experienceData = [
  {
    id: 'ostech',
    company: 'OsTech',
    role: 'Full-Stack Product Designer & Developer',
    period: 'August 2025 – Present',
    shortPeriod: '2025–Present',
    logo: 'ostech.PNG',
    description:
      'Remotely employed, act as the de facto technical brain and hands, turning vague ideas into real, marketable products.',
    highlights: [
      'Handle end to end work: design, development, research, and problem solving',
      'Built multiple client websites, with others in the making',
      'Designed, developed, published, and currently maintaining an app on Android & iOS',
    ],
    photos: [],
    relatedWorkIds: [74, 72, 71],
  },
  {
    id: 'igt',
    company: 'IGT (International Game Technology)',
    role: 'Multimedia Designer',
    reasonForLeaving: 'Reason for Leaving: Internship Ended',
    period: 'Dec 2023 – Mar 2025',
    shortPeriod: '2023–2025',
    logo: 'igt.png',
    description:
      'Remotely employed, invited to join multiple teams (Hoosier Lottery, Powerball, Georgia Lottery, New York Lottery, Caribbean Lottery, and more) to build interactive experiences and digital/physical products.',
    highlights: [
      'Produced graphics, documentation, branding, animations, and videos for various brands',
      'Created advertising campaigns and supporting material for product launches',
      'Design and/or stylize decks meant for retailers, employees, and prospective clients',
      'Developed web components for accounting needs using HTML, CSS, and JavaScript',
    ],
    photos: [],
    relatedWorkIds: [2, 3, 4, 7, 12],
  },
  {
    id: 'iu-ta',
    company: 'Indiana University',
    role: "Teacher's Assistant and Lab Instructor",
    reasonForLeaving: 'Reason for Leaving: Graduated IU',
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
    reasonForLeaving: 'Reason for Leaving: Graduated IU',
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
    reasonForLeaving: 'Reason for Leaving: Contract Completed',
    period: 'May 2022 – Aug 2023',
    shortPeriod: '2022–2023',
    logo: 'brainTwins.jfif',
    description:
      'Remotely employed, developed interactive museum exhibits and custom hardware systems for public installations.',
    highlights: [
      'Developed touchscreen Unity installations for museum exhibits',
      'Designed and rigged 3D models for animation',
      'Built interactive displays, including remote troubleshooting and testing',
    ],
    photos: [],
    relatedWorkIds: [31, 53],
  },
  {
    id: 'ids',
    company: 'Indiana Daily Student',
    role: 'Web Programmer and IT Help',
    reasonForLeaving: 'Reason for Leaving: Pay',
    period: 'Aug 2022 – May 2023',
    shortPeriod: '2022–2023',
    logo: 'ids.jpg',
    description:
      "Remotely employed, developed web solutions and provided technical support for the university newspaper's digital platform.",
    highlights: [
      'Developed article directories and user-friendly landing pages using HTML, CSS, and JS',
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
    reasonForLeaving: 'Reason for Leaving: Going to College',
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
