import crypto from 'node:crypto'
import type { Middleware } from "./compose.ts";

export const requestId: Middleware = async (ctx, next) => {
    const requestId = ctx.req.headers['request-id'] || crypto.randomUUID()
    ctx.res.setHeader('request-id', requestId)
    await next()
}