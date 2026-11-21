import { resolve } from "node:path";
import { FILE_NAME, GAMES } from "./constants.ts";
import type { Order } from "./types.ts";

export function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
}

export function objToCsvString<T extends object>(obj: T, columns: readonly (keyof T)[]): string {
    return columns.map(c => String(obj[c])).join(',')
}

export function arrToCsvString<T extends object>(arr: readonly T[], columns: readonly (keyof T)[]): string {
    return arr.map((obj) => objToCsvString(obj, columns)).join('\n')
}

export function getCsvFilePath(): string {
    return resolve(process.cwd(), FILE_NAME)
}

export function createOrder(index: number): Order {
    const game = GAMES[getRandomInt(0, GAMES.length)]!
    return {
        id: index,
        user_id: getRandomInt(1, 100_000),
        game: game.name,
        price: game.priceCents * (1 - getRandomInt(0, 31) / 100),
        created_at: new Date(Date.now() - getRandomInt(0, 1000 * 60 * 60 * 24 * 365)).toISOString()
    }
}