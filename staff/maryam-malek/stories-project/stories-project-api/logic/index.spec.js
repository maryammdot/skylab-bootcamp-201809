const { User, Book, Page } = require('../data')
const logic = require('./index')
const { AlreadyExistsError, AuthError, NotFoundError, ValueError } = require('../errors')

const { expect } = require('chai')
const mongoose = require('mongoose')

const MONGO_URL = 'mongodb://localhost:27017/story-logic-test'

describe('logic', () => {
    before(() => mongoose.connect(MONGO_URL, { useNewUrlParser: true, useCreateIndex: true }))
    beforeEach(() => Promise.all([User.deleteMany()]))
    describe('users', () => {
        describe('register', () => {
            let name, surname, username, password

            beforeEach(() => {
                name = `n-${Math.random()}`
                surname = `s-${Math.random()}`
                username = `u-${Math.random()}`
                password = `p-${Math.random()}`
            })

            it('should succeed on correct data', async () => {
                await logic.register(name, surname, username, password)
               
                const _user = await User.findOne({ username })
               
                expect(_user.id).to.be.a('string')
                expect(_user.name).to.equal(name)
                expect(_user.surname).to.equal(surname)
                expect(_user.username).to.equal(username)
                expect(_user.password).to.equal(password)

            })

            it('should fail on repeted username', async () => {
                await logic.register(name, surname, username, password)

                expect(() => logic.register(name, surname, username, password)).to.throw(AlreadyExistsError, `username ${username} already registered`)
            })

            it('should fail on undefined name', () => {
                expect(() => logic.register(undefined, surname, username, password)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty name', () => {
                expect(() => logic.register('', surname, username, password)).to.throw(ValueError, 'name is empty or blank')
            })

            it('should fail on blank name', () => {
                expect(() => logic.register('   \t\n', surname, username, password)).to.throw(ValueError, 'name is empty or blank')
            })

            // TODO other test cases
        })
    })
    after(() => mongoose.disconnect())
})