const fs = require('fs')

// console.log(process.argv[2])


fs.readFile(process.argv[2], (err, data) => {
    if(err) throw Error
        
        let doc = data
        
        let docStr = doc.toString()
        
        let docArr = docStr.split('\n')
        
        let result = docArr.length - 1
        
        console.log(result)
    
})
