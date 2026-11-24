import { resolve } from "node:path"
import { readJson, writeJson } from "../../utils/fs.ts"
import type { CreateNoteDto, Note, UpdateNoteDto } from "./notes.dto.ts"
import { NotFoundException, UnprocessableEntityException } from "../../errors.ts"



// export class NotesService {
// }


function getNotesFilePath() {
    return resolve(process.cwd(), './data/notes.json')
}

export async function getNotes(q?: string | null): Promise<Note[]> {
    const notes = await readJson<Note[]>(getNotesFilePath(), [])

    if (!q) return notes
    return notes.filter(({ title }) => title.includes(q))
}

export async function findNoteById(id: number): Promise<Note> {
    if (Number.isNaN(id)) {
        throw new UnprocessableEntityException('Wrong id format', ['id'])
    }

    const notes = await readJson<Note[]>(getNotesFilePath(), [])
    const note = notes.find((n) => n.id === id)

    if (!note) {
        throw new NotFoundException('Note not found')
    }

    return note
}

export async function createNote(data: CreateNoteDto): Promise<Note> {
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

export async function updateNote(id: Note['id'], patch: UpdateNoteDto) {
    const notes = await readJson<Note[]>(getNotesFilePath(), [])
    const updated = notes.map((n) => {
        if (n.id === id) {
            return Object.assign(n, patch, { updatedAt: new Date().toISOString() })
        }

        return n
    })

    await writeJson(getNotesFilePath(), JSON.stringify(updated))
}

export async function deleteNote(id: Note['id']) {
    const notes = await readJson<Note[]>(getNotesFilePath(), [])
    const noteIndex = notes.findIndex((note) => note.id === id)

    if (noteIndex === -1) {
        throw new NotFoundException('Note not found')
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
