import DummyApp from '../apps/DummyApp'
import AboutMeApp from '../apps/AboutMeApp/AboutMeApp'
import WorkBrowser from '../apps/WorkBrowser/WorkBrowser'
import ExperienceApp from '../apps/ExperienceApp/ExperienceApp'
import EducationApp from '../apps/EducationApp/EducationApp'
import ContactApp from '../apps/ContactApp/ContactApp'
import GamesApp from '../apps/GamesApp/GamesApp'
import GameEmbedApp from '../apps/GamesApp/GameEmbedApp'
import MusicApp from '../apps/MusicApp/MusicApp'
import SettingsApp from '../apps/SettingsApp/SettingsApp'
import gamesData from '../data/gamesData'

const appRegistry = [
  {
    id: 'about-me',
    title: 'About Me',
    icon: 'about-me.svg',
    description: 'Learn about who I am, my interests, and what drives me as a developer.',
    component: AboutMeApp,
    defaultSize: { width: 600, height: 500 },
  },
  {
    id: 'resume',
    title: 'Resume',
    icon: 'resume.svg',
    description: 'View and download my resume.',
    externalUrl: 'https://drive.google.com/file/d/1bMBkPyt4bbTAp-KvzPOeXYmKwynTJZuB/view?usp=sharing',
    component: DummyApp,
    defaultSize: { width: 500, height: 380 },
  },
  {
    id: 'professional-experience',
    title: 'Experience',
    icon: 'experience.svg',
    description: 'Browse my work history, roles, and professional accomplishments.',
    component: ExperienceApp,
    defaultSize: { width: 650, height: 520 },
  },
  {
    id: 'education',
    title: 'Education',
    icon: 'education.svg',
    description: 'View my academic background, degrees, and certifications.',
    component: EducationApp,
    defaultSize: { width: 620, height: 480 },
  },
  {
    id: 'work-browser',
    title: 'Portfolio',
    icon: 'browser.svg',
    description: 'Explore my projects, code samples, and technical portfolio.',
    component: WorkBrowser,
    defaultSize: { width: 1100, height: 750 },
  },
  {
    id: 'games',
    title: 'Games',
    icon: 'games.svg',
    description: 'Take a break and play some fun mini-games.',
    component: GamesApp,
    defaultSize: { width: 620, height: 480 },
  },
  {
    id: 'music',
    title: 'Music',
    icon: 'music.svg',
    description: 'Listen to some tunes while you explore the portfolio.',
    component: MusicApp,
    defaultSize: { width: 420, height: 500 },
  },
  {
    id: 'contact',
    title: 'Contact',
    icon: 'contact.svg',
    description: 'Get in touch, send me a message or find my socials.',
    component: ContactApp,
    defaultSize: { width: 700, height: 480 },
  },
  {
    id: 'help',
    title: 'Help',
    icon: 'help.svg',
    description: 'Learn how to navigate this site and its features.',
    component: DummyApp,
    defaultSize: { width: 500, height: 380 },
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: 'settings.svg',
    description: 'Customize your experience: themes, accessibility, and preferences.',
    component: SettingsApp,
    defaultSize: { width: 680, height: 480 },
  },
]

export default appRegistry

export function getApp(appId) {
  const app = appRegistry.find(a => a.id === appId)
  if (app) return app

  if (appId.startsWith('game-')) {
    const gameId = appId.replace('game-', '')
    const game = gamesData.find(g => g.id === gameId)
    if (game) {
      return {
        id: appId,
        title: game.title,
        icon: 'games.svg',
        component: GameEmbedApp,
        defaultSize: { width: 820, height: 620 },
      }
    }
  }

  return null
}
