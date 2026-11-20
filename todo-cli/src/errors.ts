export class AppError extends Error {
    constructor(message: string, exitCode: number, options?: ErrorOptions,) {
        super(message, options)
        this.name = 'AppError'

        console.error(message)
        process.exitCode = exitCode
    }
}

export class UsageError extends AppError {
    constructor(message: string) {
        super(message, 2)
        this.name = 'UsageError'
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, 1)
        this.name = 'NotFoundError'
    }
}

export class StorageError extends AppError {
    constructor(message: string, options: ErrorOptions) {
        super(message, 1, options)
        this.name = 'StorageError'
    }
}
