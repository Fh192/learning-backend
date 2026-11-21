import { createWriteStream } from 'node:fs'
import { once } from 'node:events'
import { arrToCsvString, createOrder, getCsvFilePath } from './utils.ts'
import { COLUMNS } from './constants.ts'
import type { Order } from './types.ts'
import type { WriteMode } from './args.ts'


export async function seedOrders(mode: WriteMode, rows: number) {
    const stream = createWriteStream(getCsvFilePath())
    const start = performance.now()
    const rssInterval = setInterval(() => {
        console.error(`${Math.round(performance.now() - start)}ms`, `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)}mb`)
    }, 1000)

    stream
        .on('finish', () => clearInterval(rssInterval))
        .on('error', () => clearInterval(rssInterval))

    stream.write(`${COLUMNS.join(',')}\n`)

    const batch: Order[] = []
    for (let i = 1; i <= rows; i++) {
        batch.push(createOrder(i))

        if (batch.length >= 1000 || i === rows + 1) {
            if (!stream.write(`${arrToCsvString(batch, COLUMNS)}\n`)) {
                if (mode === 'safe') await once(stream, 'drain')
            }

            batch.splice(0)
        }
    }

    stream.end()

    await once(stream, 'finish')
}