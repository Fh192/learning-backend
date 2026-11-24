import { MethodNotAllowedException, NotFoundException } from "../errors.ts";
import type { Req, Res } from "../types.ts";
import { getBaseUrl } from "../utils/getBaseUrl.ts"; 
import { routes, type RouteMethod, type RoutePath } from "./routes.ts";

function validateMethod<T extends RoutePath>(pathname: T, method: string): method is RouteMethod<T> {
    return Object.hasOwn(routes[pathname], method)
}

function extractRoutePath(url: URL): RoutePath | undefined {
    for (const path of Object.keys(routes) as RoutePath[]) {
        const pattern = new URLPattern(path, 'http://localhost');
        if (pattern.exec(url)) return path
    }
}

export async function router(req: Req, res: Res) {
    const url =  new URL(req.url ?? '', getBaseUrl()) 
    const routePath = extractRoutePath(url)
    const method = req.method ?? ''

    if (!routePath) {
        throw new NotFoundException(`Endpoint '${url.pathname}' not found`)
    }

    if (!validateMethod(routePath, method)) {
        res.setHeader('allow', Object.keys(routes[routePath]))
        throw new MethodNotAllowedException(`Method ${method} not allowed on '${routePath}' endpoint`)
    }

    return routes[routePath][method](req, res)
}

// type MiddlewareFn = (req: Req, res: Res, next: () => void) => void | Promise<void>

// class Router {
//     private routes: Map<string, Partial<Record<Method, MiddlewareFn[]>>> = new Map()
//     private server: http.Server

//     private register(method: Method, path: string, fn: MiddlewareFn) {
//         const route = this.routes.getOrInsert(path, {})
//         const middlewares = route[method] ?? []
//         this.routes.set(path, { ...route, [method]: [...middlewares, fn] })
//     }

//     constructor() {
//         this.server = http.createServer((req, res) => {
//     const url = new URL(req.url ?? '', 'http://localhost')
//     const routePath = extractRoutePath(url)
//     const method = req.method ?? ''


//     if(!routePath || !this.routes.has(routePath)) {
//         throw new NotFoundException(`Endpoint '${url.pathname}' not found`)
//     }
            
//         })
//     }

//     get(path: string, fn: MiddlewareFn) {
//         this.register('GET', path, fn)
//     }

//     post(path: string, fn: MiddlewareFn) {
//         this.register('POST', path, fn)
//     }

//     put(path: string, fn: MiddlewareFn) {
//         this.register('PUT', path, fn)
//     }

//     delete(path: string, fn: MiddlewareFn) {
//         this.register('DELETE', path, fn)
//     }
// }

