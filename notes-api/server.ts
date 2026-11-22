import { readFile } from 'node:fs/promises'
import http from 'node:http'
import { isError } from './helpers.ts'
import { resolve } from 'node:path'
import { writeFile } from 'node:fs/promises'
import { rename } from 'node:fs/promises'
import { rm } from 'node:fs/promises'
import { json } from 'node:stream/consumers'

interface Note {
    id: number,
    title: string,
    content: string,
    createdAt: string,
    updatedAt: string
}

type CreateNoteDto = Pick<Note, 'title' | 'content'>
type UpdateNoteDto = Partial<Pick<Note, 'title' | 'content'>>

async function readJson<T>(path: string, defaultValue: T): Promise<T> {
    try {
        const contents = await readFile(path, { encoding: "utf-8" })
        return JSON.parse(contents)
    } catch (err) {
        if (isError(err) && err.code === 'ENOENT') {
            return defaultValue
        }

        throw err
    }
}

async function writeJson(path: string, data: string) {
    const tmpFilePath = resolve(`${path}.tmp-${process.pid}`)

    try {
        await writeFile(tmpFilePath, data)
        await rename(tmpFilePath, path)
    } catch (err) {
        await rm(tmpFilePath, { force: true }).catch(() => { })
        throw err
    }
}

function getNotesFilePath() {
    return resolve(process.cwd(), './notes.json')
}


async function getNotes(q?: string | null): Promise<Note[]> {
    const notes = await readJson<Note[]>(getNotesFilePath(), [])

    if (!q) return notes
    return notes.filter(({ title }) => title.includes(q))
}

async function findNoteById(id: number): Promise<Note> {
    const notes = await readJson<Note[]>(getNotesFilePath(), [])
    const note = notes.find((n) => n.id === id)
    console.log(note)
    if (!note) {
        throw new Error('Note not found')
    }

    return note
}

async function createNote(data: CreateNoteDto): Promise<Note> {
    const notes = await readJson<Note[]>(getNotesFilePath(), [])
    const note: Note = {
        id: (notes.at(-1)?.id ?? 0) + 1,
        title: data.title,
        content: data.content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }

    await writeJson(getNotesFilePath(), JSON.stringify([...notes, note]))

    return note
}

async function updateNote(id: Note['id'], patch: UpdateNoteDto) {
    const notes = await readJson<Note[]>(getNotesFilePath(), [])
    const updated = notes.map((n) => {
        if (n.id === id) {
            return Object.assign(n, patch, { updatedAt: new Date().toISOString() })
        }

        return n
    })

    await writeJson(getNotesFilePath(), JSON.stringify(updated))
}

async function deleteNote(id: Note['id']) {
    const notes = await readJson<Note[]>(getNotesFilePath(), [])
    const noteIndex = notes.findIndex((note) => note.id === id)

    if (noteIndex === -1) {
        throw new Error('Note not found')
    }

    notes.splice(noteIndex, 1)

    await writeJson(getNotesFilePath(), JSON.stringify(notes))
}


function validateCreateNotesBody(body: unknown): body is CreateNoteDto {
    if (!body || typeof body !== 'object') return false
    return 'title' in body && 'content' in body
}

function validateUpdateNotesBody(body: unknown): body is UpdateNoteDto {
    if (!body || typeof body !== 'object') return false
    return 'title' in body || 'content' in body
}


const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? '', 'http://localhost')

    if (url.pathname === '/health' && req.method === 'GET') {
        res.end(JSON.stringify({ status: 'ok' }))
    } else if (url.pathname.startsWith('/notes')) {
        const [, , id] = url.pathname.split('/')
        const query = url.searchParams.get('q')

        if (req.method === 'GET') {
            res.writeHead(200, {
                'content-type': 'application/json'
            })

            if (id) {
                const note = await findNoteById(Number(id))
                res.end(JSON.stringify(note))
            } else {
                const notes = await getNotes(query)
                res.end(JSON.stringify(notes))
            }

        } else if (req.method === 'POST') {
            const body = await json(req)

            if (!validateCreateNotesBody(body)) {
                res.statusCode = 400
                res.end()
            } else {
                const note = await createNote({
                    content: body.content,
                    title: body.title,
                })

                res.writeHead(201, {
                    'content-type': 'application/json',
                    'location': `/notes/${note.id}`
                })

                res.end(JSON.stringify(note))
            }
        } else if (req.method === 'PUT') {
            const [, , id] = url.pathname.split('/')
            const body = await json(req)

            if (!validateUpdateNotesBody(body)) {
                res.statusCode = 400
                res.end()
            } else {
                await updateNote(Number(id), {
                    content: body.content,
                    title: body.title,
                })
                res.end()
            }
        } else if (req.method === 'DELETE') {
            const [, , id] = url.pathname.split('/')

            if (id) {
                await deleteNote(Number(id))
                res.statusCode = 204
                res.end()
            }
        }
    } else {
        res.statusCode = 404
        res.end()
    }
})

server.listen(3000)
server.requestTimeout = 60 * 1000