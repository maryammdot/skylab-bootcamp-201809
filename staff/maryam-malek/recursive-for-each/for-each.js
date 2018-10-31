//NOT SO EFFITIENT SOLUTION

// let count = 0
// function forEach(arr, callback) {
//     if (count < arr.length) {

//         callback(arr[count], count)
//         count++
//         forEach(arr, callback)
//     }else {
//         count = 0
//     }
// }


// MORE EFICIENT SOCULTION

function forEach(arr, callback, index = 0) {
    if (index < arr.length) {

        callback(arr[index], index)

        forEach(arr, callback, ++index)
    }
}

module.exports = forEach
