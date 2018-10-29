const http = require('http')
const [,,path] = process.argv
http.get(path, response => {
    if(response.error) throw Error
    response.setEncoding('utf8')
    response.on('data', data => {
        console.log(data)
    })
    response.on('error', err => {
        console.log(err)
    })
})