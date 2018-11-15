const { User, Postit } = require('../data')
const { AlreadyExistsError, AuthError, NotFoundError, ValueError } = require('../errors')
const fs = require('fs');

const logic = {
    registerUser(name, surname, username, password) {
        if (typeof name !== 'string') throw TypeError(`${name} is not a string`)
        if (typeof surname !== 'string') throw TypeError(`${surname} is not a string`)
        if (typeof username !== 'string') throw TypeError(`${username} is not a string`)
        if (typeof password !== 'string') throw TypeError(`${password} is not a string`)

        if (!name.trim()) throw new ValueError('name is empty or blank')
        if (!surname.trim()) throw new ValueError('surname is empty or blank')
        if (!username.trim()) throw new ValueError('username is empty or blank')
        if (!password.trim()) throw new ValueError('password is empty or blank')

        return (async () => {

            let user = await User.findOne({ username })
            if (user) throw new AlreadyExistsError(`username ${username} already registered`)

            user = new User({ name, surname, username, password })

            await user.save()
        })()

    },

    authenticateUser(username, password) {
        if (typeof username !== 'string') throw TypeError(`${username} is not a string`)
        if (typeof password !== 'string') throw TypeError(`${password} is not a string`)

        if (!username.trim()) throw new ValueError('username is empty or blank')
        if (!password.trim()) throw new ValueError('password is empty or blank')

        return (async () => {

            const user = await User.findOne({ username })
            if (!user || user.password !== password) throw new AuthError('invalid username or password')

            return user.id

        })()
    },

    retrieveUser(id) {
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)

        if (!id.trim().length) throw new ValueError('id is empty or blank')

        return (async () => {

            const user = await User.findById(id, { _id: 0, password: 0, postits: 0, __v: 0 }).lean()
            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            user.id = id

            return user

        })()
    },

    updateUser(id, name, surname, username, newPassword, password) {
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)
        if (name != null && typeof name !== 'string') throw TypeError(`${name} is not a string`)
        if (surname != null && typeof surname !== 'string') throw TypeError(`${surname} is not a string`)
        if (username != null && typeof username !== 'string') throw TypeError(`${username} is not a string`)
        if (newPassword != null && typeof newPassword !== 'string') throw TypeError(`${newPassword} is not a string`)
        if (typeof password !== 'string') throw TypeError(`${password} is not a string`)

        if (!id.trim().length) throw new ValueError('id is empty or blank')
        if (name != null && !name.trim().length) throw new ValueError('name is empty or blank')
        if (surname != null && !surname.trim().length) throw new ValueError('surname is empty or blank')
        if (username != null && !username.trim().length) throw new ValueError('username is empty or blank')
        if (newPassword != null && !newPassword.trim().length) throw new ValueError('newPassword is empty or blank')
        if (!password.trim().length) throw new ValueError('password is empty or blank')
        return (async () => {

            const user = await User.findById(id)
            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            if (user.password !== password) throw new AuthError('invalid password')

            if (username) {
                const _user = await User.findOne({ username })
                if (_user) throw new AlreadyExistsError(`username ${username} already exists`)

                name != null && (user.name = name)
                surname != null && (user.surname = surname)
                user.username = username
                newPassword != null && (user.password = newPassword)

                await user.save()
            } else {
                name != null && (user.name = name)
                surname != null && (user.surname = surname)
                newPassword != null && (user.password = newPassword)

                await user.save()
            }

        })()
    },

    addPicture(id, file) {

        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)

        if (!id.trim().length) throw new ValueError('id is empty or blank')

        return (async () => {

            const user = await User.findById(id, { _id: 0, password: 0, postits: 0, __v: 0 }).lean()
            if (!user) throw new NotFoundError(`user with id ${id} not found`)
            
            const path = __dirname + `/../data/users/${id}`

            fs.exists(path, exists => {
                
                if (!exists) {

                    fs.mkdir(path, err => { 
                        debugger
                        if (err) throw Error(err.message) })
                }
            })
            
            await fs.writeFile(`${path}/${file.originalname}`, file.buffer, err => {
                debugger
                    if (err) throw Error(err.message)
                })
        })()
    },

    retrievePicture(id) {
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)

        if (!id.trim().length) throw new ValueError('id is empty or blank')

        return (async () => {

            const user = await User.findById(id, { _id: 0, password: 0, postits: 0, __v: 0 }).lean()
            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            const path = __dirname + `/../data/users/${id}/`

            const files = fs.readdirSync(path)
            return files[0]
        })()
    },

    addColaborator(id, username) {
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)
        if (username != null && typeof username !== 'string') throw TypeError(`${username} is not a string`)

        if (!id.trim().length) throw new ValueError('id is empty or blank')
        if (username != null && !username.trim().length) throw new ValueError('username is empty or blank')

        return (async () => {

            const user = await User.findById(id)
            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            const friend = await User.findOne({ username }).lean()
            if (!friend) throw new NotFoundError(`user with username ${username} not found`)

            user.colaborators.push(friend._id)

            await user.save()
        })()

    },

    listColaborators(id) {
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)

        if (!id.trim().length) throw new ValueError('id is empty or blank')

        // return (async () => {

        //     const user = await User.findById(id)
        //     if (!user) throw new NotFoundError(`user with id ${id} not found`)

        //     const colaborators = await user.colaborators.map(colaborator =>colaborator.toString())

        //     let promises = []

        //     const colNames = await colaborators.map(async id => {
        //         promises.push( User.findById(id)) 
        //         return promises
        //     })

        //     return Promise.all(colNames)
        //     .then(res=> {
        //         return res.map(i=> i.username)
        //     })

        // })()

        return (async () => {

            const user = await User.findById(id, { password: 0, postits: 0, __v: 0 })
            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            let promises = []

            for (var i = 0; i < user.colaborators.length; i++) {
                promises.push(User.findById(user.colaborators[i]))
            }
            return Promise.all(promises)
                .then(res => res.map(item => item.username))
        })()
    },

    getUsername(id) {
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)

        if (!id.trim().length) throw new ValueError('id is empty or blank')

        return (async () => {

            const user = await User.findById(id)
            if (!user) throw new NotFoundError(`user with id ${id} not found`)
            return user.username
        })()
    },

    /**
     * Adds a postit
     * 
     * @param {string} id The user id
     * @param {string} text The postit text
     * 
     * @throws {TypeError} On non-string user id, or non-string postit text
     * @throws {Error} On empty or blank user id or postit text
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong user id
     */
    addPostit(id, text) {
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)

        if (!id.trim().length) throw new ValueError('id is empty or blank')

        if (typeof text !== 'string') throw TypeError(`${text} is not a string`)

        if (!text.trim().length) throw new ValueError('text is empty or blank')

        return (async () => {
            const user = await User.findById(id)
            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            const postit = new Postit({ user: id, text, status: 'TODO' })

            await postit.save()

        })()
    },

    listPostits(id) {
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)

        if (!id.trim().length) throw new ValueError('id is empty or blank')
        return (async () => {
            const user = await User.findById(id).lean()
            if (!user) throw new NotFoundError(`user with id ${id} not found`)
            let postits = await Postit.find({ user: id }).lean()

            const _postits = postits.map(postit => {
                postit.id = postit._id.toString()
                delete postit._id
                postit.user = postit.user.toString()
                //PROVA!!!!!
                Postit.asigned ? postit.asigned.toString() : undefined
                return postit
            })
            return _postits
        })()

    },

    /**
     * Removes a postit
     * 
     * @param {string} id The user id
     * @param {string} postitId The postit id
     * 
     * @throws {TypeError} On non-string user id, or non-string postit id
     * @throws {Error} On empty or blank user id or postit text
     * 
     * @returns {Promise} Resolves on correct data, rejects on wrong user id, or postit id
     */
    removePostit(id) {
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)

        if (!id.trim().length) throw new ValueError('id is empty or blank')
        return (async () => {
            const postit = await Postit.findById(id)
            if (!postit) throw new NotFoundError(`postit with id ${id} not found `)

            await postit.remove()

        })()
    },

    modifyPostit(id, text) {
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)

        if (!id.trim().length) throw new ValueError('id is empty or blank')

        if (typeof text !== 'string') throw TypeError(`${text} is not a string`)

        if (!text.trim().length) throw new ValueError('text is empty or blank')

        return (async () => {
            const postit = await Postit.findById(id)

            if (!postit) throw new NotFoundError(`postit with id ${postitId} not found`)

            postit.text = text

            await postit.save()
        })()
    },

    modifyStatus(id, newStatus) {
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)

        if (!id.trim().length) throw new ValueError('id is empty or blank')

        if (typeof newStatus !== 'string') throw TypeError(`${newStatus} is not a string`)

        if (!newStatus.trim().length) throw new ValueError('status is empty or blank')

        return (async () => {
            const postit = await Postit.findById(id)

            if (!postit) throw new NotFoundError(`postit with id ${id} not found`)

            postit.status = newStatus

            await postit.save()
        })()
    },

    asignPostit(id, postitId, username) {
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)

        if (!id.trim().length) throw new ValueError('id is empty or blank')

        if (typeof postitId !== 'string') throw TypeError(`${postitId} is not a string`)

        if (!postitId.trim().length) throw new ValueError('postit id is empty or blank')

        if (typeof username !== 'string') throw TypeError(`${username} is not a string`)

        if (!username.trim().length) throw new ValueError('username is empty or blank')

        return (async () => {
            const user = await User.findById(id)

            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            const postit = await Postit.findById(postitId)

            if (!postit) throw new NotFoundError(`postit with id ${id} not found`)

            const friend = await User.findOne({ username })

            if (!friend) throw new NotFoundError(`user with username ${username} not found`)

            postit.asigned = friend._id

            await postit.save()
        })()

    },

    listAsignedPostits(id) {
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)

        if (!id.trim().length) throw new ValueError('id is empty or blank')

        return (async () => {
            const user = await User.findById(id).lean()
            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            let postits = await Postit.find({ asigned: id }).lean()
            const _postits = postits.map(postit => {
                postit.id = postit._id.toString()
                delete postit._id
                postit.user = postit.user.toString()
                postit.asigned = postit.asigned.toString()
                return postit
            })
            return _postits
        })()
    },

    removeAsigned(id, postitId) {
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)

        if (!id.trim().length) throw new ValueError('id is empty or blank')

        if (typeof postitId !== 'string') throw TypeError(`${postitId} is not a string`)

        if (!postitId.trim().length) throw new ValueError('postit id is empty or blank')

        return (async () => {
            const user = await User.findById(id)

            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            const postit = await Postit.findById(postitId)

            if (!postit) throw new NotFoundError(`postit with id ${postitId} not found`)

            if (postit.asigned.toString() !== id) throw new AuthError(`user with id ${id} can not delete postit with id ${postitId}`)

            postit.asigned = undefined

            await postit.save()
        })()
    }
}

module.exports = logic