import http from 'node:http'
import cluster from "node:cluster";
import os from 'node:os'
import { compose } from './middleware/compose.ts'
import { errorHandler } from './middleware/errorHandler.ts'
import { cors } from './middleware/cors.ts'
import { requestId } from './middleware/requestId.ts'
import { logger } from './middleware/logger.ts'
import { router } from './router/index.ts'
import { respond } from './middleware/respond.ts'
import { body } from './middleware/body.ts'
import { NotesService } from './services/notes/notes.service.ts'
import { registerHealthRoutes } from './routes/health.ts'
import { registerNotesRoutes } from './routes/notes.ts'

const isClusterMode = process.env.CLUSTER === 'true'

if (isClusterMode && cluster.isPrimary) {
    console.error(`Main process ${process.pid} started`);
    const numCPUs = os.availableParallelism()
    let restartCount = 0

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork()
    }

    const interval = setInterval(() => {
        restartCount = 0
    }, 60_000).unref()

    cluster.on('exit', (worker, code, signal) => {
        console.error(`Worker ${worker.process.pid} died ${signal || code}`)
        if (worker.exitedAfterDisconnect) return

        console.error(`Restarting worker ${worker.process.pid}...`)

        if (restartCount < 5) {
            cluster.fork()
            restartCount += 1
        } else {
            clearInterval(interval)
        }
    })



    let sigCallsCount = 0
    const handleShutdown = async (signal: 'SIGINT' | 'SIGTERM') => {
        const exitCode = signal === 'SIGTERM' ? 143 : 130

        if (++sigCallsCount > 1) {
            process.exit(exitCode)
        }

        const timeout = setTimeout(() => {
            process.exit(exitCode)
        }, 10_000)

        cluster.disconnect(() => {
            process.exitCode = exitCode
            clearTimeout(timeout)
        })
    }

    process.on('SIGTERM', handleShutdown).on('SIGINT', handleShutdown)
} else {
    const app = compose([respond, requestId, logger, errorHandler, cors, body, router.registerMiddleware()])
    const notesService = new NotesService()
    notesService.init()

    registerHealthRoutes(router)
    registerNotesRoutes(router, notesService)

    const server = http.createServer(async (req, res) => {
        app({ req, res }).catch((err) => {
            console.error(err)
            if (!res.headersSent) res.statusCode = 500
            res.end()
        })
    })

    server.requestTimeout = 60 * 1000
    server.listen(Number(process.env.PORT ?? 3000))

    let sigCallsCount = 0
    const handleShutdown = async (signal: 'SIGINT' | 'SIGTERM') => {
        const exitCode = signal === 'SIGTERM' ? 143 : 130

        if (++sigCallsCount > 1) {
            process.exit(exitCode)
        }

        const timeout = setTimeout(() => {
            server.closeAllConnections()
            process.exit(exitCode)
        }, 10_000)

        server.close((err) => {
            if (err) console.error(err)

            clearTimeout(timeout)
            process.exitCode = exitCode
        })
    }

    process.on('SIGTERM', handleShutdown).on('SIGINT', handleShutdown)

    if (isClusterMode) {
        console.error(`Worker ${process.pid} started`);
    }
}
