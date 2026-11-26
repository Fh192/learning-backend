import type { Middleware } from "./compose.ts";

const allowed = (process.env['CORS_ORIGINS'] ?? '*').split(',').map(v => v.trim()).filter(Boolean)

export const cors: Middleware = async (ctx, next) => {
    const origin = ctx.req.headers['origin']

    if (origin && (allowed.includes('*') || allowed.includes(origin))) {
        ctx.res.setHeader('Access-Control-Allow-Origin', origin);
        ctx.res.setHeader('Vary', 'Origin');
    }

    if (ctx.req.method === 'OPTIONS') {
        ctx.res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        ctx.res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        ctx.status = 204
        return
    }

    await next()

}