const http = require('http')
const url = require('url')

const [, , port] = process.argv

// .toISOString()

const server = http.createServer( (req, res) => {

    if (req.method === 'GET') {
        let urlPars = url.parse(req.url, true)
        // console.log(urlPars)
        if (urlPars.pathname === '/api/parsetime') {
            // console.log(urlPars.query)

            let iso = urlPars.query.iso
            let date = new Date(iso)
            let hour = date.getHours()
            let minut = date.getMinutes()
            let sec = date.getSeconds()
            res.writeHead(200, { 'Content-Type': 'application/json' })
            resp = {
                hour: hour,
                minute: minut,
                second: sec
            }
            res.end(JSON.stringify(resp))
        } else if (urlPars.pathname === '/api/unixtime') {
           
            let iso = urlPars.query.iso
            let date = new Date(iso)
            let unix = date.getTime()

            res.writeHead(200, { 'Content-Type': 'application/json' })
            resp = {
                unixtime: unix
            }
            res.end(JSON.stringify(resp))
        }
    }
})
server.listen(port)



// SOLUCTION

// var http = require('http')
// var url = require('url')

// function parsetime (time) {
//   return {
//     hour: time.getHours(),
//     minute: time.getMinutes(),
//     second: time.getSeconds()
//   }
// }

// function unixtime (time) {
//   return { unixtime: time.getTime() }
// }

// var server = http.createServer(function (req, res) {
//   var parsedUrl = url.parse(req.url, true)
//   var time = new Date(parsedUrl.query.iso)
//   var result

//   if (/^\/api\/parsetime/.test(req.url)) {
//     result = parsetime(time)
//   } else if (/^\/api\/unixtime/.test(req.url)) {
//     result = unixtime(time)
//   }

//   if (result) {
//     res.writeHead(200, { 'Content-Type': 'application/json' })
//     res.end(JSON.stringify(result))
//   } else {
//     res.writeHead(404)
//     res.end()
//   }
// })
// server.listen(Number(process.argv[2]))