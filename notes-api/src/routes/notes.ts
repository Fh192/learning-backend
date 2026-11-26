import { NotFoundException } from "../errors.ts";
import type { Router } from "../router/index.ts";
import type { NotesService } from "../services/notes/notes.service.ts";
import { parseCreateNote, parseNoteId, parseUpdateNote } from "../services/notes/notes.validation.ts";

export function registerNotesRoutes(router: Router, notesService: NotesService) {
    router.get('/notes', async (ctx, next) => {
        const query = ctx.url.searchParams.get('q')
        ctx.body = await notesService.getNotes(query)
        return next()
    })

    router.get('/notes/:id', async (ctx, next) => {
        const id = parseNoteId(ctx.params.id)
        const note = await notesService.findNoteById(id)

        if (!note) {
            throw new NotFoundException(`Note with id '${id}' not found`)
        }

        ctx.body = note

        return next()
    })

    router.post('/notes', async (ctx, next) => {
        const dto = parseCreateNote(ctx.request.body)
        const note = await notesService.createNote(dto)

        ctx.status = 201
        ctx.res.setHeader('Location', `/notes/${note.id}`)
        ctx.body = note

        return next()
    })


    router.patch('/notes/:id', async (ctx, next) => {
        const dto = parseUpdateNote(ctx.request.body)
        const id = parseNoteId(ctx.params.id)
        const note = await notesService.updateNote(id, dto)

        if (!note) {
            throw new NotFoundException(`Note with id '${id}' not found`)
        }

        ctx.body = note

        return next()
    })

    router.delete('/notes/:id', async (ctx, next) => {
        const id = parseNoteId(ctx.params.id)
        const { success } = await notesService.deleteNote(id)

        if (!success) {
            throw new NotFoundException(`Note with id '${id}' not found`)
        }

        return next()
    })
}
