import { createNote, findNoteById, getNotes } from "../services/notes/notes.service.ts"
import type { Method, Req, Res } from "../types.ts"
import { getBaseUrl } from "../utils/getBaseUrl.ts"
import { BadRequestException, UnprocessableEntityException } from "../errors.ts"
import { json } from "../utils/readBody.ts"
import type { CreateNoteDto } from "../services/notes/notes.dto.ts"

function validateCreateNoteBody(body: unknown): body is CreateNoteDto {
    const errorFields: string[] = []

    if (typeof body !== 'object' || !body) {
        throw new BadRequestException()
    }

    if (!('content' in body) || typeof body.content !== 'string') {
        errorFields.push('content')
    }

    if (!('title' in body) || typeof body.title !== 'string') {
        errorFields.push('title')
    }

    if (errorFields.length) {
        throw new UnprocessableEntityException(undefined, errorFields)
    }

    return true
}

export const routes = {
    '/health': {
        'GET': (req, res) => res.end(JSON.stringify({ status: 200 }))
    },
    '/notes': {
        'GET': async (req, res) => {
            const query = new URL(req.url ?? '', getBaseUrl()).searchParams.get('q')
            const notes = await getNotes(query)

            return res.end(JSON.stringify(notes))
        },
        'POST': async (req, res) => {
            const body = await json(req)
            const errorFields: string[] = []

            if (validateCreateNoteBody(body)) {
                const note = await createNote({
                    content: body.content,
                    title: body.title,
                })

                return res.end(JSON.stringify(note))
            }

            return res.end()
        }
    },
    '/notes/:id': {
        'GET': async (req, res) => {
            const [, , id] = (req.url ?? '').split('/')
            const note = await findNoteById(Number(id))

            res.statusCode = 201
            res.setHeader('content-type', 'application/json')
            res.setHeader('location', `/notes/${note.id}`)

            return res.end(JSON.stringify(note))
        },
        'PUT': (req, res) => {
            return res.end()
        },
        'DELETE': (req, res) => {
            return res.end()
        },
    }
} satisfies Record<`/${string}`, Partial<Record<Method, (req: Req, res: Res) => Promise<Res> | Res>>>

export type Routes = typeof routes
export type RoutePath = keyof Routes
export type RouteMethod<T extends RoutePath> = Extract<keyof Routes[T], Method>