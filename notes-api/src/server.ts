import http from 'node:http'
import { HttpException } from './errors.ts'
import { router } from './router/index.ts'
import type { Req, Res } from './types.ts'

function cors(req: Req, res: Res) {
    if (req.method === 'OPTIONS') {
        res.statusCode = 204
        res.end()
    }

    res.setHeader('Access-Control-Allow-Origin', process.env['CORS_ORIGINS'] ?? '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

function handleServerError(err: unknown, res: Res) {
    console.error(err)

    if (err instanceof HttpException) {
        res.statusCode = err.code
        res.end(JSON.stringify({
            error: {
                code: err.code,
                message: err.message,
                details: err.details
            }
        }))
    } else {
        res.statusCode = 500
        res.end()
    }
}

const server = http.createServer(async (req, res) => {
    try {
        res.on('error', (err) => handleServerError(err, res))
        req.on('error', (err) => handleServerError(err, res))

        res.statusCode = 200
        res.setHeader('content-type', 'application/json')

        cors(req, res)

        await router(req, res)
    } catch (err) {
        handleServerError(err, res)
    }
})

server.requestTimeout = 60 * 1000
server.listen(3000)

