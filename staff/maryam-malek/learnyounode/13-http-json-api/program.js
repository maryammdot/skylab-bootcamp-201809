const http = require('http')  
const url = require('url')

const [,, port] = process.argv

let date = new Date()
// .toISOString()

function fill (elem){
    return (elem < 10 ? '0' : '') + elem
}
// let year = date.getFullYear()
// let month = fill(date.getMonth()+1)
// let day = fill(date.getDate())
let hour = fill(date.getHours())
let minut = fill(date.getMinutes())
let sec = fill(date.getSeconds())


var server = http.createServer(function (req, res) {  

    if(req.method === 'GET'){
        url.parse(req.url, true)
        if(url.pathname === '/api/parsetime'){
            res.writeHead(200, { 'Content-Type': 'application/json' })         
            res = {  
                "hour": hour,  
                "minute": minut,  
                "second": sec  
            }
        }
    }
})  
server.listen(port)