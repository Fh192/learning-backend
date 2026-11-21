import { parseArgs as utilParseArgs } from 'node:util'
import { DEFAULT_ROWS } from './constants.ts'

export type WriteMode = 'safe' | 'unsafe'

function numberOptionValidation(value: string): value is `${number}` {
    return !Number.isNaN(+value) && Number.isInteger(+value) && +value > 0
}

function validateMode(mode: string): mode is WriteMode {
    return mode === 'safe' || mode === 'unsafe'
}

function validateRows(rows: string): rows is `${number}` {
    return numberOptionValidation(rows)
}

function validateThreshold(threshold: string): threshold is `${number}` {
    return numberOptionValidation(threshold)
}

function validateOptions(options: { mode: string, rows: string, threshold?: string }) {
    if (!validateMode(options.mode)) {
        throw new Error('Invalid mode, only "safe" and "unsafe" is allowed')
    }

    if (!validateRows(options.rows)) {
        throw new Error('Rows option should be an integer and greater than 0')
    }

    if (options.threshold && !validateThreshold(options.threshold)) {
        throw new Error('Threshold option should be an integer and greater than 0')
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
            },
            threshold: {
                type: 'string',
                short: 't',
            }
        }
    })

    validateOptions(values)

    return {
        positionals,
        values: {
            mode: values.mode as WriteMode,
            rows: +values.rows,
            threshold: values.threshold ? +values.threshold : undefined
        }
    }
}