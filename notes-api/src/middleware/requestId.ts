import crypto from 'node:crypto'
import type { Middleware } from "./compose.ts";

const HEADER = 'x-request-id' as const

const parseHeader = (requestId: unknown): string => {
    if (typeof requestId === 'string' && requestId.length <= 36) {
        return requestId
    }

    return crypto.randomUUID()
}

export const requestId: Middleware = async (ctx, next) => {
    const requestId = parseHeader(ctx.req.headers[HEADER])
    ctx.res.setHeader(HEADER, requestId)
    ctx.state.requestId = requestId
    await next()
}