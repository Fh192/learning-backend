import crypto from 'node:crypto'
import type { Middleware } from "./compose.ts";

export const requestId: Middleware = async (ctx, next) => {
    const requestId = ctx.req.headers['X-Request-Id'] || crypto.randomUUID()
    ctx.res.setHeader('X-Request-Id', requestId)
    ctx.state.requestId = requestId
    await next()
}