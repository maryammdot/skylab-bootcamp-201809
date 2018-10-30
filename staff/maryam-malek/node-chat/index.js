var net = require('net')  
const readline = require('readline');

const [,, port] = process.argv
let answerStr = ''

var server = net.createServer(socket => {  

    socket.write('hello\n')

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rl.question('Hello, how are you?', (answer) => {
        answerStr = answer

        console.log(`Thank you for your valuable feedback: ${answerStr}`);
      
        rl.close();
      });

    // socket.end('bye\n')

})  
server.listen(port) 