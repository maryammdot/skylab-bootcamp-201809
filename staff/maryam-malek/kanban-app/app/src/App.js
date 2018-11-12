import React, { Component } from 'react'
import Register from './components/Register'
import Login from './components/Login'
import Postits from './components/Postits'
import Landing from './components/Landing'
import logic from './logic'
import { Route, withRouter, Redirect } from 'react-router-dom'

logic.url = 'http://localhost:5000/api'

class App extends Component {
    state = { error: null }

    handleRegisterClick = () => this.props.history.push('/register')

    handleLoginClick = () => this.props.history.push('/login')

    handleRegister = (name, surname, username, password) => {
        try {
            logic.registerUser(name, surname, username, password)
                .then(() => {
                    this.setState({ error: null }, () => this.props.history.push('/login'))
                })
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    handleLogin = (username, password) => {
        try {
            logic.login(username, password)
            .then(() => {
                this.setState({ error: null }, () => this.props.history.push('/postits'))
            })                
            .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    handleLogoutClick = () => {
        logic.logout()

        this.props.history.push('/')
    }

    handleGoBack = () => {
        this.setState({ error: null })
        this.props.history.push('/')
    }

    render() {
        const { error } = this.state

        return <div>
            <Route exact path="/" render={() => !logic.loggedIn ? <Landing onRegisterClick={this.handleRegisterClick} onLoginClick={this.handleLoginClick} /> : <Redirect to="/postits" />} />
            <Route path="/register" render={() => !logic.loggedIn ? <Register error={error} onRegister={this.handleRegister} onGoBack={this.handleGoBack} /> : <Redirect to="/postits" />} />
            <Route path="/login" render={() => !logic.loggedIn ? <Login error={error} onLogin={this.handleLogin} onGoBack={this.handleGoBack} /> : <Redirect to="/postits" />} />
            <Route path="/postits" render={() => logic.loggedIn ? <div>
                <section className="logout"><button className="button" onClick={this.handleLogoutClick}>Logout</button></section>
                <Postits />
            </div> : <Redirect to="/" />} />

        </div>
    }
}

export default withRouter(App)
