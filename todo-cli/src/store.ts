import { EventEmitter } from 'node:events'
import { NotFoundError, StorageError } from './errors.ts'
import { readJson, writeJsonAtomic } from './fs-utils.ts'
import { Logger } from './logger.ts'

interface Todo {
    id: number
    text: string
    done: boolean
}

interface TodoStoreEvents {
    added: [todo: Todo]
    completed: [todo: Todo]
    removed: [todo: Todo]
    saved: []
    error: [err: unknown]
}

export class TodoStore extends EventEmitter<TodoStoreEvents> {
    private dirty = false
    private todos: Todo[] = []
    private filePath: string
    private logger: Logger

    constructor(filePath: string) {
        super()
        this.logger = new Logger()


        this.filePath = filePath
        this.load()
    }

    private load(): Todo[] {
        try {
            this.todos = readJson<Todo[]>(this.filePath, [])
            return this.todos
        } catch (err) {
            if (err instanceof Error && 'code' in err) {
                console.log(err.code)

            }

            throw new StorageError('Ошибка при чтении файла', { cause: err })
        }
    }

    add(text: string) {
        try {
            const maxId = Math.max(0, ...this.todos.map((todo) => todo.id))
            const todo = { id: maxId + 1, text, done: false }
            this.todos.push(todo)
            this.dirty = true

            this.emit('added', todo)

            return todo
        } catch (err) {
            this.emit('error', err)
            throw new StorageError('Не удалось создать задачу', { cause: err })
        }
    }

    complete(id: number) {
        try {
            const todo = this.todos.find(todo => todo.id === id)

            if (!todo) {
                throw new NotFoundError(`Задача с id "${id}" не найдена`)
            }

            todo.done = true
            this.dirty = true

            this.emit('completed', todo)

            return todo
        } catch (err) {
            this.emit('error', err)
            throw new StorageError('Не удалось изменить статус задачи', { cause: err })
        }
    }

    remove(id: number) {
        try {
            const todo = this.todos.find(todo => todo.id === id)

            if (!todo) {
                throw new NotFoundError(`Задача с id "${id}" не найдена`)
            }

            this.todos = this.todos.filter((todo) => todo.id !== id)
            this.dirty = true

            this.emit('removed', todo)

            return todo
        } catch (err) {
            this.emit('error', err)
            throw new StorageError('Не удалось удалить задачу', { cause: err })
        }
    }

    list({ all = false }) {
        try {

        } catch (err) {
            this.emit('error', err)
            throw new StorageError('', { cause: err })
        }
    }

    save() {
        try {
            if (!this.dirty) return

            writeJsonAtomic(this.filePath, JSON.stringify(this.todos))
            this.dirty = false
            this.emit('saved')
        } catch (err) {
            this.emit('error', err)
            throw new StorageError('Не удалось сохранить изменения', { cause: err })
        }
    }
}