import { BadRequestException, UnprocessableEntityException } from "../../errors.ts"
import { isObject } from "../../utils/isObject.ts"
import type { CreateNoteDto, UpdateNoteDto } from "./notes.dto.ts"

export const parseNoteId = (id: string | undefined): number => {
    const idNum = Number(id)

    if (typeof idNum !== 'number' || Number.isNaN(idNum) || !Number.isFinite(idNum) || idNum <= 0) {
        throw new UnprocessableEntityException('Invalid note id', ['id'])
    }

    return idNum
}

const validateTitle = (title: unknown): title is string => {
    return typeof title === 'string' && title.length > 0 && title.length <= 10_000
}

const validateContent = (content: unknown): content is string => {
    return typeof content === 'string' && content.length > 0 && content.length <= 10_000
}

export const parseCreateNote = (body: unknown): CreateNoteDto => {
    if (!isObject(body)) {
        throw new BadRequestException()
    }

    const { title, content } = body
    const details: string[] = []

    if (!validateTitle(title)) {
        details.push('title')
    }

    if (!validateContent(content)) {
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

    if (title !== undefined && !validateContent(title)) {
        details.push('title')
    }

    if (content !== undefined && !validateContent(content)) {
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
