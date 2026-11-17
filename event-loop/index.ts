import http from 'node:http'
import crypto from 'node:crypto'
import { Worker } from 'worker_threads'


let prevTime = performance.now()

setInterval(() => {
    console.log('setInterval', performance.now() - prevTime)
    prevTime = performance.now()
}, 100)


const server = http.createServer(((req, res) => {
    console.log(req.method, req.url)
    const start = performance.now()

    switch (req.url) {
        case '/sync': {
            const pass = crypto.pbkdf2Sync('password', crypto.randomBytes(16), 5000000, 64, 'sha512').toString('hex')
            console.log(performance.now() - start)
            return res.end(pass)
        }

        case '/async': {
            return crypto.pbkdf2('password', crypto.randomBytes(16), 5000000, 64, 'sha512', (err, pass) => {
                if (err) {
                    console.log(err?.message)
                    res.statusCode = 500
                    res.end()

                }

                console.log(performance.now() - start)
                res.end(pass.toString('hex'))
            })
        }

        case '/fib': {
            const worker = new Worker('./worker.ts', {
                workerData: 40
            })

            worker.on('message', (value) => {
                res.end(value.toString())
            })

            worker.on('error', () => {
                res.statusCode = 500
                res.end()
            })

            worker.on('exit', () => {
                res.statusCode = 500
                res.end()
            })

            break
        }

        default: {
            res.statusCode = 404
            return res.end()
        }
    }


}))

server.listen(3000)