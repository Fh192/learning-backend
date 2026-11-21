const b1 = 'b1'

const a = require('./3.a.cjs')
console.log('a: ', a) // a: {}

const b2 = 'b2'

module.exports = { b1, b2 }