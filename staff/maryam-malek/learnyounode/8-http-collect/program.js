const http = require('http')
const [, , path] = process.argv
// const { argv: [, , path] } = process

http.get(path, response => {
    let dataStr = ''
    if (response.error) throw Error
    response.setEncoding('utf8')
    response.on('data', data => {
        dataStr += data
        // console.log('DATA'+data)
        // console.log(dataArr)
    })
    response.on('error', err => {
        console.log(err)
    })
    response.on('end', () => {

        console.log(dataStr.length)
        console.log(dataStr)

    })
}).on('error', console.error)