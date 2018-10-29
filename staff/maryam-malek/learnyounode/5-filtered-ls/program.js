const fs = require('fs')
const path = require('path')

// console.log(process.argv)

fs.readdir(process.argv[2], (err, list) => {
    if (err) throw Error
    list.forEach(elem => {
        if (path.extname(elem) === `.${process.argv[3]}`) {
            console.log(elem)
        }
    })
})