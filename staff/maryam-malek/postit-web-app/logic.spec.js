const fs = require('fs')
const { User, Postit } = require('./data')
const logic = require('./logic')

const { expect } = require('chai')

// running test from CLI
// normal -> $ mocha src/logic.spec.js --timeout 10000
// debug -> $ mocha debug src/logic.spec.js --timeout 10000

describe('logic', () => {
    before(() => {
        User._file = './data/users.spec.json'
    })
    beforeEach(() => fs.writeFileSync(User._file, JSON.stringify([])))

    !false && describe('user', () => {
        describe('register', () => {
            let name, surname, username, password

            beforeEach(() => {
                name = `name-${Math.random()}`
                surname = `surname-${Math.random()}`
                username = `username-${Math.random()}`
                password = `password-${Math.random()}`
            })

            it('should succeed on correct data', () =>
                logic.registerUser(name, surname, username, password)
                    .then(() => {
                        const json = fs.readFileSync(User._file)

                        const users = JSON.parse(json)

                        const [user] = users

                        expect(user.name).to.equal(name)
                        expect(user.surname).to.equal(surname)
                        expect(user.username).to.equal(username)
                        expect(user.password).to.equal(password)
                    })
            )

            it('should fail on undefined name', () => {
                expect(() => logic.registerUser(undefined, surname, username, password)).to.throw(TypeError, 'undefined is not a string')
            })

            // TODO other test cases
        })

        describe('authenticate', () => {
            let user

            beforeEach(() => {
                user = new User({ name: 'John', surname: 'Doe', username: 'jd', password: '123' })

                fs.writeFileSync(User._file, JSON.stringify([user]))
            })

            it('should authenticate on correct credentials', () => {
                const { username, password } = user

                return logic.authenticateUser(username, password)
                    .then(id => {
                        expect(id).to.exist
                        expect(id).to.be.a('number')

                        const json = fs.readFileSync(User._file)

                        const users = JSON.parse(json)

                        const [_user] = users

                        expect(_user.id).to.equal(id)
                    })
            })

            it('should fail on undefined username', () => {
                expect(() => logic.authenticateUser(undefined, user.password)).to.throw(TypeError, 'undefined is not a string')
            })

            // TODO other test cases
        })

        describe('retrieve', () => {
            let user, postit

            beforeEach(() => {
                postit = new Postit('hello text')
                user = new User({ name: 'John', surname: 'Doe', username: 'jd', password: '123', postits: [postit] })

                fs.writeFileSync(User._file, JSON.stringify([user]))
            })

            it('should succeed on valid id', () =>
                logic.retrieveUser(user.id)
                    .then(_user => {
                        expect(_user).not.to.be.instanceof(User)

                        const { id, name, surname, username, password, postits } = _user

                        expect(id).to.exist
                        expect(id).to.equal(user.id)
                        expect(name).to.equal(user.name)
                        expect(surname).to.equal(user.surname)
                        expect(username).to.equal(user.username)
                        expect(password).to.be.undefined
                        expect(postits).to.exist
                        expect(postits.length).to.equal(1)

                        const [_postit] = postits

                        expect(_postit.id).to.equal(postit.id)
                        expect(_postit.body).to.equal(postit.body)
                    })
            )
        })
    })

    describe('Postits', () => {
        describe('save', () => {
            let user, text

            beforeEach(() => {
                text = 'hello text'
                user = new User({ name: 'John', surname: 'Doe', username: 'jd', password: '123', postits: [] })

                fs.writeFileSync(User._file, JSON.stringify([user]))
            })

            it('should succeed on correct data', () => {
                return logic.savePostit(user.id, text)
                    .then(() => {
                        const json = fs.readFileSync(User._file)

                        const users = JSON.parse(json)

                        const [_user] = users

                        const { postits } = _user

                        const [postit] = postits

                        expect(postits.length).to.equal(1)

                        expect(postit.body).to.equal(text)
                    })
            })
        })

        describe('update', () => {
            let user, postit, text

            beforeEach(() => {
                text = `text-${Math.random()}`
                const hello = 'hello text'
                postit = new Postit({ body: hello })
                user = new User({ name: 'John', surname: 'Doe', username: 'jd', password: '123', postits: [postit] })
                debugger
                fs.writeFileSync(User._file, JSON.stringify([user]))
            })

            it('should succeed on correct data', () =>
                logic.updatePostit(user.id, postit.id, text)
                    .then(() => {
                        const json = fs.readFileSync(User._file)

                        const users = JSON.parse(json)

                        const [_user] = users

                        const { postits } = _user

                        const [_postit] = postits

                        expect(postits.length).to.equal(1)

                        expect(_postit.body).to.equal(text)
                    })
            )
        })

        describe('delete', () => {
            let user, postit

            beforeEach(() => {
                postit = new Postit('hello text')
                user = new User({ name: 'John', surname: 'Doe', username: 'jd', password: '123', postits: [postit] })

                fs.writeFileSync(User._file, JSON.stringify([user]))
            })

            it('should succeed on correct data', () =>
                logic.deletePostit(user.id, postit.id)
                    .then(() => {
                        const json = fs.readFileSync(User._file)

                        const users = JSON.parse(json)

                        const [_user] = users

                        const { postits } = _user

                        const [_postit] = postits

                        expect(postits.length).to.equal(0)

                    })
            )
        })
    })

})