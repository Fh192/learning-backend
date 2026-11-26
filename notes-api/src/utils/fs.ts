import { rename, rm, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { isError } from "./isError.ts"
import { readFileSync } from "node:fs"

export function readJson<T>(path: string, defaultValue: T): T {
    try {
        const contents = readFileSync(path, { encoding: "utf-8" })
        return JSON.parse(contents)
    } catch (err) {
        if (isError(err) && err.code === 'ENOENT') {
            return defaultValue
        }

        throw err
    }
}

export async function writeJson(path: string, data: string) {
    const tmpFilePath = resolve(`${path}.tmp-${process.pid}`)

    try {
        await writeFile(tmpFilePath, data)
        await rename(tmpFilePath, path)
    } catch (err) {
        await rm(tmpFilePath, { force: true }).catch(() => { })
        throw err
    }
}