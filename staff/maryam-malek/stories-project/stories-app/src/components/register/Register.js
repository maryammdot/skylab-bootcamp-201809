import React, { Component } from 'react'
import './style.css'

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
        return <div className='container-register'>
            <h3>REGISTRE</h3>
            <form className='register-form' onSubmit={this.handleSubmit}>
                <input type="text" placeholder="NOM" onChange={this.handleNameChange} />
                <input type="text" placeholder="COGNOM" onChange={this.handleSurnameChange} />
                <input type="text" placeholder="NOM D'USUARI" onChange={this.handleUsernameChange} />
                <input type="password" placeholder="CONTRASENYA" onChange={this.handlePasswordChange} />
                <div className='buttons'><a href="#" onClick={this.props.onGoBack}>ENDARRERE</a> <button type="submit">REGISTRA'T</button></div>
            </form>
        </div>
    }
}

export default Register