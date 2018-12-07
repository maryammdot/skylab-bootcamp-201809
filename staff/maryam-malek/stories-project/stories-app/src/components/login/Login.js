import React, { Component } from 'react'
import './style.css'
import logic from '../../logic'
import Error from '../error/Error'

class Login extends Component {
    state = { username: '', password: '', error: null }

    handleUsernameChange = event => {
        const username = event.target.value

        this.setState({ username, error: null })
    }

    handlePasswordChange = event => {
        const password = event.target.value

        this.setState({ password, error: null })
    }

    handleSubmit = event => {
        event.preventDefault()

        const { username, password } = this.state

        try {
            logic.login(username, password)
                .then(() => this.setState({ error: null }))
                .then(() => this.props.onLogin())
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    render() {
        return <div className='container-log-reg'>
            <div className='container-login'>
                <h3>INICIA SESSIÓ</h3>
                <form className='login-form' onSubmit={this.handleSubmit}>
                    <input type="text" placeholder="NOM D'USUARI" onChange={this.handleUsernameChange} autoFocus/>
                    <input type="password" placeholder="CONTRASENYA" onChange={this.handlePasswordChange} />
                    <div className='buttons'><button type="submit">INICIA SESSIÓ</button> <a href="#" onClick={this.props.onGoBack}>ENDARRERE</a></div>
                </form>
            </div>
            {this.state.error && <Error message={this.state.error} />}
        </div>
    }
}

export default Login