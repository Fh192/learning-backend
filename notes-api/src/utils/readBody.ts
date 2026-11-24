import { once } from "node:events";
import { BadRequestException, PayloadTooLargeException } from "../errors.ts";
import type { Req } from "../types.ts";

export async function readBody(req: Req) {
    const LIMIT = 1024 * 1024;
    const body: Uint8Array[] = []
    let size = 0

    req.on('data', (chunk) => {
        size += chunk.length

        if (size > LIMIT) {
            throw new PayloadTooLargeException()
        }

        body.push(chunk)
    })
    await once(req, 'end')

    console.log(body)


    return Buffer.concat(body).toString()
}

export async function json(req: Req): Promise<unknown> {
    try {
        const body = await readBody(req)
        return JSON.parse(body)
    } catch (err) {
        if (err instanceof SyntaxError) {
            throw new BadRequestException()
        }

        throw err
    }
}