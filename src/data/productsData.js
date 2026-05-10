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
    description:
      'A static Skyrim map widget that lets users place and edit markers, zoom, and pan. Designed for GitHub Pages-style hosting without a backend.',
    link: 'oldProjects/KeizaalWidget/client/dist/index.html',
    linkLabel: 'Try It',
  }
]

export default productsData
