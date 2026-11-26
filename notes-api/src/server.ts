import http from 'node:http'
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

const app = compose([respond, requestId, logger, errorHandler, cors, body, router.registerMiddleware()])
const notesService = new NotesService()
notesService.init()

registerHealthRoutes(router)
registerNotesRoutes(router, notesService)

const server = http.createServer(async (req, res) => {
    app({ req, res }).catch(() => {
        if (!res.headersSent) res.statusCode = 500
        res.end()
    })
})

server.requestTimeout = 60 * 1000
server.listen(3000)

