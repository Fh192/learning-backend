const events = require('node:events')

const emitter = new events.EventEmitter()

// emitter.on('error', () => console.log('handled error'))

emitter.emit('error', '123') // Unhandled 'error' event
