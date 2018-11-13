const { User, Postit } = require('./data')

const logic = {
    registerUser(name, surname, username, password) {
        if (typeof name !== 'string') throw TypeError(`${name} is not a string`)
        if (typeof surname !== 'string') throw TypeError(`${surname} is not a string`)
        if (typeof username !== 'string') throw TypeError(`${username} is not a string`)
        if (typeof password !== 'string') throw TypeError(`${password} is not a string`)

        if (!name.trim()) throw Error('name is empty or blank')
        if (!surname.trim()) throw Error('surname is empty or blank')
        if (!username.trim()) throw Error('username is empty or blank')
        if (!password.trim()) throw Error('password is empty or blank')

        return User.findByUsername(username)
            .then(user => {
                if (user) throw Error(`username ${username} already registered`)
        
                user = new User({ name, surname, username, password })
        
                return user.save()
            })

    },

    authenticateUser(username, password) {
        if (typeof username !== 'string') throw TypeError(`${username} is not a string`)
        if (typeof password !== 'string') throw TypeError(`${password} is not a string`)

        if (!username.trim()) throw Error('username is empty or blank')
        if (!password.trim()) throw Error('password is empty or blank')

        return User.findByUsername(username)
            .then(user => {
                if (!user || user.password !== password) throw Error('invalid username or password')
        
                return user.id
            })
    },

    retrieveUser(id) {
        if (typeof id !== 'number') throw TypeError(`${id} is not a number`)

        return User.findById(id)
            .then(user => {
                if (!user) throw Error(`user with id ${id} not found`)
                const _user = user.toObject()
        
                delete _user.password
        
                return _user
            })
    },

    savePostit(userId, body) {
        if (typeof userId !== 'number') throw TypeError(`${userId} is not a number`)
        if (typeof body !== 'string') throw TypeError(`${body} is not a string`)
        if (!body.trim().length) throw Error('postit body is empty or blank')

        const postit = new Postit({body})
        return User.findById(userId)
            .then(user => {
                if(!user) throw Error (`user with id ${userId} not found`)
                user.postits.push(postit)
        
                return user.save()
            })
    },

    updatePostit(userId, postitId, body){
        if (typeof userId !== 'number') throw TypeError(`${userId} is not a number`)
        if (typeof postitId !== 'number') throw TypeError(`${postitId} is not a number`)
        if (typeof body !== 'string') throw TypeError(`${body} is not a string`)
        if (!body.trim().length) throw Error('postit body is empty or blank')

        return User.findById(userId)
        .then(user => {
            if(!user) throw Error (`user with id ${userId} not found`)

            const index = user.postits.findIndex(postit => postit.id === postitId)
           
            if(index < 0) throw Error (`postit with id ${postitId} not found in user id ${userId}`)
            
            user.postits[index].body = body
        
            return user.save()
        })
    },
    /**
     * Removes a postit
     * 
     * @param {number} userId The user id 
     * @param {number} postitId The postit id
     */
    deletePostit(userId, postitId) {
        if (typeof userId !== 'number') throw TypeError(`${userId} is not a number`)
        if (typeof postitId !== 'number') throw TypeError(`${postitId} is not a number`)
        return User.findById(userId)
            .then(user => {
                if(!user) throw Error (`user with id ${userId} not found`)

                const index = user.postits.findIndex(postit => postit.id === postitId)
                if(index < 0) throw Error (`postit with id ${postitId} not found in user id ${userId}`)

                let pos1 = user.postits.slice(0, index)
                let pos2 = user.postits.slice(index + 1)

                // By splice is directly, not with slice 
                // postits.splice(index, 1)

                //with filter
                // const _postits = postits.filter(postit => postit.id === postitId)
                // if(_postits.length !== postits.length - 1) throw Error (`postit with id ${postitId} not found in user id ${userId}`)

        
                let _postits = pos1.concat(pos2)
        
                user.postits = _postits
        
                return user.save()
            })

    }
}

module.exports = logic