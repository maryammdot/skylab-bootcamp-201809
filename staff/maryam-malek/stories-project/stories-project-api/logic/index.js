const { User, Story, Book } = require('../data/index')
const validate = require('../utils/validate')
const { AlreadyExistError, AuthError, NotFoundError } = require('../errors')

const logic = {
    register(name, surname, username, password) {
        validate([
            { key: 'name', value: name, type: String },
            { key: 'surname', value: surname, type: String },
            { key: 'username', value: username, type: String },
            { key: 'password', value: password, type: String }]
        )
        return (async () => {
            let user = await User.findOne({ username })
            
            if (user) throw new AlreadyExistError(`username ${username} already registered`)
            
            user = new User({ name, surname, username, password })
            
            await user.save()
        })()
    },

    authenticate(username, password) {
        validate([
            { key: 'username', value: username, type: String },
            { key: 'password', value: password, type: String }]
        )
        return (async () => {
            let user = await User.findOne({username})

            if(!user || password !== user.password) throw new AuthError ('invalid username or password')
            
            return user.id
        })()
    },

    retrieveUser(id) {
        validate(
            [{ key: 'id', value: id, type: String }]
        )
        return (async () => {
            const user = await User.findById(id, { '_id': 0, password: 0, __v: 0 }).lean()
            debugger
            if(!user) throw new NotFoundError (`user with id ${id} not found`)
            
            user.id = id

            return user
        })()
    }
}

module.exports = logic



