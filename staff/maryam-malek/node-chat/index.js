var net = require('net')

const [, , port] = process.argv

let clients = []

var server = net.createServer(socket => {
  clients.push(socket)
  
  clients.forEach(client => {

    client.on('data', data => {
      process.stdout.write(data)


    })

  })
  process.stdin.on('data', data => socket.write(data))

})

server.listen(port) 
