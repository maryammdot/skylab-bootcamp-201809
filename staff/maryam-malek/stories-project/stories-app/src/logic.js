const validate = require('./utils/validate')

const logic = {
    _userId: sessionStorage.getItem('userId') || null,
    _token: sessionStorage.getItem('token') || null,
    url: 'NO_URL',
    

    /**
     * 
     * @param {String} name 
     * @param {String} surname 
     * @param {String} username 
     * @param {String} password 
     * 
     * @throws {TypeError} on non-string name, surname, username, password
     * @throws {ValueError} on empty or blank name, surname, username, password
     * @throws {Error} on api error
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
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

    /**
     * 
     * @param {String} username 
     * @param {String} password 
     * 
     * @throws {TypeError} on non-string username, password
     * @throws {ValueError} on empty or blank username, password
     * @throws {Error} on api error
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
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

    /**
     * @throws {Error} on api error
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
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

    /**
     * 
     * @param {String} title 
     * @param {String} audioLanguage 
     * @param {String} textLanguage 
     * 
     * @throws {TypeError} on non-string title, audioLanguage, textLanguage
     * @throws {ValueError} on empty or blank title, audioLanguage, textLanguage
     * @throws {Error} on api error
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
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

    /**
     * @throws {Error} on api error
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
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

    /**
     * 
     * @param {String} storyId 
     * 
     * @throws {TypeError} on non-string storyId
     * @throws {ValueError} on empty or blank storyId
     * @throws {Error} on api error
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
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

    /**
     * 
     * @param {String} storyId 
     * @param {String} title
     * @param {String} audioLanguage 
     * @param {String} textLanguage 
     * 
     * @throws {TypeError} on non-string storyId, title, audioLanguage, textLanguage
     * @throws {ValueError} on empty or blank storyId, title, audioLanguage, textLanguage
     * @throws {Error} on api error
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
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

    /**
     * 
     * @param {String} storyId 
     * 
     * @throws {TypeError} on non-string storyId
     * @throws {ValueError} on empty or blank storyId
     * @throws {Error} on api error
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
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

    /**
     * 
     * @param {String} storyId 
     *
     * @throws {TypeError} on non-string storyId
     * @throws {ValueError} on empty or blank storyId
     * @throws {Error} on api error
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
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

    /**
     * @throws {Error} on api error
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
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


    /**
     * 
     * @param {String} storyId 
     * 
     * @throws {TypeError} on non-string storyId
     * @throws {ValueError} on empty or blank storyId
     * @throws {Error} on api error
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
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

    /**
     * 
     * @param {String} storyId 
     * 
     * @throws {TypeError} on non-string storyId
     * @throws {ValueError} on empty or blank storyId
     * @throws {Error} on api error
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
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

    /**
     * 
     * @param {String} storyId 
     * @param {String} dataURL 
     * @param {String} vectors 
     *
     * @throws {TypeError} on non-string storyId, dataURL, vectors
     * @throws {ValueError} on empty or blank storyId, dataURL, vectors
     * @throws {Error} on api error
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
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

    /**
     * 
     * @param {String} storyId 
     * 
     * @throws {TypeError} on non-string storyId
     * @throws {ValueError} on empty or blank storyId
     * @throws {Error} on api error
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
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

    /**
     * 
     * @param {String} storyId 
     * 
     * @throws {TypeError} on non-string storyId
     * @throws {ValueError} on empty or blank storyId
     * @throws {Error} on api error
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
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

    /**
     * 
     * @param {String} query 
     * 
     * @throws {TypeError} on non-string query
     * @throws {ValueError} on empty or blank query
     * @throws {Error} on api error
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
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

    /**
     * @throws {Error} on api error
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
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

    /**
     * 
     * @param {String} storyId 
     * @param {String} text 
     * 
     * @throws {TypeError} on non-string storyId, text
     * @throws {ValueError} on empty or blank storyId, text
     * @throws {Error} on api error
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
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

    /**
     * 
     * @param {String} pageId 
     * @param {String} storyId 
     * @param {String} dataURL 
     * @param {String} vectors 
     * 
     * @throws {TypeError} on non-string pageId, storyId, dataURL, vectors
     * @throws {ValueError} on empty or blank pageId, storyId, dataURL, vectors
     * @throws {Error} on api error
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
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

    /**
     * 
     * @param {String} pageId 
     * @param {String} storyId 
     * 
     * @throws {TypeError} on non-string pageId, storyId
     * @throws {ValueError} on empty or blank pageId, storyId
     * @throws {Error} on api error
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
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

    /**
     * 
     * @param {String} pageId 
     * @param {String} storyId 
     * 
     * @throws {TypeError} on non-string pageId, storyId
     * @throws {ValueError} on empty or blank pageId, storyId
     * @throws {Error} on api error
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
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

    /**
     * 
     * @param {String} pageId 
     * @param {String} storyId 
     * @param {String} text 
     * 
     * @throws {TypeError} on non-string pageId, storyId, text
     * @throws {ValueError} on empty or blank pageId, storyId, text
     * @throws {Error} on api error
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
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

    /**
     * 
     * @param {String} pageId 
     * @param {String} storyId 
     * 
     * @throws {TypeError} on non-string pageId, storyId
     * @throws {ValueError} on empty or blank pageId, storyId
     * @throws {Error} on api error
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
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

    /**
     * 
     * @param {String} pageId 
     * @param {String} storyId 
     * 
     * @throws {TypeError} on non-string pageId, storyId
     * @throws {ValueError} on empty or blank pageId, storyId
     * @throws {Error} on api error
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
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