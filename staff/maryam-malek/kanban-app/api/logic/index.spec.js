require('dotenv').config()

const mongoose = require('mongoose')
const { User, Postit } = require('../data')
const logic = require('.')
const { AlreadyExistsError } = require('../errors')

const { expect } = require('chai')

const { env: { MONGO_URL } } = process

// running test from CLI
// normal -> $ mocha src/logic.spec.js --timeout 10000
// debug -> $ mocha debug src/logic.spec.js --timeout 10000

describe('logic', () => {

    before(() => mongoose.connect(`${MONGO_URL}/postit-test`, { useNewUrlParser: true }))

    beforeEach(() => Promise.all([User.deleteMany(), Postit.deleteMany()]))

    describe('user', () => {
        describe('register', () => {
            let name, surname, username, password

            beforeEach(() => {
                name = `name-${Math.random()}`
                surname = `surname-${Math.random()}`
                username = `username-${Math.random()}`
                password = `password-${Math.random()}`
            })

            it('should succeed on correct data', async () => {
                const res = await logic.registerUser(name, surname, username, password)
                expect(res).to.be.undefined
                const _users = await User.find()
                expect(_users.length).to.equal(1)

                const [user] = _users

                expect(user.id).to.be.a('string')
                expect(user.name).to.equal(name)
                expect(user.surname).to.equal(surname)
                expect(user.username).to.equal(username)
                expect(user.password).to.equal(password)
            })


            it('should fail on undefined name', () => {
                expect(() => logic.registerUser(undefined, surname, username, password)).to.throw(TypeError, 'undefined is not a string')
            })

            // TODO other test cases
        })

        describe('authenticate', () => {
            let user

            beforeEach(async () => {
                user = new User({ name: 'John', surname: 'Doe', username: 'jd', password: '123' })
                await user.save()
            })

            it('should authenticate on correct credentials', async () => {
                const { username, password } = user

                const id = await logic.authenticateUser(username, password)
                expect(id).to.exist
                expect(id).to.be.a('string')

                const _users = await User.find()
                const [_user] = _users

                expect(_user.id).to.equal(id)

            })


            it('should fail on undefined username', () => {
                expect(() => logic.authenticateUser(undefined, user.password)).to.throw(TypeError, 'undefined is not a string')
            })

            // TODO other test cases
        })

        describe('retrieve', () => {
            let user, postit

            beforeEach(async () => {
                postit = new Postit({ text: 'hello text' })
                user = new User({ name: 'John', surname: 'Doe', username: 'jd', password: '123', postits: [postit] })

                await user.save()
            })

            it('should succeed on valid id', async () => {
                const _user = await logic.retrieveUser(user.id)
                expect(_user).not.to.be.instanceof(User)

                const { id, name, surname, username, password, postits } = _user

                expect(id).to.exist
                expect(id).to.equal(user.id)
                expect(name).to.equal(user.name)
                expect(surname).to.equal(user.surname)
                expect(username).to.equal(user.username)
                expect(password).to.be.undefined
                expect(postits).not.to.exist
            })

        })

        describe('update', () => {
            let user

            beforeEach(async () => {
                user = new User({ name: 'John', surname: 'Doe', username: 'jd', password: '123' })

                await user.save()
            })

            it('should update on correct data and password', async () => {
                const { id, name, surname, username, password } = user

                const newName = `${name}-${Math.random()}`
                const newSurname = `${surname}-${Math.random()}`
                const newUsername = `${username}-${Math.random()}`
                const newPassword = `${password}-${Math.random()}`
                await logic.updateUser(id, newName, newSurname, newUsername, newPassword, password)
                const _users = await User.find()
                const [_user] = _users

                expect(_user.id).to.equal(id)

                expect(_user.name).to.equal(newName)
                expect(_user.surname).to.equal(newSurname)
                expect(_user.username).to.equal(newUsername)
                expect(_user.password).to.equal(newPassword)
            })



            it('should update on correct id, name and password (other fields null)', async () => {
                const { id, name, surname, username, password } = user

                const newName = `${name}-${Math.random()}`

                await logic.updateUser(id, newName, null, null, null, password)
                const _users = await User.find()
                const [_user] = _users

                expect(_user.id).to.equal(id)

                expect(_user.name).to.equal(newName)
                expect(_user.surname).to.equal(surname)
                expect(_user.username).to.equal(username)
                expect(_user.password).to.equal(password)
            })


            it('should update on correct id, surname and password (other fields null)', async () => {
                const { id, name, surname, username, password } = user

                const newSurname = `${surname}-${Math.random()}`

                await logic.updateUser(id, null, newSurname, null, null, password)
                const _users = await User.find()
                const [_user] = _users

                expect(_user.id).to.equal(id)

                expect(_user.name).to.equal(name)
                expect(_user.surname).to.equal(newSurname)
                expect(_user.username).to.equal(username)
                expect(_user.password).to.equal(password)

            })

            // TODO other combinations of valid updates

            it('should fail on undefined id', () => {
                const { id, name, surname, username, password } = user

                expect(() => logic.updateUser(undefined, name, surname, username, password, password)).to.throw(TypeError, 'undefined is not a string')
            })

            // TODO other test cases

            describe('with existing user', () => {
                let user2

                beforeEach(async () => {
                    user2 = new User({ name: 'John', surname: 'Doe', username: 'jd2', password: '123' })

                    await user2.save()
                })

                it('should update on correct data and password', async () => {

                    const newUsername = 'jd'
                    try {

                        await logic.updateUser(user.id, null, null, newUsername, null, user.password)
                    } catch (err) {

                        expect(err).to.be.instanceof(AlreadyExistsError)

                        const _user = await User.findById(user.id)
                        expect(_user.id).to.equal(user.id)

                        expect(_user.name).to.equal(user.name)
                        expect(_user.surname).to.equal(user.surname)
                        expect(_user.username).to.equal(user.username)
                        expect(_user.password).to.equal(user.password)
                    }
                })
            })
        })
    })


    describe('postits', () => {
        describe('add', () => {
            let user, text

            beforeEach(async () => {
                user = new User({ name: 'John', surname: 'Doe', username: 'jd', password: '123' })

                text = `text-${Math.random()}`

                await user.save()
            })

            it('should succeed on correct data', async () => {

                await logic.addPostit(user.id, text)
                const postits = await Postit.find()

                expect(postits.length).to.equal(1)

                const [postit] = postits

                expect(user.id).to.equal(postit.user.toString())

                expect(postit.text).to.equal(text)
            })

            // TODO other test cases
        })

        describe('list', () => {
            let user, postit, postit2

            beforeEach(async () => {
                user = new User({ name: 'John', surname: 'Doe', username: 'jd', password: '123' })

                postit = new Postit({ user: user.id, text: 'hello text', status: 'TODO' })
                postit2 = new Postit({ user: user.id, text: 'hello text 2', status: 'TODO' })

                await user.save()
                await postit.save()
                await postit2.save()
            })

            it('should succeed on correct data', async () => {

                const postits = await logic.listPostits(user.id)
                const _postits = await Postit.find({ user: user._id })

                expect(_postits.length).to.equal(2)
                const [_postit, _postit2] = _postits

                expect(_postit.id).to.equal(postit.id.toString())
                expect(_postit.text).to.equal(postit.text)
                expect(_postit.user.toString()).to.equal(user.id)

                expect(_postit2.id).to.equal(postit2.id.toString())
                expect(_postit2.text).to.equal(postit2.text)
                expect(_postit2.user.toString()).to.equal(user.id)

                const [__postit, __postit2] = postits

                expect(_postit.id).to.equal(__postit.id)
                expect(_postit.text).to.equal(__postit.text)
                expect(_postit.user.toString()).to.equal(__postit.user.toString())

                expect(_postit2.id).to.equal(__postit2.id)
                expect(_postit2.text).to.equal(__postit2.text)
                expect(_postit2.user.toString()).to.equal(__postit2.user.toString())

            })
        })

        describe('remove', () => {
            let user, postit

            beforeEach(async () => {
                user = new User({ name: 'John', surname: 'Doe', username: 'jd', password: '123' })
                postit = new Postit({ user: user.id, text: 'hello text', status: 'TODO' })

                await user.save()
                await postit.save()
            })

            it('should succeed on correct data', async () => {
                await logic.removePostit(postit.id)
                const postits = await Postit.find()
                expect(postits.length).to.equal(0)

            })
        })

        describe('modify', () => {
            let user, postit, newText

            beforeEach(async () => {
                user = new User({ name: 'John', surname: 'Doe', username: 'jd', password: '123' })
                postit = new Postit({ user: user.id, text: 'hello text', status: 'TODO' })
                newText = `new-text-${Math.random()}`

                await user.save()
                await postit.save()
            })

            it('should succeed on correct data', async () => {

                await logic.modifyPostit(postit.id, newText)
                const postits = await Postit.find()

                expect(postits.length).to.equal(1)

                const [postit] = postits

                expect(postit.text).to.equal(newText)

            })
        })

        describe('modify status', () => {
            let user, postit, newStatus

            beforeEach(async () => {
                user = new User({ name: 'John', surname: 'Doe', username: 'jd', password: '123'})
                postit = new Postit({ user: user.id, text: 'hello text', status: 'TODO' })

                newStatus = 'DONE'

                await user.save()
                await postit.save()

            })

            it('should succeed on correct data', async () => {
                await logic.modifyStatus(postit.id, newStatus)
                const postits = await Postit.find()

                expect(postits.length).to.equal(1)

                const [postit] = postits

                expect(postit.status).to.equal(newStatus)
            })
        })
    })

    afterEach(() => User.deleteMany())

    after(() => mongoose.disconnect())
})