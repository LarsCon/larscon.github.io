const ASSETS_BASE = import.meta.env.BASE_URL

export function getLogoUrl(filename) {
  return ASSETS_BASE + 'assets/logos/' + filename
}

const educationData = [
  {
    id: 'iu',
    company: 'Indiana University',
    role: 'Bachelor of Arts in Interactive Media',
    period: 'Graduated December 2024',
    shortPeriod: '2022–2024',
    logo: 'IU.png',
    description:
      'Completed comprehensive studies in media production, digital design, and interactive technologies.',
    highlights: [
      'Group Leader, Graphic Designer, Budgeteer, Developer, Presenter for the National Student Advertising Competition, 2023 & 2024',
      'Developer, Designer, Animator for the Indiana University Game Jam, 2023',
      'Honor Roll, Spring and Fall 2022, Spring 2023',
    ],
    photos: [],
    relatedWorkIds: [5, 8, 6, 11, 13, 14, 15, 25, 26, 27, 29, 33, 34, 36, 50, 39, 40, 44, 49, 52, 53, 56, 58, 61, 67],
  },
  {
    id: 'herron',
    company: 'Herron School of Art & Design',
    role: 'Bachelor of Arts in Visual Communication',
    period: 'August 2021 – May 2022',
    shortPeriod: '2021–2022',
    logo: 'herron.png',
    description:
      'Focused on visual communication design, typography, and creative problem-solving through design.',
    highlights: [
      'Designer, Artist, Machinist for the Herron School of Art and Design Group Art Exhibition, 2021',
      'Developed strong foundation in design principles and visual communication',
      'Explored various media and design methodologies',
    ],
    photos: [],
    relatedWorkIds: [9, 18, 23, 37, 51, 60, 68],
  },
  {
    id: 'eleven-fifty',
    company: 'Eleven Fifty Programming Academy',
    role: 'Programming Certification',
    period: 'December 2018 – February 2019',
    shortPeriod: '2018–2019',
    logo: 'elevenFifty.png',
    description:
      'Intensive programming bootcamp focused on web development and software engineering fundamentals.',
    highlights: [
      'Learned modern web development technologies and methodologies',
      'Developed practical programming skills through hands-on projects',
      'Gained understanding of software development lifecycle',
    ],
    photos: [],
    relatedWorkIds: [],
  },
  {
    id: 'iupui',
    company: 'Indiana University Purdue University of Indianapolis',
    role: 'Bachelor of Science in Information Technology',
    period: 'August 2015 – May 2018',
    shortPeriod: '2015–2018',
    logo: 'iupui.png',
    description:
      'Studied information technology with focus on systems, networks, and technical infrastructure.',
    highlights: [
      'Developed strong technical foundation in IT systems and infrastructure',
      'Gained practical experience with networking and system administration',
    ],
    photos: [],
    relatedWorkIds: [21, 35, 42, 43, 45, 46, 47, 48],
  },
]

export default educationData
