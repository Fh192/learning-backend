import { Router } from "../router/index.ts"

export function registerHealthRoutes(router: Router) {
    router.get('/health', async (ctx, next) => {
        ctx.body = { status: 200 }
        return next()
    })
}

