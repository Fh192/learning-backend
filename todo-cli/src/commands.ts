import { UsageError } from "./errors"
import type { TodoStore } from "./store"
import * as readline from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

export function add(args: string[], store: TodoStore) {
    const [text] = args

    if (!text) {
        throw new UsageError('Введите текст')
    }

    const todo = store.add(text)
    store.save()

    console.log(`Добавлено: #${todo.id} ${todo.text}`)
}

export function done(args: string[], store: TodoStore) {
    const [id] = args

    if (!id) {
        throw new UsageError('Укажите id задачи')
    }

    if (Number.isNaN(+id)) {
        throw new UsageError('id должно быть числом')
    }

    const todo = store.complete(+id)
    store.save()

    console.log(`Выполнено: #${todo.id} ${todo.text}`)
}

export function rm(args: string[], store: TodoStore) {
    const [id] = args

    if (!id) {
        throw new UsageError('Укажите id задачи')
    }

    if (Number.isNaN(+id)) {
        throw new UsageError('id должно быть числом')
    }


    const todo = store.remove(+id)
    store.save()

    console.log(`Удалено: #${todo.id} ${todo.text}`)
}

export function batch(args: string[], store: TodoStore) {
    const rl = readline.createInterface({ input: stdin, output: stdout })
    const interval = setInterval(() => {
        store.save()
    }, 5000)

    const sigHandler = (signal: 'SIGINT' | 'SIGTERM') => {
        console.log('Сохраняю...')
        store.save()
        rl.close()
        process.exitCode = signal === 'SIGTERM' ? 143 : 130
    }

    process.on('SIGINT', sigHandler).on('SIGTERM', sigHandler)

    rl.on('line', (input) => {
        if (!input.trim().length) return
        const todo = store.add(input)
        console.log(`+ #${todo.id} ${todo.text}`)
    }).on('close', () => {
        store.save()
        clearInterval(interval)
        process.off('SIGINT', sigHandler).off('SIGTERM', sigHandler)
    }).on('SIGINT', () => {
        sigHandler('SIGINT')
    })
}