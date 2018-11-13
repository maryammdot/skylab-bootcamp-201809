const fs = require('fs')

const [, , ...params] = process.argv

if (params.length === 3) {
    const [rec, input, output] = params

    if (rec === '-R') {
        recurDir(input, output)

    } else {
        console.log('invalid input')
    }
} else {
    const [input, output] = params
    fs.lstat(input, (err, stats) => {
        if (err) throw err
        if (stats.isDirectory()) {
            console.error(`cp: ${input} is a directory (not copied).`)
        } else {

            fs.createReadStream(input).pipe(fs.createWriteStream(output))
        }
    })
}

function recurDir(input, output) {

    fs.readdir(input, (err, files) => {
        if (err) throw err
        files.forEach(file => {

            fs.lstat(`${input}/${file}`, (err, stats) => {

                if (err) throw err
                if (stats.isFile()) {

                    fs.existsSync(output) ? output : fs.mkdir(output, err => { if (err) throw err })
                    fs.createReadStream(`${input}/${file}`).pipe(fs.createWriteStream(`${output}/${file}`))

                } else if (stats.isDirectory()) {
                    recurDir(input, output)
                }
            })
        })
    })   
}

// USE PATH TO JOIN DIRECTORY WITH FILE

// const path = require('path')
// path.join(input, file)
// ===
// `${input}/${file}`