require('dotenv').config()

const { MongoClient } = require('mongodb')
const { expect } = require('chai')
const { User } = require('.')

const { env: { MONGO_URL } } = process

describe('User (model)', () => {
    let client, users

    before(() => {
        client = new MongoClient(MONGO_URL, { useNewUrlParser: true })

        return client.connect()
            .then(() => {
                const db = client.db('postit-test')

                users = db.collection('users')

                User._collection = users
            })
    })

    describe('save', () => {
        let name, surname, username, password

        beforeEach(() => {
            name = `name-${Math.random()}`
            surname = `surname-${Math.random()}`
            username = `username-${Math.random()}`
            password = `password-${Math.random()}`

            return users.deleteMany()
        })

        it('should succeed on correct data', () =>
            new User({ name, surname, username, password }).save()
                .then(() => users.find().toArray())
                .then(_users => {
                    expect(_users.length).to.equal(1)

                    const [user] = _users

                    expect(user.name).to.equal(name)
                    expect(user.surname).to.equal(surname)
                    expect(user.username).to.equal(username)
                    expect(user.password).to.equal(password)
                })
        )

        describe('when user already exists', () => {
            let name, surname, username, password, id, newName

            beforeEach(() => {
                name = `name-${Math.random()}`
                surname = `surname-${Math.random()}`
                username = `username-${Math.random()}`
                password = `password-${Math.random()}`

                return new User({ name, surname, username, password }).save()
                    .then(() => users.find().toArray())
                    .then(_users => {
                        let _user = _users[0]
                        return _user
                    })
                    .then(_user => id = _user.id)
            })

            it('should succeed on correct username', () => {
                return users.find().toArray()
                    .then(_users => {
                        expect(_users.length).to.equal(1)
                        let _user = _users[0]
                        expect(_user).to.exist
                        expect(_user.name).to.equal(name)
                        expect(_user.surname).to.equal(surname)
                        expect(_user.username).to.equal(username)
                        expect(_user.password).to.equal(password)

                        newName = `${name}-${Math.random()}`

                        const __user = new User({ name: newName, surname, username, password })
                        __user.id = id
                        return __user.save()
                    })
                    .then(() => users.find().toArray())
                    .then(_users => {
                        debugger
                        expect(_users.length).to.equal(1)
                        _user = _users[0]
                        expect(_user).to.exist

                        expect(_user.name).to.equal(newName)
                        expect(_user.surname).to.equal(surname)
                        expect(_user.username).to.equal(username)
                        expect(_user.password).to.equal(password)
                    })
            })
        })
    })

    describe('findByUsername', () => {
        let name, surname, username, password

        beforeEach(() => {
            name = `name-${Math.random()}`
            surname = `surname-${Math.random()}`
            username = `username-${Math.random()}`
            password = `password-${Math.random()}`

            return users.deleteMany()

                .then(() => new User({ name, surname, username, password }).save())
        })

        it('should succeed on correct username', () =>
            User.findByUsername(username)
                .then(_user => {
                    expect(_user).to.exist
                    expect(_user).to.be.instanceOf(User)

                    expect(_user.name).to.equal(name)
                    expect(_user.surname).to.equal(surname)
                    expect(_user.username).to.equal(username)
                    expect(_user.password).to.equal(password)
                })
        )
    })

    describe('findById', () => {
        let name, surname, username, password, id

        beforeEach(() => {
            name = `name-${Math.random()}`
            surname = `surname-${Math.random()}`
            username = `username-${Math.random()}`
            password = `password-${Math.random()}`

            return users.deleteMany()

                .then(() => new User({ name, surname, username, password }).save())
                .then(() => users.find().toArray())
                .then(_users => {
                    let _user = _users[0]
                    id = _user.id
                })
        })

        it('should succeed on correct id', () =>
            User.findById(id)
                .then(_user => {
                    expect(_user).to.exist
                    expect(_user).to.be.instanceOf(User)
                    expect(_user.name).to.equal(name)
                    expect(_user.id).to.equal(id)
                    expect(_user.surname).to.equal(surname)
                    expect(_user.username).to.equal(username)
                    expect(_user.password).to.equal(password)
                })

        )
    })
})