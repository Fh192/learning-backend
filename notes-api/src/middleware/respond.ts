import type { Middleware } from "./compose";

export const respond: Middleware = async (ctx, next) => {
    await next()

    if (ctx.body === undefined) {
        ctx.status = 204
    }

    let contentLength = 0
    const isJSON = typeof ctx.body === 'object'
    const data = isJSON ? JSON.stringify(ctx.body) : ctx.body

    if (typeof data === 'string') {
        contentLength = Buffer.byteLength(data)
        ctx.res.setHeader('content-type', `${isJSON ? 'application/json' : 'text/plain'}; charset=utf-8`)
        ctx.res.setHeader('content-length', contentLength)
    }

    ctx.res.writeHead(ctx.status).end(data)
}