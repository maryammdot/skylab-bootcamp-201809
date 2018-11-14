const logic = {
    _userId: sessionStorage.getItem('userId') || null,
    _token: sessionStorage.getItem('token') || null,

    url: 'NO-URL',

    registerUser(name, surname, username, password) {
        if (typeof name !== 'string') throw TypeError(`${name} is not a string`)
        if (typeof surname !== 'string') throw TypeError(`${surname} is not a string`)
        if (typeof username !== 'string') throw TypeError(`${username} is not a string`)
        if (typeof password !== 'string') throw TypeError(`${password} is not a string`)

        if (!name.trim()) throw Error('name is empty or blank')
        if (!surname.trim()) throw Error('surname is empty or blank')
        if (!username.trim()) throw Error('username is empty or blank')
        if (!password.trim()) throw Error('password is empty or blank')

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
        if (typeof username !== 'string') throw TypeError(`${username} is not a string`)
        if (typeof password !== 'string') throw TypeError(`${password} is not a string`)

        if (!username.trim()) throw Error('username is empty or blank')
        if (!password.trim()) throw Error('password is empty or blank')

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

                const { id, token } = res.data

                this._userId = id
                this._token = token

                sessionStorage.setItem('userId', id)
                sessionStorage.setItem('token', token)
            })
    },

    get loggedIn() {
        return !!this._userId
    },

    logout() {
        this._postits = []
        this._userId = null
        this._token = null

        sessionStorage.removeItem('userId')
        sessionStorage.removeItem('token')
    },

    retrieveUser() {
        return fetch(`${this.url}/users/${this._userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this._token}`
            }
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)

                return res.data
            })
    },

    UpdateProfile(name, surname, username, newPassword, password) {
        if (typeof name !== 'string') throw TypeError(`${name} is not a string`)
        if (typeof surname !== 'string') throw TypeError(`${surname} is not a string`)
        if (typeof username !== 'string') throw TypeError(`${username} is not a string`)
        if (typeof newPassword !== 'string') throw TypeError(`${newPassword} is not a string`)
        if (typeof password !== 'string') throw TypeError(`${password} is not a string`)

        if (!name.trim()) throw Error('name is empty or blank')
        if (!surname.trim()) throw Error('surname is empty or blank')
        if (!username.trim()) throw Error('username is empty or blank')
        if (!newPassword.trim()) throw Error('new password is empty or blank')
        if (!password.trim()) throw Error('password is empty or blank')

        return fetch(`${this.url}/users/${this._userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${this._token}`
            },
            body: JSON.stringify({ name, surname, username, newPassword, password })
        })
            .then(res => res.json())
            .then(res => {
                debugger
                if (res.error) throw Error(res.error)
            })
    },

    addColaborator(username) {
        if (typeof username !== 'string') throw TypeError(`${username} is not a string`)

        if (!username.trim()) throw Error('username is empty or blank')
        
        return fetch(`${this.url}/users/${this._userId}/colaborator`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${this._token}`
            },
            body: JSON.stringify({ colaborator: username })
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
            })
    },

    listColaborators() {
        return fetch(`${this.url}/users/${this._userId}/colaborators`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this._token}`
            }
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)

                return res.data
            })
    },

    addPostit(text) {
        if (typeof text !== 'string') throw TypeError(`${text} is not a string`)

        if (!text.trim()) throw Error('text is empty or blank')
        
        return fetch(`${this.url}/users/${this._userId}/postits`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${this._token}`
            },
            body: JSON.stringify({ text })
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
            })
    },

    listPostits() {
        return fetch(`${this.url}/users/${this._userId}/postits`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this._token}`
            }
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)

                return res.data
            })
    },

    removePostit(id) {
        if (typeof id !== 'string') throw new TypeError(`${id} is not a string`)

        if (!id.trim().length) throw Error('id is empty or blank')

        return fetch(`${this.url}/users/${this._userId}/postits/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${this._token}`
            }
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
            })
    },

    modifyPostit(id, text) {
        if (typeof id !== 'string') throw new TypeError(`${id} is not a string`)

        if (!id.trim().length) throw Error('id is empty or blank')

        if (typeof text !== 'string') throw TypeError(`${text} is not a string`)

        if (!text.trim()) throw Error('text is empty or blank')

        return fetch(`${this.url}/users/${this._userId}/postits/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${this._token}`
            },
            body: JSON.stringify({ text })
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
            })
    },

    modifyStatus(id, status) {
        if (typeof id !== 'string') throw new TypeError(`${id} is not a string`)

        if (!id.trim().length) throw Error('id is empty or blank')

        if (typeof status !== 'string') throw TypeError(`${status} is not a string`)

        if (!status.trim()) throw Error('status is empty or blank')

        return fetch(`${this.url}/users/${this._userId}/postits/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${this._token}`
            },
            body: JSON.stringify({ status })
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
            })
    },

    asignPostit(id, username) {
        if (typeof id !== 'string') throw new TypeError(`${id} is not a string`)

        if (!id.trim().length) throw Error('id is empty or blank')

        if (typeof username !== 'string') throw TypeError(`${username} is not a string`)

        if (!username.trim()) throw Error('username is empty or blank')

        return fetch(`${this.url}/users/${this._userId}/postits/${id}/asign`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${this._token}`
            },
            body: JSON.stringify({ colaborator: username })
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
            })
    },

    removeAsigned(id) {
        if (typeof id !== 'string') throw new TypeError(`${id} is not a string`)

        if (!id.trim().length) throw Error('id is empty or blank')

        return fetch(`${this.url}/users/${this._userId}/postits/${id}/asign`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${this._token}`
            }
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
            })
    },

    listAssignedPostits() {
        return fetch(`${this.url}/users/${this._userId}/postitsAsigned`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this._token}`
            }
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)

                return res.data
            })
    },

    getUsername(id) {
        if (typeof id !== 'string') throw new TypeError(`${id} is not a string`)

        if (!id.trim().length) throw Error('id is empty or blank')

        return fetch(`${this.url}/users/${this._userId}/username/${id}`, {
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
    }
}

// export default logic
module.exports = logic