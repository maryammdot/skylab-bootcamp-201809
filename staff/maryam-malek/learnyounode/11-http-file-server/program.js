const http = require('http')  
const fs = require('fs')

const [,, port, file] = process.argv

var server = http.createServer((req, res) => {  

    var readStream = fs.createReadStream(file)
    readStream.pipe(res)

})  
server.listen(port)

// var http = require('http')
// var fs = require('fs')

// var server = http.createServer(function (req, res) {
//     res.writeHead(200, { 'content-type': 'text/plain' })

//     fs.createReadStream(process.argv[3]).pipe(res)
// })

// server.listen(Number(process.argv[2]))