const a1 = 'a1'

const b = require('./3.b.cjs')
console.log('b: ', b) // b: {}

const a2 = 'a2'

module.exports = { a1, a2 }