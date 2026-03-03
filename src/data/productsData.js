const BASE = import.meta.env.BASE_URL

export function getProductImageUrl(path) {
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
    id: 'playmat',
    title: 'Terraria Board Game - Plastic Pocketed Playmat',
    price: '$99.99',
    images: [
      'Playmat/1.jpg',
      'Playmat/2.jpg',
      'Playmat/3.jpg',
      'Playmat/4.jpg',
    ],
    description:
      "This is a 14 piece CNC milled puzzled pocketed playmat for the Terraria Board Game.\n\nMy friends and I found it difficult to play without a playmat, so I designed a pocketed playmat to hold down game pieces during play. This is truly a game changer, even allowing you to pocket the map pieces upside down to be flipped as players progress!",
    link: 'https://lcbuildsstore.etsy.com/listing/4465523514/terraria-board-game-plastic-pocketed',
    linkLabel: 'Buy Now',
  },
]

export default productsData
