import React, { Component } from 'react'
import './style.css'
import logic from '../../logic'
import Error from '../error/Error'

class Register extends Component {
    state = { name: '', surname: '', username: '', password: '', error: null }

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

            try {
                logic.register(name, surname, username, password)
                    .then(() => this.setState({ error: null }))
                    .then(() => this.props.onRegister())
                    .catch(err => this.setState({ error: err.message }))
            } catch (err) {
                this.setState({ error: err.message })
            }
    }

    render() {
        return <div className='container-log-reg'>
            <div className='container-register'>
                <h3>REGISTRE</h3>
                <form className='register-form' onSubmit={this.handleSubmit}>
                    <input type="text" placeholder="NOM" onChange={this.handleNameChange} autoFocus/>
                    <input type="text" placeholder="COGNOM" onChange={this.handleSurnameChange} />
                    <input type="text" placeholder="NOM D'USUARI" onChange={this.handleUsernameChange} />
                    <input type="password" placeholder="CONTRASENYA" onChange={this.handlePasswordChange} />
                    <div className='buttons'><a href="#" onClick={this.props.onGoBack}>ENDARRERE</a> <button type="submit">REGISTRA'T</button></div>
                </form>
            </div>
            {this.state.error && <Error message={this.state.error} />}
        </div>
    }
}

export default Register