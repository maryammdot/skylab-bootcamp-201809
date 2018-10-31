let count = 0
function forEach(arr, callback) {
    if(arr.length > 1){
        if(count< arr.length){

            callback(arr[count], count)
            count ++
            forEach(arr, callback)
        }
    }
}

module.exports = forEach
