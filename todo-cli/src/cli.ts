#!/usr/bin/env node

import { parseArgs } from 'node:util'
import { attachStoreLogger, TodoStore } from './store.ts'
import { AppError, UsageError } from './errors.ts'
import { getTodoFilePath } from './fs-utils.ts'
import { add, batch, done, list, rm } from './commands.ts'
import { Logger } from './logger.ts'

function handleArgs() {
    try {
        return parseArgs({
            allowPositionals: true,
            options: {
                all: {
                    type: 'boolean',
                    short: 'a',
                    default: false
                },
                help: {
                    type: 'boolean',
                    short: 'h',
                    default: false
                },
            }
        })
    } catch (err) {
        throw new UsageError('Указаны некоректные аргументы. --help для справки')
    }
}

function handleHelp() {
    console.log(`Использование: todo [команда] [опции]
        
Команды:
    add           Создать задачу
    list          Вывести список задач
    done          Завершить задачу
    rm            Удалить задачу
    batch         Интерактивный режим
        
Опции:
    -a, --all      вывести все задачи
    -h, --help     справка`)
    process.exit(0)
}

async function handleCommands({
    cmd, args, options, store
}: { cmd: string | undefined, args: string[], options: { all: boolean }, store: TodoStore }) {
    switch (cmd) {
        case 'add':
            await add(args, store)
            break
        case 'list': {
            list({ all: options.all }, store)
            break
        }
        case 'done': {
            await done(args, store)
            break
        }
        case 'rm': {
            await rm(args, store)
            break
        }
        case 'batch': {
            batch(store)
            break
        }
        default: {
            throw new UsageError(`Не известная команда "${cmd}". Введите "todo --help" для списка доступных команд`)
        }
    }
}

async function main() {
    try {
        const { values, positionals } = handleArgs()

        if (values.help) return handleHelp()

        const [cmd, ...args] = positionals
        const store = new TodoStore(getTodoFilePath())
        const logger = new Logger()

        attachStoreLogger(store, logger)
        store.load()

        await handleCommands({
            cmd,
            args,
            store,
            options: { all: values.all }
        })
    } catch (err) {
        if (err instanceof AppError) {
            console.error(err.message)
            process.exitCode = err.exitCode
        } else {
            console.error('Непредвиденная ошибка')
            process.exitCode = 1
        }
    }
}

main()
