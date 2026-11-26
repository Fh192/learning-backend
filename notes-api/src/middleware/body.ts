import { BadRequestException, PayloadTooLargeException, UnsupportedMediaTypeException } from "../errors.ts";
import type { Req } from "../types.ts";
import type { Middleware } from "./compose.ts";

const BODY_LIMIT = 1024 * 1024;

async function readBody(req: Req) {
    const body: Uint8Array[] = []
    let size = 0

    for await (const chunk of req) {
        size += chunk.length

        if (size > BODY_LIMIT) {
            throw new PayloadTooLargeException()
        }

        body.push(chunk)
    }

    return Buffer.concat(body).toString()
}

async function json(req: Req): Promise<unknown> {
    try {
        const body = await readBody(req)
        return JSON.parse(body)
    } catch (err) {
        if (err instanceof SyntaxError) {
            throw new BadRequestException('Invalid JSON')
        }

        throw err
    }
}

export const body: Middleware = async (ctx, next) => {
    if (!ctx.req.method || !['POST', 'PUT', 'PATCH'].includes(ctx.req.method)) {
        return next()
    }

    const [contentType] = (ctx.req.headers['content-type'] ?? '')?.split(';')

    if (contentType !== 'application/json') {
        throw new UnsupportedMediaTypeException()
    }

    if (Number(ctx.req.headers['content-length']) > BODY_LIMIT) {
        throw new PayloadTooLargeException()
    }

    ctx.request.body = await json(ctx.req)

    await next()
}