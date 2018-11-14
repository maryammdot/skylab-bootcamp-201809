import React, { Component } from 'react'
import logic from '../logic'

class Profile extends Component {

    state = { name: '', surname: '', username: '', newPassword: '', password: '' }

    componentDidMount() {
        try {
            logic.retrieveUser()
                .then(user => {
                    const { name, surname, username } = user
                    this.setState({ name, surname, username })
                })
        } catch ({ message }) {
            this.setState({ error: message })
        }
    }

    handleInputName = event => {
        const name = event.target.value
        this.setState({name})
    }

    handleInputSurname = event => {
        const surname = event.target.value
        this.setState({surname})
    }

    handleInputUsername = event => {
        const username = event.target.value
        this.setState({username})
    }

    handleNewPasswordChange = event => {
        const currentPassword = event.target.value
        this.setState({currentPassword})
    }

    handlePasswordChange = event => {
        const password = event.target.value
        this.setState({password})
    }

    handleSubmit = event => {
        event.preventDefault()
        const { name, surname, username, newPassword, password } = this.state

        logic.UpdateProfile(name, surname, username, newPassword, password)
    }

    render() {
        return <div className="home">
            <form className="form-profile" onSubmit={this.handleSubmit}>
                <input value={this.state.name} placeholder={this.state.name} onChange={this.handleInputName} />
                <input value={this.state.surname} placeholder={this.state.surname} onChange={this.handleInputSurname} />
                <input value={this.state.username} placeholder={this.state.username} onChange={this.handleInputUsername} />
                <input type="password" placeholder="New Password" onChange={this.handleNewPasswordChange} />
                <input type="password" placeholder="Current password" onChange={this.handlePasswordChange} />
                <button type="submit">Submit</button> 
            </form>
        </div>
    }
}

export default Profile