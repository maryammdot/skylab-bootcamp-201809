const mymodule = require('./mymodule.js')


let [,, dir, ext] = process.argv

mymodule(dir, ext, (err, data) => {
    if(err) throw err

    data.forEach(elem => console.log(elem))
})