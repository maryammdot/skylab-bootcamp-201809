const logic = require('./logic')

const { expect } = require('chai')

// running test from CLI
// normal -> $ mocha src/logic.spec.js --timeout 10000
// debug -> $ mocha debug src/logic.spec.js --timeout 10000

describe('logic', () => {
    describe('register', () => {
        it('should succeed on correct data', () => {

            logic.registerUser('John', 'Doe', `johnny`, '123')
            const users = lo._users
            expect(users.length).to.equal(1)
            expect(user.name).to.equal('John')

            expect(() =>
                logic.registerUser('John', 'Doe', `johnny`, '123')
            ).not.to.throw

        })

        it('should fail on trying to register twice same user', () => {
            expect(() =>
                logic.registerUser('John', 'Doe', `u`, '123')
            ).to.throw(Error, `username u already registered`)
        })

        it('should fail on undefined name', () => {
            expect(() =>
                logic.registerUser(undefined, 'Doe', 'jd', '123')
            ).to.throw(TypeError, 'undefined is not a string')
        })

        // TODO other cases
    })
    describe('login', () => {
        describe('with existing user', () => {
            let username, password, user

            beforeEach(() => {
                const name = 'John', surname = 'Doe'

                username = `johnny2`
                password = `123`

                users = {name, surname, username, password}
                logic._users = [user]
            })

            it('should succeed on correct data', () =>
                expect(() =>
                    logic.login(username, password)
                ).not.to.throw
            )

            it('should fail on wrong username', () => {
                username = `dummy`
                expect(() =>
                    logic.login(username, password)
                ).to.throw(Error, 'invalid username or password')
            })

            it('should fail on wrong password', () => {
                password = 'pepito'

                expect(() =>
                    logic.login(username, password)
                ).to.throw(Error, 'invalid username or password')
            })
            afterEach(() => {
                logic._users = []
            })
        })

        it('should fail on undefined username', () => {
            const username = undefined

            expect(() =>
                logic.login(username, '123')
            ).to.throw(Error, `${username} is not a string`)
        })

        it('should fail on boolean username', () => {
            const username = true

            expect(() =>
                logic.login(username, '123')
            ).to.throw(Error, `${username} is not a string`)
        })

        it('should fail on numeric username', () => {
            const username = 123

            expect(() =>
                logic.login(username, '123')
            ).to.throw(Error, `${username} is not a string`)
        })

        // TODO other cases
    })
})