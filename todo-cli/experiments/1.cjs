 // uncaughtException code 1
setTimeout(() => {
    throw new Error('throw in setTimeout') 
}, 0)

// unhandledRejection code 1 
setTimeout(() => {
    Promise.reject() 
}, 0)
