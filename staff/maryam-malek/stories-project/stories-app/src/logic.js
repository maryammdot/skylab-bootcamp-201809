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

    addStory(title, audioLanguage, textLanguage) {
        validate([
            { key: 'title', value: title, type: String },
            { key: 'audioLanguage', value: audioLanguage, type: String },
            { key: 'textLanguage', value: textLanguage, type: String }
        ])

        return fetch(`${this.url}/users/${this._userId}/stories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${this._token}`
            },
            body: JSON.stringify({ title, audioLanguage, textLanguage })
        })
            .then(res => res.json())
            .then(res => {
                
                if (res.error) throw Error(res.error)
                
                return res.data
            })
    },

    listStories() {

        return fetch(`${this.url}/users/${this._userId}/stories`, {
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

    retrieveStory(storyId) {
        validate([
            { key: 'storyId', value: storyId, type: String }
        ])

        return fetch(`${this.url}/users/${this._userId}/stories/${storyId}`, {
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

    updateStory(storyId, title, audioLanguage, textLanguage) {
        validate([
            { key: 'storyId', value: storyId, type: String },
            { key: 'title', value: title, type: String },
            { key: 'audioLanguage', value: audioLanguage, type: String },
            { key: 'textLanguage', value: textLanguage, type: String }
        ])

        return fetch(`${this.url}/users/${this._userId}/stories/${storyId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${this._token}`
            },
            body: JSON.stringify({ title, audioLanguage, textLanguage })
        })
            .then(res => res.json())
            .then(res => {
                
                if (res.error) throw Error(res.error)
            })
    },

    finishStory(storyId) {
        validate([
            { key: 'storyId', value: storyId, type: String }
        ])

        return fetch(`${this.url}/users/${this._userId}/stories/${storyId}/finish`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${this._token}`
            }
        })
            .then(res => res.json())
            .then(res => {
                
                if (res.error) throw Error(res.error)
            })
    },

    workInStory(storyId) {
        validate([
            { key: 'storyId', value: storyId, type: String }
        ])

        return fetch(`${this.url}/users/${this._userId}/stories/${storyId}/process`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${this._token}`
            }
        })
            .then(res => res.json())
            .then(res => {
                
                if (res.error) throw Error(res.error)
            })
    },

    saveStoryCover(storyId, cover) {
        validate([
            { key: 'storyId', value: storyId, type: String }
            // { key: 'cover', value: cover, type: String } TYPE??????
        ])

        let file = new FormData()

        file.append('avatar', cover)

        return fetch(`${this.url}/users/${this._userId}/stories/${storyId}/cover`, {
            method: 'POST',
            // headers: {
            //     'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundaryzuW5nPZQFQCwQtg4'
            // },
            body: file
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
            })
    },

    // CREC QUE AQUESTA FUNCIÓ NO LA HE DE FER PERQUÈ HO FARÀ SOL QUAN POSI LA RUTA AL SRC DEL IMAGE DE HTML

    // retrieveStoryCover(storyId) {
    //     validate([
    //         { key: 'storyId', value: storyId, type: String }
    //     ])

    //     return fetch(`${this.url}/users/${this._userId}/stories/${storyId}/cover`, {
    //         method: 'GET',
    //         headers: {
    //             'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundaryzuW5nPZQFQCwQtg4'
    //         }
    //     })
    //         .then(res => res.json())
    //         .then(res => {
    //             if (res.error) throw Error(res.error)

    //             return res.data
    //         })
    // },

    removeStory(storyId) {
        validate([
            { key: 'storyId', value: storyId, type: String }
        ])

        return fetch(`${this.url}/users/${this._userId}/stories/${storyId}`, {
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

    addPage(storyId, index, text) {
        validate([
            { key: 'storyId', value: storyId, type: String },
            { key: 'index', value: index, type: Number },
            { key: 'text', value: text, type: String }
        ])

        return fetch(`${this.url}/users/${this._userId}/stories/${storyId}/pages`, {
            method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Authorization': `Bearer ${this._token}`
                },
                body: JSON.stringify({ index, text })
            })
                .then(res => res.json())
                .then(res => {
                    if (res.error) throw Error(res.error)

                    return res.data
                })
    },

    updatePage(pageId, storyId, index, text) {
        validate([
            { key: 'pageId', value: pageId, type: String },
            { key: 'storyId', value: storyId, type: String },
            { key: 'index', value: index, type: Number },
            { key: 'text', value: text, type: String }
        ])
        
        return fetch(`${this.url}/users/${this._userId}/stories/${storyId}/pages/${pageId}`, {
            method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Authorization': `Bearer ${this._token}`
                },
                body: JSON.stringify({ index, text })
            })
                .then(res => res.json())
                .then(res => {
                    
                    if (res.error) throw Error(res.error)
                })
    },

    removePage(pageId, storyId) {
        validate([
            { key: 'pageId', value: pageId, type: String },
            { key: 'storyId', value: storyId, type: String }
        ])
        
        return fetch(`${this.url}/users/${this._userId}/stories/${storyId}/pages/${pageId}`, {
            method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this._token}`
                }
            })
                .then(res => res.json())
                .then(res => {
                    
                    if (res.error) throw Error(res.error)
                })
    }
}

// export default logic
module.exports = logic