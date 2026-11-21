import { createReadStream, createWriteStream, ReadStream } from 'node:fs'
import { getCsvFilePath, monitorRss } from './utils.ts'
import { pipeline } from 'node:stream/promises'
import { BIG_ORDERS_FILE_NAME, COLUMNS, ORDERS_FILE_NAME } from './constants.ts'

function parseLine(line: string) {
    const [, userId = '', game = '', price = ''] = line.split(',')
    return { userId: Number(userId), game, price: Number(price) }
}

async function* splitLines(source: ReadStream) {
    let rest = ''

    for await (const chunk of source) {
        const parts = (rest + chunk).split(/\r?\n/)
        rest = parts.pop()!
        yield* parts

    }

    if (rest) yield rest
}

export async function aggregate(bigOrderPriceThreshold?: number) {
    const stopMonitor = monitorRss()

    try {
        const readStream = createReadStream(getCsvFilePath(ORDERS_FILE_NAME), { encoding: 'utf-8' })
        const writeStream = createWriteStream(getCsvFilePath(BIG_ORDERS_FILE_NAME), { encoding: 'utf-8' })

        const gameRevenue = new Map<string, number>()
        const userOrdersSum = new Map<number, number>()

        let isFirstLineSkipped = false
        let failedLines = 0

        await pipeline(readStream, splitLines, async function* (source) {
            for await (const chunk of source) {
                if (!isFirstLineSkipped) {
                    isFirstLineSkipped = true
                    yield `${COLUMNS.join(',')}\n`
                    continue
                }

                const { userId, game, price } = parseLine(chunk)

                if (Number.isNaN(userId) || Number.isNaN(price)) {
                    failedLines++
                    continue
                }

                gameRevenue.set(game, gameRevenue.getOrInsert(game, 0) + price)
                userOrdersSum.set(userId, userOrdersSum.getOrInsert(userId, 0) + price)

                if (bigOrderPriceThreshold && price >= bigOrderPriceThreshold) {
                    yield `${chunk}\n`
                }
            }
        }, writeStream)

        console.log(`Skipped ${failedLines} lines`)
        console.log([...userOrdersSum.entries()].sort(([, a], [, b]) => b - a).slice(0, 5).map(([id, sum]) => ({ [id]: (sum / 100).toFixed(2) })))
        console.log(Object.fromEntries([...gameRevenue.entries()].map(([game, revenue]) => [game, (revenue / 100).toFixed(2)])))

    } catch (err) {
        if (err instanceof Error && 'code' in err && err.code === 'ENOENT') {
            throw new Error(`File "${getCsvFilePath(ORDERS_FILE_NAME)}" not found`)
        }

        throw err
    } finally {
        stopMonitor()
    }

}
