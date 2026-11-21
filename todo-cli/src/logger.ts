const LOG_LEVEL = Object.freeze({
    debug: 0,
    error: 1
})

type LogLevel = keyof typeof LOG_LEVEL
type LogLevelValue = typeof LOG_LEVEL[LogLevel]

export class Logger {
    level: LogLevelValue = LOG_LEVEL['error']

    constructor() {
        this.setLogLevel()
    }

    private setLogLevel() {
        const levelEnv = process.env.TODO_LOG_LEVEL
        const isEnvValid = (level: string | undefined): level is LogLevel => {
            return !!(level && level in LOG_LEVEL)
        }

        if (isEnvValid(levelEnv)) {
            this.level = LOG_LEVEL[levelEnv]
        }
    }

    get currentTime() {
        return Temporal.Now.plainDateTimeISO().toString({ smallestUnit: 'second' })
    }

    debug(message: string) {
        if (this.level > LOG_LEVEL['debug']) return
        console.error(`[${this.currentTime}] DEBUG`, message)
    }

    error(message: string, cause?: unknown) {
        if (this.level > LOG_LEVEL['error']) return
        console.error(`[${this.currentTime}] ERROR`, new Error(message, { cause }))
    }
}
