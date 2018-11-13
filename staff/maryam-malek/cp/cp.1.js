const fs = require('fs')

const [,, input, output] = process.argv


//SOLUTION WITH COPYFILE DE FS

// fs.copyFile(input, output, err => {
//     if(err) throw err
// })

//SOLUTION WITH READFILE & WRITEFILE DE FS
//No és òptim, perquè s'ha de pujar a memòria tot el datat i després volcar-lo
// fs.readFile(input, (err, data) => {
//     if(err) throw err
   
//     fs.writeFile(output, data, err => {
//         if(err) throw err
//     }) 
// })


//SOLUTION WITH READSTREAM
//si que és òptim
// fs.createReadStream(input).pipe(fs.createWriteStream(output))


const rs = fs.createReadStream(input)

const ws = fs.createWriteStream(output)

rs.pipe(ws)