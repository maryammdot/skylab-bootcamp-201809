import React, { Component } from 'react'

class Register extends Component {
    state = { name: '', surname: '', username: '', password: '' }

    handleNameChange = event => {
        const name = event.target.value

        this.setState({ name })
    }

    handleSurnameChange = event => {
        const surname = event.target.value

        this.setState({ surname })
    }

    handleUsernameChange = event => {
        const username = event.target.value

        this.setState({ username })
    }

    handlePasswordChange = event => {
        const password = event.target.value

        this.setState({ password })
    }

    handleSubmit = event => {
        event.preventDefault()

        const { name, surname, username, password } = this.state

        this.props.onRegister(name, surname, username, password)
    }

    render() {
        return <div className="register__page">
            <div className="register">
             <h1>Register</h1>
            <form onSubmit={this.handleSubmit}>
            <input type="text" placeholder="Name" onChange={this.handleNameChange} />
            <input type="text" placeholder="Surname" onChange={this.handleSurnameChange} />
            <input type="text" placeholder="Username" onChange={this.handleUsernameChange} />
            <input type="password" placeholder="Password" onChange={this.handlePasswordChange} />
            <button className="register__submit" type="submit">Register</button> <a className="register__back" href="#" onClick={this.props.onGoBack}>back</a>
        </form>
        </div>
        </div> 
    }
}

export default Register