const ASSETS_BASE = import.meta.env.BASE_URL

export function getImageUrl(path) {
  return ASSETS_BASE + path
}

const gamesData = [
  {
    id: 'colonized',
    title: 'Colonized',
    image: 'assets/programming/colonized.png',
    description: 'A horror-like space game built with Construct 3. Created as a final assignment at Indiana University.',
    tags: ['Construct 3', '2024'],
    embedUrl: 'https://tekatek.itch.io/colonized',
    itchUrl: 'https://tekatek.itch.io/colonized',
    embeddable: true,
  },
  {
    id: 'timeless-retrace',
    title: 'Timeless Retrace',
    image: 'assets/programming/CoverPhoto.png',
    description: 'A 2D platformer from a 48-hour game jam. Travel from space to the bronze age across themed levels.',
    tags: ['Godot', '2023'],
    embedUrl: 'https://tekatek.itch.io/timeless-retrace',
    itchUrl: 'https://tekatek.itch.io/timeless-retrace',
    embeddable: true,
  },
  {
    id: '3d-maze-game',
    title: '3D Maze Game',
    image: 'assets/programming/cover1.png',
    description: 'An introduction to 3D game development built during studies at Indiana University.',
    tags: ['Godot', '2023'],
    embedUrl: 'https://tekatek.itch.io/3d-maze-game',
    itchUrl: 'https://tekatek.itch.io/3d-maze-game',
    embeddable: true,
  },
  {
    id: 'brick-breaker',
    title: 'Brick Breaker',
    image: 'assets/programming/cover.png',
    description: 'A brick-breaking game exploring tweening and animation concepts.',
    tags: ['Godot', '2023'],
    embedUrl: 'https://tekatek.itch.io/brick-breaker',
    itchUrl: 'https://tekatek.itch.io/brick-breaker',
    embeddable: true,
  },
  {
    id: 'golf-game',
    title: 'Golf Game',
    image: 'assets/programming/GolfGame.png',
    description: 'First project in the Unreal game engine during studies at Indiana University.',
    tags: ['Unreal', '2024'],
    embedUrl: null,
    itchUrl: 'https://tekatek.itch.io/golf-game',
    embeddable: false,
  },
]

export default gamesData
