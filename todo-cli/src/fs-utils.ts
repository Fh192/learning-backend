import { readFileSync, writeFileSync, renameSync } from 'node:fs'
import { resolve } from 'node:path'
import { UsageError } from './errors.ts'
import { isError } from './helpers.ts'

export function writeJsonAtomic(path: string, data: string) {
    const tmpFilePath = resolve(process.cwd(), `./todo.json.tmp-${process.pid}`)
    writeFileSync(tmpFilePath, data)
    renameSync(tmpFilePath, path)
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

    if (filePath.split('.').at(-1) !== 'json') {
        throw new UsageError('Файл должен быть в формате ".json"')
    }

    return filePath
}

