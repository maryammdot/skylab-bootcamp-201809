import Skylab from './skylab'

const logic = {
    skylab: new Skylab(),
    auth: JSON.parse(sessionStorage.getItem('auth')) || {},
    user_info: JSON.parse(sessionStorage.getItem('user_info')) || {},
    root_url:"https://www.googleapis.com/youtube/v3/",

    registerUser(name, surname, username, email, password) {
        if(typeof name !=='string') throw TypeError (`${name} is not a string`)
        if (!name.trim()) throw Error ('name is blank or empty')

        if(typeof surname !=='string') throw TypeError (`${surname} is not a string`)
        if (!surname.trim()) throw Error ('surname is blank or empty')

        if(typeof username !=='string') throw TypeError (`${username} is not a string`)
        if (!username.trim()) throw Error ('username is blank or empty')

        if(typeof email !=='string') throw TypeError (`${email} is not a string`)
        if (!email.trim()) throw Error ('email is blank or empty')

        if(typeof password !=='string') throw TypeError (`${password} is not a string`)
        if (!password.trim()) throw Error ('password is blank or empty')

        return this.skylab.register({
            name: name,
            surname: surname,
            username: username,
            email: email,
            password: password
        })
    },

    loginUser(username, password) {
        if(typeof username !=='string') throw TypeError (`${username} is not a string`)
        if (!username.trim()) throw Error ('username is blank or empty')

        if(typeof password !=='string') throw TypeError (`${password} is not a string`)
        if (!password.trim()) throw Error ('password is blank or empty')

        return this.skylab.login({
            username: username,
            password: password
        })
            .then(data => {
                this.auth.id = data.id
                this.auth.token = data.token
                sessionStorage.setItem('auth', JSON.stringify(this.auth))
                return this.skylab.info(this.auth.id, this.auth.token)
                    .then(info => {
                        sessionStorage.setItem('user_info', JSON.stringify(info))
                        return info
                    })
                    .catch(error => {
                        throw Error(error)
                    })
            })
    },

    logoutUser() {
        sessionStorage.removeItem('auth')
        this.auth = {}
    },

    isAuthenticated() {
        return this.auth && Object.keys(this.auth).length > 0
    },

    loggedIn() {
        return !!this._userId
    },
    
    search(query) {
        return fetch(this.root_url + 'search?part=snippet&key='+this.api_key+'&q='+query+'&videoCategoryId=10&type=video', {
            method: 'GET'
        })
        .then(res => res.json())
        .then (res => res.items)
       
    },

    retrieveSong(video_id) {
        return fetch(this.root_url + 'videos?part=player&key='+this.api_key+'&id='+video_id, {
            method: 'GET'
        })
        .then(res => res.json())
        .then(res => res)
    addPlaylist(playlist) {
        return this.skylab.update(playlist, this.auth.id, this.auth.token)
    }
}

export default logic

export default logic
//module.exports = logic