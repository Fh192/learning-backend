#!/usr/bin/env node

import { parseArgs } from 'node:util'
import { TodoStore } from './store.ts'
import { UsageError } from './errors.ts'
import { isError } from './helpers.ts'
import { getTodoFilePath } from './fs-utils.ts'
import { add, batch, done, rm } from './commands.ts'

process.on('uncaughtException', (err) => {
    if (isError(err)) {
        if (err.code?.startsWith('ERR_PARSE_ARGS_')) {
            throw new UsageError('Указаны некоректные аргументы. --help для справки')
        }
    }
})


const { positionals, values } = parseArgs({
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

if (values.help) {
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

const store = new TodoStore(getTodoFilePath())
const [cmd, ...args] = positionals

switch (cmd) {
    case 'add':
        add(args, store)
        break
    case 'list': {
        break
    }
    case 'done': {
        done(args, store)
        break
    }
    case 'rm': {
        rm(args, store)
        break
    }
    case 'batch': {
        batch(args, store)
        break
    }
    default: {
        throw new UsageError(`Не известная команда "${cmd}". Введите "todo --help" для списка доступных команд`)
    }
}