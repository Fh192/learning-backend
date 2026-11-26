import type { Middleware } from "./compose";

export const logger: Middleware = async (ctx, next) => {
    const start = performance.now()

    try {
        await next()
    } finally {
        const ms = performance.now() - start
        console.error(`${ctx.req.method} ${ctx.url.pathname} - ${ctx.res.statusCode} (${ms.toFixed(2)}ms)`)
    }
}