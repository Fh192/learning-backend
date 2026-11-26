import { HttpException } from "../errors.ts";
import type { Middleware } from "./compose.ts";

export const errorHandler: Middleware = async (ctx, next) => {
    try {
        await next()
    } catch (err) {
        if (!(err instanceof HttpException)) {
            throw err
        }

        if (!ctx.res.headersSent) {
            ctx.res.statusCode = err.code
        }

        ctx.body = {
            error: {
                code: err.code,
                message: err.message,
                details: err.details
            }
        }
    }
}
