import { HttpException, InternalServerErrorException } from "../errors.ts";
import type { Middleware } from "./compose.ts";

export const errorHandler: Middleware = async (ctx, next) => {
    try {
        await next()
    } catch (e) {
        const error = e instanceof HttpException ? e : new InternalServerErrorException()

        if (error instanceof InternalServerErrorException) {
            console.error(e)
        }

        ctx.status = error.code
        ctx.body = {
            error: {
                code: error.code,
                message: error.message,
                details: error.details
            }
        }
    }
}
