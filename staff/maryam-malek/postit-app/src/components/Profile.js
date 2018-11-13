import React, { Component } from 'react'
import logic from '../logic'
class Profile extends Component {

    state = { name: '', surname: '', newPassword: '', currentPassword: '', updated: false }

    handleSubmit = event => {
        event.preventDefault()
        logic.updateUser(this.state.name, this.state.surname, this.state.newPassword, this.state.currentPassword)
            .then(() => {
                this.setState({ updated: true })
            })
    }

    handleNameChange = event => {
        const name = event.target.value

        this.setState({ name })

    }

    handleSurnameChange = event => {
        const surname = event.target.value

        this.setState({ surname })
    }

    handleNewPasswordChange = event => {
        const newPassword = event.target.value

        this.setState({ newPassword })
    }

    handleCurrentPassword = event => {
        const currentPassword = event.target.value

        this.setState({ currentPassword })
    }

    render() {
        return <div>
            <h2>Profile</h2>
            <form onSubmit={this.handleSubmit}>
                <input placeholder="Name" onChange={this.handleNameChange} />
                <input placeholder="Surname" onChange={this.handleSurnameChange} />
                <input placeholder="New password" onChange={this.handleNewPasswordChange} />
                <input placeholder="Password" onChange={this.handleCurrentPassword} />
                <button type="submit">Change fields</button>
                {this.state.updated && <h3>User updated</h3>}
            </form>
        </div>
    }
}

export default Profile
