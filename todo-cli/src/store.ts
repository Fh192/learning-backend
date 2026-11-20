import { EventEmitter } from 'node:events'
import { AppError, NotFoundError, StorageError } from './errors.ts'
import { readJson, writeJsonAtomic } from './fs-utils.ts'
import type { Logger } from './logger.ts'

interface Todo {
    id: number
    text: string
    done: boolean
}

interface TodoStoreEvents {
    added: [todo: Todo]
    completed: [todo: Todo]
    removed: [todo: Todo]
    saved: [path: string]
    error: [event: string, err: unknown]
}

export class TodoStore extends EventEmitter<TodoStoreEvents> {
    private dirty = false
    private todos: Todo[] = []
    private filePath: string

    constructor(filePath: string) {
        super()
        this.filePath = filePath
    }

    load(): Todo[] {
        try {
            this.todos = readJson<Todo[]>(this.filePath, [])
            return this.todos
        } catch (err) {
            this.emit('error', 'load', err)
            throw new StorageError('Ошибка при чтении файла', { cause: err })
        }
    }

    add(text: string): Todo {
        const maxId = Math.max(0, ...this.todos.map((todo) => todo.id))
        const todo = { id: maxId + 1, text, done: false }
        this.todos.push(todo)
        this.dirty = true

        this.emit('added', todo)

        return todo
    }

    complete(id: number): Todo {
        const todo = this.todos.find(todo => todo.id === id)

        if (!todo) {
            throw new NotFoundError(`Задача с id "${id}" не найдена`)
        }

        todo.done = true
        this.dirty = true

        this.emit('completed', todo)

        return todo

    }

    remove(id: number): Todo {
        const todo = this.todos.find(todo => todo.id === id)

        if (!todo) {
            throw new NotFoundError(`Задача с id "${id}" не найдена`)
        }

        this.todos = this.todos.filter((todo) => todo.id !== id)
        this.dirty = true

        this.emit('removed', todo)

        return todo
    }

    list({ all = false }): string[] {
        const todos = all ? this.todos : this.todos.filter(todo => !todo.done)
        return todos.map((todo) => {
            return `#${todo.id} [${todo.done ? 'x' : ' '}] ${todo.text}`
        })
    }

    async save() {
        try {
            if (!this.dirty) return

            await writeJsonAtomic(this.filePath, JSON.stringify(this.todos))
            this.dirty = false
            this.emit('saved', this.filePath)
        } catch (err) {
            this.emit('error', 'save', err)
            throw new StorageError('Не удалось сохранить изменения', { cause: err })
        }
    }
}

export function attachStoreLogger(store: TodoStore, logger: Logger) {
    store.on('error', (event, err) => {
        logger.error(`${event} failed`, err)
    }).on('added', (todo) => {
        logger.debug(`added #${todo.id} "${todo.text}"`)
    }).on('completed', (todo) => {
        logger.debug(`completed #${todo.id}`)
    }).on('removed', (todo) => {
        logger.debug(`removed #${todo.id}`)
    }).on('saved', (path) => {
        logger.debug(`saved -> ${path}`)
    })
}