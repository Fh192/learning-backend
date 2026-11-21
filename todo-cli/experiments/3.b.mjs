import * as a from './3.a.mjs'

export const b1 = 'b1'

console.log('a: ', { ...a }) // ReferenceError

export const b2 = 'b2'
