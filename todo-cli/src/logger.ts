export class Logger {
    log(message: string) {
        console.log(message)
    }

    error(message: string, cause: unknown) {
        console.error(new Error(message, { cause }))
    }
}