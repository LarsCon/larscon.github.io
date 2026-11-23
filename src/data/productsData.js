const BASE = import.meta.env.BASE_URL

export function getProductImageUrl(path) {
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
    return path
  }
  return `${BASE}assets/products/${path}`
}

const productsData = [
  {
    id: 'tradewidget',
    title: 'Trade Widget',
    price: 'Free',
    images: ['TradeWidget/1.png', 'TradeWidget/2.png', 'TradeWidget/3.png'],
    description:
      'Import or create collections to display on your own website via my widget! It also has a shop feature, allowing users to submit tickets to the collection owner as order requests.',
    link: 'https://thetraderspot.com/widget',
    linkLabel: 'Try It',
  },
  {
    id: 'keizaalwidget',
    title: 'Keizaal Widget - Skyrim Map',
    price: 'Free',
    images: ['/oldProjects/KeizaalWidget/images/map1.png'],
    // Original description (outdated — the widget now has an Express/MySQL backend):
    // 'A static Skyrim map widget that lets users place and edit markers, zoom, and pan. Designed for GitHub Pages-style hosting without a backend.',
    description:
      'A live, shared Skyrim map for a multiplayer community: players place and edit markers, zoom and pan, and see each other\'s changes in real time. React front end on GitHub Pages, Express and MySQL API on my own Linux server, with server-side logins for editors and commenters.',
    link: 'oldProjects/KeizaalWidget/client/dist/index.html',
    linkLabel: 'Try It',
  },
  {
    id: 'terraria-playmat',
    title: 'Terraria Board Game Playmat',
    price: 'On Etsy',
    images: ['Playmat/1.jpg', 'Playmat/2.jpg', 'Playmat/3.jpg', 'Playmat/4.jpg'],
    description:
      'A CNC-cut pocketed playmat for the Terraria Board Game, designed in Illustrator and cut on a CNC machine I built. The official one is hard to find, so I make and sell my own.',
    link: 'https://lcbuildsstore.etsy.com/listing/4465523514/terraria-board-game-plastic-pocketed',
    linkLabel: 'View on Etsy',
  },
]

export default productsData
