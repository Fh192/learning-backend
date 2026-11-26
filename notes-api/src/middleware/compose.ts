import type { Req, Res } from "../types.ts"
import { getBaseUrl } from "../utils/getBaseUrl.ts";

export interface Ctx {
    req: Req;
    res: Res;
    url: URL;
    status: number,
    params: Record<string, string | undefined>;
    state: Record<string, unknown>;
    body: unknown;
    request: { body: unknown }
}
export type Next = () => Promise<void>
export type Middleware = (ctx: Ctx, next: Next) => Promise<void>

export function compose(middleware: Middleware[]) {
    return async ({ req, res }: Pick<Ctx, 'req' | 'res'>, next?: Next): Promise<void> => {
        const ctx: Ctx = {
            req,
            res,
            url: new URL(req.url ?? '', getBaseUrl()),
            status: 200,
            params: {},
            state: {},
            body: undefined,
            request: { body: undefined }
        }

        const dispatch = (i: number): Next => async () => {
            const fn = i === middleware.length ? next : middleware[i]
            if (!fn) return

            return await fn(ctx, dispatch(i + 1))
        }

        return dispatch(0)()
    }
}