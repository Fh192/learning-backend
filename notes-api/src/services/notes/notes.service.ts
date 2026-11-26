import { resolve } from "node:path"
import { readJson, writeJson } from "../../utils/fs.ts"
import type { CreateNoteDto, Note, UpdateNoteDto } from "./notes.dto.ts"

export class NotesService {
    private notes: Note[] = []
    private queue: Promise<void> = Promise.resolve()
    private lastId: number = 0

    private get filePath() {
        return resolve(process.cwd(), process.env.DATA_FILE ?? './data/notes.json')
    }

    private async save() {
        const run = this.queue.then(() => writeJson(this.filePath, JSON.stringify(this.notes)))
        this.queue = run.catch(() => { })
        return run
    }

    init() {
        this.notes = readJson<Note[]>(this.filePath, [])
        this.lastId = this.notes.at(-1)?.id ?? 0
    }

    async getNotes(q?: string | null): Promise<Note[]> {
        JSON.parse('{')
        if (!q) return this.notes
        return this.notes.filter(({ title }) => title.includes(q))
    }

    async findNoteById(id: Note['id']): Promise<Note | undefined> {
        return this.notes.find((n) => n.id === id)
    }

    async createNote(dto: CreateNoteDto): Promise<Note> {
        const note: Note = {
            id: ++this.lastId,
            title: dto.title,
            content: dto.content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        this.notes.push(note)

        await this.save()

        return note
    }

    async updateNote(id: Note['id'], dto: UpdateNoteDto) {
        const note = this.notes.find((n) => n.id === id)

        if (!note) {
            return null
        }

        Object.assign(
            note,
            (['title', 'content'] as const).reduce<UpdateNoteDto>((obj, key) => {
                if (dto[key] !== undefined) {
                    obj[key] = dto[key]
                }

                return obj
            }, {}),
            { updatedAt: new Date().toISOString() }
        )

        await this.save()

        return note
    }

    async deleteNote(id: Note['id']) {
        const noteIndex = this.notes.findIndex((note) => note.id === id)

        if (noteIndex === -1) {
            return { success: false }
        }

        this.notes.splice(noteIndex, 1)
        await this.save()

        return { success: true }
    }
}
