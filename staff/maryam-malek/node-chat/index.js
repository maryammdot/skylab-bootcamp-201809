var net = require('net')  
const readline = require('readline');

const [,, port] = process.argv
let answerStr = ''

var server = net.createServer(socket => {  

    // socket.write('hello\n')
    // socket.on('data', (err, data) => {
    //   if(err) throw err
    //   socket.write(data)
    //   process.stdout.write(message)

    // })

    waitAnsw(socket)
    socket.on('end', err =>{
      if(err) throw err
      socket.write('Bye')
      process.stdout.write('Bye')
    })
    
  })  
  server.listen(port) 

  function waitAnsw(socket){
    socket.write('hello\n')
    socket.on('data', (err, data) => {
      if(err) throw err
      if(data !== 'end'){
        socket.write(data)
        process.stdout.write(data)
        waitAnsw(socket)
      }

    })
    
  }
  
      // const rl = readline.createInterface({
      //     input: process.stdin,
      //     output: process.stdout
      //   });
        
      //   rl.question('Hello, how are you?', (answer) => {
      //     answerStr = answer
  
      //     console.log(`Thank you for your valuable feedback: ${answerStr}`);
        
      //     rl.close();
      //   });
  
      // // socket.end('bye\n')