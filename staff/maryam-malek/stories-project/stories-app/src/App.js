import React, { Component } from 'react'
import { Route, withRouter, Redirect } from 'react-router-dom'
import Register from './components/register/Register'
import Login from './components/login/Login'
import Error from './components/error/Error'
import CreateStory from './components/create-story/CreateStory'
import CreatePage from './components/create-page/CreatePage'
import logic from './logic'


class App extends Component {
    state = { error: null }

    onRegisterClick = () => this.props.history.push('/register')

    onLoginClick = () => this.props.history.push('/login')

    handleRegister = (name, surname, username, password) => {
        try {
            logic.register(name, surname, username, password)
                .then(() => this.setState({ error: null }))
                .then(() => this.props.history.push('/login'))
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    handleLogin = (username, password) => {
        try {
            logic.login(username, password)
                .then(() => this.setState({ error: null }))
                .then(() => this.props.history.push('/create-story'))
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    handleNewPageClick = (id) => {
        this.setState({ storyId: id })
        this.props.history.push('/create-page')
    }

    // handleLogoutClick = () => {
    //     logic.logout()

    //     this.props.history.push('/')
    // }

    handleGoBack = () => this.props.history.push('/')

    render() {
        const { error } = this.state

        return <div >
            <Route exact path="/" render={() => <div><button onClick={this.onRegisterClick}>Register</button> or <button onClick={this.onLoginClick}>Login </button></div>} />
            <Route path="/register" render={() => !logic.loggedIn ? <Register onRegister={this.handleRegister} onGoBack={this.handleGoBack} /> : <Redirect to="/" />} />
            <Route path="/login" render={() => !logic.loggedIn ? <Login onLogin={this.handleLogin} onGoBack={this.handleGoBack} /> : <Redirect to="/" />} />
            <Route path="/create-story" render={() => logic.loggedIn ? <CreateStory onNewPageClick={this.handleNewPageClick} /> : <Redirect to="/" />} />
            <Route path="/create-page" render={() => logic.loggedIn ? <CreatePage storyId={this.state.storyId} /> : <Redirect to="/" />} />
            {error && <Error message={error} />}

        </div>
    }
}

export default withRouter(App)
