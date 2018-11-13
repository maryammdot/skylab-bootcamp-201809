function cors(req, res, next) {
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.set('Access-Control-Allow-Methods', 'POST, DELETE, PATCH')

    next()
}

module.exports = cors