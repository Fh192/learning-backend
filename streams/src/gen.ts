import { createWriteStream } from 'node:fs'
import { once } from 'node:events'
import { arrToCsvString, createOrder, getCsvFilePath, monitorRss } from './utils.ts'
import { COLUMNS, ORDERS_FILE_NAME } from './constants.ts'
import type { Order } from './types.ts'
import type { WriteMode } from './args.ts'


export async function seedOrders(mode: WriteMode, rows: number) {
    const stopMonitor = monitorRss()

    try {
        const stream = createWriteStream(getCsvFilePath(ORDERS_FILE_NAME))
        stream.write(`${COLUMNS.join(',')}\n`)

        const batch: Order[] = []

        async function writeButch() {
            const ok = stream.write(`${arrToCsvString(batch, COLUMNS)}\n`)

            if (!ok && mode === 'safe') {
                await once(stream, 'drain')
            }

            batch.splice(0)
        }

        for (let i = 1; i <= rows; i++) {
            batch.push(createOrder(i))
            if (batch.length >= 1000) writeButch()
        }

        if (batch.length) writeButch()

        stream.end()

        await once(stream, 'finish')
    } finally {
        stopMonitor()
    }
}   