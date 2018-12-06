const validate = require('./utils/validate')

const logic = {
    _userId: sessionStorage.getItem('userId') || null,
    _token: sessionStorage.getItem('token') || null,
    url: 'NO_URL',
    

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

    // updateUser() {

    // },

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
            { key: 'title', value: title, type: String, optional: true },
            { key: 'audioLanguage', value: audioLanguage, type: String, optional: true },
            { key: 'textLanguage', value: textLanguage, type: String, optional: true }
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

    addFavourite(storyId) {
        validate([
            { key: 'storyId', value: storyId, type: String }
        ])

        return fetch(`${this.url}/users/${this._userId}/stories/${storyId}/favourites`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this._token}`
            }
        })
            .then(res => res.json())
            .then(res => {

                if (res.error) throw Error(res.error)
            })
    },

    removeFavourite(storyId) {
        validate([
            { key: 'storyId', value: storyId, type: String }
        ])

        return fetch(`${this.url}/users/${this._userId}/stories/${storyId}/favourites`, {
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

    listFavourites() {

        return fetch(`${this.url}/users/${this._userId}/favourites`, {
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

    saveStoryCover(storyId, dataURL, vectors) {

        validate([
            { key: 'storyId', value: storyId, type: String },
            { key: 'dataURL', value: dataURL, type: String},
            { key: 'vectors', value: vectors, type: Array}
        ])

        return fetch(`${this.url}/users/${this._userId}/stories/${storyId}/cover`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({ dataURL, vectors })
        })
            .then(res => res.json())
            .then(res => {
                
                if (res.error) throw Error(res.error)

            })
    },

    retrieveStoryCover(storyId) {

        validate([
            { key: 'storyId', value: storyId, type: String }
        ])

        return fetch(`${this.url}/users/${this._userId}/stories/${storyId}/cover`, {
            method: 'GET',
        })
            .then(res => res.json())
            .then(res => {

                if (res.error) throw Error(res.error)

                return res.data
            })
    },

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

    searchStory(query) {
        validate([
            { key: 'query', value: query, type: String }
        ])

        return fetch(`${this.url}/users/${this._userId}/stories/find/${query}`, {
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

    searchRandomStories() {

        return fetch(`${this.url}/users/${this._userId}/findRandomStories`, {
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

    addPage(storyId, text) {

        validate([
            { key: 'storyId', value: storyId, type: String },
            { key: 'text', value: text, type: String, optional: true }
        ])

        return fetch(`${this.url}/users/${this._userId}/stories/${storyId}/pages`, {
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

                return res.data
            })
    },

    savePagePicture(pageId, storyId, dataURL, vectors) {

        validate([
            { key: 'pageId', value: pageId, type: String },
            { key: 'storyId', value: storyId, type: String },
            { key: 'dataURL', value: dataURL, type: String},
            { key: 'vectors', value: vectors, type: Array}
        ])

        return fetch(`${this.url}/users/${this._userId}/stories/${storyId}/pages/${pageId}/picture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({ dataURL, vectors })
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)

            })
    },

    retrievePagePicture(pageId, storyId) {
        validate([
            { key: 'pageId', value: pageId, type: String },
            { key: 'storyId', value: storyId, type: String }
        ])

        return fetch(`${this.url}/users/${this._userId}/stories/${storyId}/pages/${pageId}/picture`, {
            method: 'GET',
        })
            .then(res => res.json())
            .then(res => {

                if (res.error) throw Error(res.error)
                return res.data
            })
    },

    savePageAudio(pageId, storyId, audioBlob) {
        
        validate([
            { key: 'pageId', value: pageId, type: String },
            { key: 'storyId', value: storyId, type: String },
            // { key: 'adioBlob', value: adioBlob, type: String}
        ])

        const formData = new FormData();
        formData.append('audio', audioBlob);

        return fetch(`${this.url}/users/${this._userId}/stories/${storyId}/pages/${pageId}/audio`, {
            method: 'POST',
            headers: {
                // 'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundaryzuW5nPZQFQCwQtg4'
            },
            body: formData
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error)
            })
    },

    updatePage(pageId, storyId, text) {

        validate([
            { key: 'pageId', value: pageId, type: String },
            { key: 'storyId', value: storyId, type: String },
            { key: 'text', value: text, type: String }
        ])

        return fetch(`${this.url}/users/${this._userId}/stories/${storyId}/pages/${pageId}`, {
            method: 'PATCH',
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

    retrievePage(pageId, storyId) {
        validate([
            { key: 'pageId', value: pageId, type: String },
            { key: 'storyId', value: storyId, type: String }
        ])

        return fetch(`${this.url}/users/${this._userId}/stories/${storyId}/pages/${pageId}`, {
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