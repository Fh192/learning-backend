import { readFile, rename, rm, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { isError } from "./isError.ts"

export async function readJson<T>(path: string, defaultValue: T): Promise<T> {
    try {
        const contents = await readFile(path, { encoding: "utf-8" })
        return JSON.parse(contents)
    } catch (err) {
        if (isError(err) && err.code === 'ENOENT') {
            return defaultValue
        }

        throw err
    }
}

let writeQueue: Promise<void> = Promise.resolve()
export async function writeJson(path: string, data: string) {
    const tmpFilePath = resolve(`${path}.tmp-${process.pid}`)

    const run = writeQueue.then(async () => {
        try {
            await writeFile(tmpFilePath, data)
            await rename(tmpFilePath, path)
        } catch (err) {
            await rm(tmpFilePath, { force: true }).catch(() => { })
            throw err
        }
    })

    writeQueue = run.catch(() => { })

    return run
}