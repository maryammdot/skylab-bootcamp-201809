const http = require('http')

const [, , ...path] = process.argv
// var path = process.argv.slice(2)
let count = 0
const results = []

path.forEach((elem, index) => {
    http.get(elem, response => {
        let dataArr = ''
        if (response.error) throw Error
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

            results[index] = dataArr
            // console.log(results)
            count++
            if (count === path.length) {
                results.forEach(res => console.log(res))
            }
        })
    }).on('error', console.error)
})

// SOLUTION WITH ASYNC LIBRARY

// const async = require('async')

// async.map(path, (url, callback) => {
//     http.get(url, response => {
//         let dataArr = ''
//         if (response.error) throw Error
//         response.setEncoding('utf8')
//         response.on('data', data => {
//             dataArr += data

//         })
//         response.on('error', err => {
//             callback(err)
//         })
        
//         //Això és el mateix q passar err dins de callback, com que és una funció, ja passa a fins
//         // response.on('error', callback)

//         response.on('end', () => {
//             callback(undefined, dataArr)
//         })
//     }).on('error', err => callback(err))
// }, (err, results)=> {
//     if(err) throw err
//     results.forEach(res => console.log(res))
    
// })

// SOLUTION WITH AFTER LIBRARY

// const after = require('after')

// const next = after(path.length, (err, results) => {
//     if(err) throw err
//     results.forEach(res => console.log(res))
// })

// path.forEach((elem, index) => {
//     http.get(elem, response => {
//         let dataArr = ''
//         if (response.error) throw Error
//         response.setEncoding('utf8')
//         response.on('data', data => {
//             dataArr += data
//         })

//         response.on('error', err => {
//             console.log(err)
//         })

//         response.on('end', () => {
//             results[index] = dataArr
//             next(undefined, results)
//         })
//     }).on('error', console.error)
// })


// SOLUTION OF LEARNYOUNODE

// var http = require('http')
// var bl = require('bl')
// var results = []
// var count = 0

// function printResults () {
//   for (var i = 0; i < 3; i++) {
//     console.log(results[i])
//   }
// }

// function httpGet (index) {
//   http.get(process.argv[2 + index], function (response) {
//     response.pipe(bl(function (err, data) {
//       if (err) {
//         return console.error(err)
//       }

//       results[index] = data.toString()
//       count++

//       if (count === 3) {
//         printResults()
//       }
//     }))
//   })
// }

// for (var i = 0; i < 3; i++) {
//   httpGet(i)
// }