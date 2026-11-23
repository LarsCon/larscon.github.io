const ASSETS_BASE = import.meta.env.BASE_URL

export function getLogoUrl(filename) {
  return ASSETS_BASE + 'assets/logos/' + filename
}

const educationData = [
  {
    id: 'iu',
    company: 'Indiana University',
    // Original, DO NOT re-enable — transcript shows degree is "B.A., Major: Media, Concentration:
    // Interactive and Digital Media" and cumulative GPA 2.85, not 3.5:
    // role: 'Bachelor of Arts in Interactive Media',
    // status: 'Graduated, 3.5 GPA',
    role: 'B.A. in Media, Interactive and Digital Media concentration',
    status: 'Graduated December 2024',
    period: 'August 2022 – December 2024',
    shortPeriod: '2022–2024',
    logo: 'IU.png',
    // Original description: 'Completed comprehensive studies in media production, digital design, and interactive technologies.'
    description:
      'The Media School, College of Arts and Sciences. Coursework spanning web and mobile design, game development, physical computing, animation, and graphic design.',
    highlights: [
      'Group Leader, Graphic Designer, Budgeteer, Developer, Presenter for the National Student Advertising Competition, 2023 & 2024',
      'Developer, Designer, Animator for the Indiana University Game Jam, 2023',
      'Relevant coursework: Web and Mobile Design (A+), Prototyping with Arduino Tools (A+), Game Technology (A), Projects in Media (A), Graphic Design I (A), HCI/Interaction Design',
      // Original, DO NOT re-enable without documentation — the transcript records no honors,
      // and Spring 2023 was a 3.11 semester:
      // 'Honor Roll, Spring and Fall 2022, Spring 2023',
    ],
    photos: [],
    relatedWorkIds: [5, 8, 6, 11, 13, 14, 15, 25, 26, 27, 29, 33, 34, 36, 50, 39, 40, 44, 49, 52, 53, 56, 58, 61, 67],
  },
  {
    id: 'herron',
    company: 'Herron School of Art & Design',
    // Original, DO NOT re-enable — no degree was earned at Herron (two semesters, then transferred):
    // role: 'Bachelor of Arts in Visual Communication',
    // status: 'Transferred to Indiana University',
    role: 'Art and design foundation coursework',
    status: 'Transferred to Indiana University Bloomington, 3.87 GPA at Herron',
    period: 'August 2021 – May 2022',
    shortPeriod: '2021–2022',
    logo: 'herron.png',
    // Original description: 'Focused on visual communication design, typography, and creative problem-solving through design.'
    description:
      'Two semesters of studio foundations: drawing, 2D and 3D design, studio art and technology, and fabrication.',
    highlights: [
      'Designer, Artist, Machinist for the Herron School of Art and Design Group Art Exhibition, 2021',
      'Coursework: Drawing I & II, Two- and Three-Dimensional Design, Studio Art and Technology, Building and Making, Image: 4D Studio, History of Art I & II',
      // Original highlights:
      // 'Developed strong foundation in design principles and visual communication',
      // 'Explored various media and design methodologies',
    ],
    photos: [],
    relatedWorkIds: [9, 18, 23, 37, 51, 60, 68],
  },
  {
    id: 'eleven-fifty',
    company: 'Eleven Fifty Programming Academy',
    role: 'Programming Certification',
    status: 'Completed',
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
    // Original, DO NOT re-enable — no B.S. was earned (attended 2015–2018, withdrew):
    // role: 'Bachelor of Science in Information Technology',
    role: 'Coursework in Information Technology and Informatics',
    status: 'Attended 2015 – 2018',
    period: 'August 2015 – May 2018',
    shortPeriod: '2015–2018',
    logo: 'iupui.png',
    // Original description: 'Studied information technology with focus on systems, networks, and technical infrastructure.'
    description:
      'Began in information technology, then informatics. Coursework covered web design, networking, databases, and human-computer interaction.',
    highlights: [
      'Coursework: Web Site Design, Data Communications, Intro to Data Management, Information Technology Fundamentals, Human-Computer Interaction',
      // Original highlights:
      // 'Developed strong technical foundation in IT systems and infrastructure',
      // 'Gained practical experience with networking and system administration',
      // DO NOT re-enable — Spring 2017 was a 0.97 semester on the transcript:
      // 'Honor Roll, Spring 2017'
    ],
    photos: [],
    relatedWorkIds: [21, 35, 42, 43, 45, 46, 47, 48],
  },
]

export default educationData
