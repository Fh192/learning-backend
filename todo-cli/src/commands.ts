import { AppError, UsageError } from "./errors.ts"
import type { TodoStore } from "./store.ts"
import * as readline from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { validateTodoId } from "./helpers.ts"

export function list(options: { all: boolean }, store: TodoStore) {
    console.log(store.list({ all: options.all }).join('\n'))
}

export async function add(args: string[], store: TodoStore) {
    const [text] = args

    if (!text) {
        throw new UsageError('Введите текст')
    }

    const todo = store.add(text)
    await store.save()

    console.log(`Добавлено: #${todo.id} ${todo.text}`)
}

export async function done(args: string[], store: TodoStore) {
    const id = validateTodoId(args.at(0))
    const todo = store.complete(id)
    await store.save()

    console.log(`Выполнено: #${todo.id} ${todo.text}`)
}

export async function rm(args: string[], store: TodoStore) {
    const id = validateTodoId(args.at(0))
    const todo = store.remove(id)
    await store.save()

    console.log(`Удалено: #${todo.id} ${todo.text}`)
}

export function batch(store: TodoStore) {
    let queue: Promise<void> = Promise.resolve()
    const rl = readline.createInterface({ input: stdin, output: stdout })

    function handleSave(): Promise<void> {
        const run = queue.then(() => store.save())
        queue = run.catch(() => { })
        return run
    }

    const interval = setInterval(() => {
        handleSave().catch(err => store.emit('error', 'autosave', err))
    }, 5000)

    let sigCallsCount = 0
    const sigHandler = async (signal: 'SIGINT' | 'SIGTERM') => {
        const exitCode = signal === 'SIGTERM' ? 143 : 130

        if (++sigCallsCount > 1) {
            return process.exit(exitCode)
        }

        console.log('Сохраняю...')

        const timeout = setTimeout(() => {
            console.error('Не удалось сохранить за 3 с')
            process.exit(1)
        }, 3000)

        try {
            const slowSaveMs = +(process.env.TODO_SLOW_SAVE_MS || '0')
            if (!Number.isNaN(slowSaveMs) && slowSaveMs > 0) {
                await new Promise(r => setTimeout(() => r(null), slowSaveMs))
            }

            await handleSave()
        } finally {
            clearTimeout(timeout)
        }

        rl.close()
        process.exitCode = exitCode
    }

    process.on('SIGINT', sigHandler).on('SIGTERM', sigHandler)

    rl.on('line', (input) => {
        if (!input.trim().length) return
        const todo = store.add(input)
        console.log(`+ #${todo.id} ${todo.text}`)
        rl.prompt()
    }).on('close', async () => {
        clearInterval(interval)
        process.off('SIGINT', sigHandler).off('SIGTERM', sigHandler)
        await handleSave()
    }).on('SIGINT', () => {
        sigHandler('SIGINT')
    })

    rl.prompt()
}
