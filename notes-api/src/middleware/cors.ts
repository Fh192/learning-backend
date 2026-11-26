import type { Middleware } from "./compose.ts";

export const cors: Middleware = async (ctx, next) => {
    if (ctx.req.method === 'OPTIONS') {
        ctx.res.statusCode = 204
        ctx.res.end()
        return
    }

    ctx.res.setHeader('Access-Control-Allow-Origin', process.env['CORS_ORIGINS'] ?? '*');
    ctx.res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    ctx.res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    await next()
}