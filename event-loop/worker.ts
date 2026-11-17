import { parentPort, workerData } from 'worker_threads'

const fib = (n: number): number => {
    if (n <= 1) return 1

    return fib(n - 1) + fib(n - 2)
}

const result = fib(workerData)
parentPort?.postMessage(result)