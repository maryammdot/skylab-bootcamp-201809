var net = require('net')  

const [,, port] = process.argv

var server = net.createServer(socket => {  
    
  socket.on('data', data => process.stdout.write(data))
  
  process.stdin.on('data', data => socket.write(data))
  
})  

server.listen(port) 
