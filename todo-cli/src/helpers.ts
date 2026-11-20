import { UsageError } from "./errors.ts";

export function isError(error: any): error is NodeJS.ErrnoException {
    return error instanceof Error;
}

export function validateTodoId(id: string | undefined): number {
    if (!id || id.trim().length === 0) {
        throw new UsageError('Укажите id задачи')
    }

    const idNum = +id

    if (Number.isNaN(idNum)) {
        throw new UsageError('id должно быть числом')
    }

    if (!Number.isInteger(idNum)) {
        throw new UsageError('id должно быть целым числом')
    }

    if (idNum < 0) {
        throw new UsageError('id должно быть больше 0')
    }

    return idNum
}