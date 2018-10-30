const map = require('through2-map')  
const http = require('http')  

const [,, port] = process.argv

var server = http.createServer((req, res) => {  

    if(req.method === 'POST'){

        req.pipe(map(chunk => {  
            return chunk.toString().toUpperCase()  
        })).pipe(res)

        // req.pipe(map(chunk => chunk.toString().toUpperCase())).pipe(res)
    }
})  
server.listen(port)

// SOLUTION WITHOUT THROUGHT-2-MAP
// const server = http.createServer((req, res) => {
//     if(req.method === 'POST'){

//         let content = ''
        
//         req.on('data', chunck => content+= chunck)
        
//         req.on('end', () => res.end(content.toUpperCase()))
//     }  
// })

//SOLUTION LEARNYOUNODE

// var http = require('http')
// var map = require('through2-map')

// var server = http.createServer(function (req, res) {
//   if (req.method !== 'POST') {
//     return res.end('send me a POST\n')
//   }

//   req.pipe(map(function (chunk) {
//     return chunk.toString().toUpperCase()
//   })).pipe(res)
// })

// server.listen(Number(process.argv[2]))