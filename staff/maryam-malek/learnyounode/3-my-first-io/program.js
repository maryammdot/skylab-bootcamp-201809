const fs = require('fs')


let doc = fs.readFileSync(process.argv[2])

// let docStr = fs.readFileSync(process.argv[2], 'utf8')

let docStr = doc.toString()

let docArr = docStr.split('\n')

let result = docArr.length - 1

console.log(result)