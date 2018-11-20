const validate = require('./utils/validate')

const { AlreadyExistsError, AuthError, NotFoundError } = require('./errors')

//If I don't require sessionstorage here it doesn't work!!!!

global.sessionStorage = require('sessionstorage')

const logic = {
    _userId: sessionStorage.getItem('userId') || null,
    _token: sessionStorage.getItem('token') || null,
    url: 'http://localhost:5000/api',

    register(name, surname, username, password) {
        validate([
            { key: 'name', value: name, type: String },
            { key: 'surname', value: surname, type: String },
            { key: 'username', value: username, type: String },
            { key: 'password', value: password, type: String }]
        )

        return fetch(`${this.url}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify({ name, surname, username, password })
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
            })
    },

    login(username, password) {
        validate([
            { key: 'username', value: username, type: String },
            { key: 'password', value: password, type: String }]
        )

        return fetch(`${this.url}/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify({ username, password })
        })
            .then(res => res.json())
            .then(res => {
                
                if (res.error) throw Error(res.error)

                this._userId = res.data.id
                this._token = res.data.token

                sessionStorage.setItem('userId', res.data.id)
                sessionStorage.setItem('token', res.data.token)
            })
    },

    retrieveUser() {

        return fetch(`${this.url}/users/${this._userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${this._token}`
            }
        })
            .then(res => res.json())
            .then(res => {
                
                if (res.error) throw Error(res.error)

                return res.data
            })
    },

    updateUser() {

    },

    get loggedIn() {
        return !!this._userId
    },

    logout() {
        this._userId = null
        this._token = null


        sessionStorage.removeItem('userId')
        sessionStorage.removeItem('token')
    },

    addStory() {
        
    }

}

// export default logic
module.exports = logic