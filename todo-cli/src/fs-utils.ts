import { readFileSync } from 'node:fs'
import { extname, resolve } from 'node:path'
import { UsageError } from './errors.ts'
import { isError } from './helpers.ts'
import { writeFile, rename, rm } from 'node:fs/promises'

function getTmpFilePath(path: string) {
    return resolve(`${path}.tmp-${process.pid}`)
}

export async function writeJsonAtomic(path: string, data: string) {
    const tmpFilePath = getTmpFilePath(path)

    try {
        await writeFile(tmpFilePath, data)
        await rename(tmpFilePath, path)
    } catch (err) {
        await rm(tmpFilePath, { force: true }).catch(() => { })
        throw err
    }
}

export function readJson<T>(path: string, defaultValue: T): T {
    try {
        return JSON.parse(readFileSync(path, { encoding: "utf-8" }))
    } catch (err) {
        if (isError(err) && err.code === 'ENOENT') {
            return defaultValue
        }

        throw err
    }
}

export function getTodoFilePath() {
    const filePath = resolve(process.cwd(), process.env.TODO_FILE || './todo.json')

    if (extname(filePath) !== '.json') {
        throw new UsageError('Файл должен быть в формате ".json"')
    }

    return filePath
}

