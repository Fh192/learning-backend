const b1 = 'b1'

const a = require('./3.a.cjs') // b: {}
console.log('a: ', a) // a: { a1: 'a1', a2: 'a2' }

const b2 = 'b2'

module.exports = { b1, b2 }