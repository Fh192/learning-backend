import { parseArgs as utilParseArgs } from 'node:util'
import { DEFAULT_ROWS } from './constants.ts'

export type WriteMode = 'safe' | 'unsafe'

function validateMode(mode: string): mode is WriteMode {
    return mode === 'safe' || mode === 'unsafe'
}

function validateRows(rows: string): rows is `${number}` {
    return !Number.isNaN(+rows) && Number.isInteger(+rows) && +rows > 0
}

function validateOptions(options: { mode: string, rows: string }) {
    if (!validateMode(options.mode)) {
        throw new Error('Invalid mode, only "safe" and "unsafe" is allowed')
    }

    if (!validateRows(options.rows)) {
        throw new Error('Rows options should be an integer and greater than 0')
    }
}

export function parseArgs() {
    const { positionals, values } = utilParseArgs({
        allowPositionals: true,
        options: {
            rows: {
                type: 'string',
                short: 'r',
                default: `${DEFAULT_ROWS}`
            },
            mode: {
                type: 'string',
                short: 'm',
                default: 'safe'
            }
        }
    })

    validateOptions(values)

    return {
        positionals,
        values: {
            mode: values.mode as WriteMode,
            rows: +values.rows
        }
    }
}