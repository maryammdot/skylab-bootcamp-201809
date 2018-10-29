const http = require('http')
const [,,path] = process.argv

http.get(path, response => {
    let dataArr = ''
    if(response.error) throw Error
    response.setEncoding('utf8')
    response.on('data', data => {
        dataArr += data
        // console.log('DATA'+data)
        // console.log(dataArr)
    })
    response.on('error', err => {
        console.log(err)
    })
    response.on('end', () => {
    
        console.log(dataArr.length)
        console.log(dataArr)
        
    })
}).on('error', console.error)