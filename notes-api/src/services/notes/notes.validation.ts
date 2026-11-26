import { BadRequestException, UnprocessableEntityException } from "../../errors.ts"
import { isObject } from "../../utils/isObject.ts"
import type { CreateNoteDto, UpdateNoteDto } from "./notes.dto.ts"

export const parseNoteId = (id: string | undefined): number => {
    const idNum = Number(id)

    if (typeof id !== 'number' || Number.isNaN(id) || !Number.isFinite(id) || id <= 0) {
        throw new UnprocessableEntityException('Invalid note id', ['id'])
    }

    return idNum
}

export const parseCreateNote = (body: unknown): CreateNoteDto => {
    if (!isObject(body)) {
        throw new BadRequestException()
    }

    const { title, content } = body
    const details: string[] = []

    if (typeof title !== 'string' || !title.length) {
        details.push('title')
    }

    if (typeof content !== 'string' || !content.length) {
        details.push('content')
    }

    if (details.length) {
        throw new UnprocessableEntityException(undefined, details)
    }

    return {
        content: content as string,
        title: title as string
    }
}

export const parseUpdateNote = (body: unknown): UpdateNoteDto => {
    if (!isObject(body) || !(Object.hasOwn(body, 'title') || Object.hasOwn(body, 'content'))) {
        throw new BadRequestException()
    }

    const { title, content } = body
    const details: string[] = []

    if (title !== undefined && (typeof title !== 'string' || !title.length)) {
        details.push('title')
    }

    if (content !== undefined && (typeof content !== 'string' || !content.length)) {
        details.push('content')
    }

    if (details.length) {
        throw new UnprocessableEntityException(undefined, details)
    }

    return {
        content: content as string,
        title: title as string
    }
}
