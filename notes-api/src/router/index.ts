import { METHODS } from "node:http";
import type { Method } from "../constants/methods.ts";
import { MethodNotAllowedException, NotFoundException } from "../errors.ts";
import type { Ctx, Middleware } from "../middleware/compose.ts";
import { getBaseUrl } from "../utils/getBaseUrl.ts";

export class Router {
    private routes: Map<string, Partial<Record<Method, Middleware>>> = new Map()

    private register(method: Method, path: string, fn: Middleware) {
        const route = this.routes.getOrInsert(path, {})

        if (route[method]) {
            throw new Error(`${method} handler for ${path} already registered`)
        }

        this.routes.set(path, { ...route, [method]: fn })
    }

    private extractRouteFromUrl(url: URL): { path: string, pattern: URLPattern } | null {
        for (const path of this.routes.keys()) {
            const pattern = new URLPattern(path, getBaseUrl());
            const patternResult = pattern.exec(url)
            if (patternResult) return { path, pattern }
        }

        return null
    }

    private validateMethod(method: string): method is Method {
        for (let i = 0; i < METHODS.length; i++) {
            if (method === METHODS[i]) return true
        }

        return false
    }

    private validateRoute(ctx: Ctx) {
        const route = this.extractRouteFromUrl(ctx.url)
        const method = ctx.req.method ?? ""

        if (!route) {
            throw new NotFoundException(`Endpoint '${ctx.url.pathname}' not found`)
        }

        if (!this.validateMethod(method)) {
            throw new MethodNotAllowedException(`Unknown method '${method}'`)
        }

        if (!this.routes.get(route.path)?.[method]) {
            ctx.res.setHeader('Allow', Object.keys(this.routes.get(route.path) ?? {}).join(', '))
            throw new MethodNotAllowedException(`Method ${method} not allowed on '${route.path}' endpoint`)
        }

        ctx.params = route.pattern.exec(ctx.url)?.pathname.groups ?? {}

        return { route, method }
    }

    registerMiddleware(): Middleware {
        return async (ctx, next) => {
            const { route, method } = this.validateRoute(ctx)
            const fn = this.routes.get(route.path)![method]!
            await fn(ctx, next)
        }
    }

    get(path: string, fn: Middleware) {
        this.register('GET', path, fn)
    }

    post(path: string, fn: Middleware) {
        this.register('POST', path, fn)
    }

    put(path: string, fn: Middleware) {
        this.register('PUT', path, fn)
    }

    patch(path: string, fn: Middleware) {
        this.register('PATCH', path, fn)
    }

    delete(path: string, fn: Middleware) {
        this.register('DELETE', path, fn)
    }
}

export const router = new Router()
