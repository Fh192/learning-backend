
export const DEFAULT_ROWS = 1_000_000
export const COLUMNS = ['id', 'user_id', 'game', 'price', 'created_at'] as const
export const FILE_NAME = './orders.csv'
export const GAMES = [
    { name: 'Дота 2', priceCents: 59203 },
    { name: 'Майнкрафт', priceCents: 249999 },
    { name: 'Сталкер', priceCents: 349999 },
    { name: 'Фортнайт', priceCents: 100000 },
    { name: 'Ведьмак', priceCents: 220011 },
    { name: 'Танки', priceCents: 70070 }
]