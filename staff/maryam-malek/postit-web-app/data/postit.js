class Postit {
    constructor(postit) {
        const {id, body} = postit
        this.id = id || Date.now()
        this.body = body
    }
}

module.exports = Postit