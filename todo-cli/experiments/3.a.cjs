const a1 = 'a1'

const b = require('./3.b.cjs') // a: {}
console.log('b: ', b) // b: { b1: 'b1', b2: 'b2' }

const a2 = 'a2'

module.exports = { a1, a2 }