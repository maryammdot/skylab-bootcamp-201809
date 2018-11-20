// import logic from './logic'
const logic = require('./logic')
const { mongoose, models: { User, Story, Page } } = require('stories-data')

require('isomorphic-fetch')
global.sessionStorage = require('sessionstorage')
const { expect } = require('chai')

const { AlreadyExistsError, AuthError, NotFoundError, ValueError } = require('./errors')


describe('logic', () => {
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
                const res = await logic.register(name, surname, username, password)

                expect(res).to.be.undefined
            })

            it('should fail on repeted username', async () => {
                try {
                    await logic.register(name, surname, username, password)
                    // expect(true).to.be.false
                } catch (err) {
                    expect(err).to.be.instanceof(Error)
                    expect(err.message).to.equal(`username ${username} already registered`)
                }

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

        describe('login', () => {
            describe('with existing user', () => {
                let username, password

                beforeEach(async () => {
                    name = `n-${Math.random()}`
                    surname = `s-${Math.random()}`
                    username = `u-${Math.random()}`
                    password = `p-${Math.random()}`

                    await logic.register(name, surname, username, password)
                })

                it('should succeed on correct data', async () => {
                    const res = await logic.login(username, password)

                    expect(res).to.be.undefined
                })

                it('should fail on undefined username', () => {
                    expect(() => logic.login(undefined, password)).to.throw(TypeError, 'undefined is not a string')
                })

                it('should fail on empty username', () => {
                    expect(() => logic.login('', password)).to.throw(ValueError, 'username is empty or blank')
                })

                it('should fail on blank username', () => {
                    expect(() => logic.login('   \t\n', password)).to.throw(ValueError, 'username is empty or blank')
                })

                // TODO other test cases

            })

            describe('without existing user', () => {

                it('should fail with unregistered username', async () => {
                    try {
                        let username = `username-${Math.random()}`
                        await logic.login(username, `password-${Math.random()}`)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`invalid username or password`)
                    }
                })
            })
        })

        describe('logout', () => {
            let name, surname, username, password

            beforeEach(async () => {
                name = `n-${Math.random()}`
                surname = `s-${Math.random()}`
                username = `u-${Math.random()}`
                password = `p-${Math.random()}`

                await logic.register(name, surname, username, password)
                await logic.login(username, password)
            })

            it('should succeed on correct data', async () => {
                const res = await logic.logout()

                expect(res).to.be.undefined
            })

            // TODO other test cases
        })

        describe('retrieve user', () => {
            describe('with existing user', () => {
                let name, surname, username, password

                beforeEach(async () => {
                    name = `n-${Math.random()}`
                    surname = `s-${Math.random()}`
                    username = `u-${Math.random()}`
                    password = `p-${Math.random()}`

                    await logic.register(name, surname, username, password)
                    await logic.login(username, password)
                })

                it('should succeed on correct data', async () => {
                    const user = await logic.retrieveUser()

                    expect(user.id).not.to.be.undefined
                    expect(user.name).to.equal(name)
                    expect(user.surname).to.equal(surname)
                    expect(user.username).to.equal(username)
                })

                // TODO other test cases
            })
        })


    })


    describe('stories', () => {

        describe('add story', () => {
            describe('with existing user', () => {
                let name, surname, username, password

                beforeEach(async () => {
                    name = `n-${Math.random()}`
                    surname = `s-${Math.random()}`
                    username = `u-${Math.random()}`
                    password = `p-${Math.random()}`

                    await logic.register(name, surname, username, password)
                    await logic.login(username, password)
                })

                it('should succeed on correct data', async () => {
                    const user = await logic.retrieveUser()

                    expect(user.id).not.to.be.undefined
                    expect(user.name).to.equal(name)
                    expect(user.surname).to.equal(surname)
                    expect(user.username).to.equal(username)
                })

                // TODO other test cases
            })
        })
    })

})