import React, {Component} from 'react'
import './style.css'

class Login extends Component {
    state = { username: '', password: '' }

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

        const { username, password } = this.state

        this.props.onLogin(username, password)
    }

    render() {
        return <div className='container-log-reg'>
        <div className='container-login'>
            <h3>INICIA SESSIÓ</h3>
            <form className='login-form' onSubmit={this.handleSubmit}>
                <input type="text" placeholder="NOM D'USUARI" onChange={this.handleUsernameChange} />
                <input type="password" placeholder="CONTRASENYA" onChange={this.handlePasswordChange} />
                <div className='buttons'><button type="submit">INICIA SESSIÓ</button> <a href="#" onClick={this.props.onGoBack}>ENDARRERE</a></div>
            </form>
        </div>
        </div>
    }
}

export default Login