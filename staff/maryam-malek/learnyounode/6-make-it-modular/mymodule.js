const path = require('path')
const fs = require('fs')


module.exports = function(dir, ext, callback){
    let match = []

    fs.readdir(dir, (err, list) => {
        if (err) return callback(err)
        // if (err) {

        //     callback(err)
        //     return 
        // }
        list.forEach(elem => {
            if (path.extname(elem) === `.${ext}`) {
                match.push(elem)
            }
        })
        return callback(null, match)
    })
}
