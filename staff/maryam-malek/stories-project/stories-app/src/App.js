import React, { Component } from 'react'
import { Route, withRouter, Redirect } from 'react-router-dom'
import Register from './components/Register'
import Login from './components/Login'
import Error from './components/Error'
import logic from './logic'


class App extends Component {
  state = { error: null }

  handleRegister = (name, surname, username, password) => {
      try {
          logic.register(name, surname, username, password)
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
              .then(() =>  this.props.history.push('/'))
              .catch(err => this.setState({ error: err.message }))
      } catch (err) {
          this.setState({ error: err.message })
      }
  }

  // handleLogoutClick = () => {
  //     logic.logout()

  //     this.props.history.push('/')
  // }

  handleGoBack = () => this.props.history.push('/')

  render() {
    const { error } = this.state

    return <div >
      <Route path="/register" render={() => !logic.loggedIn ? <Register onRegister={this.handleRegister} onGoBack={this.handleGoBack} /> : <Redirect to="/" />} />
      <Route path="/login" render={() => !logic.loggedIn ? <Login onLogin={this.handleLogin} onGoBack={this.handleGoBack} /> : <Redirect to="/" />} />
      {error && <Error message={error} />}

    </div>
  }
}

export default withRouter(App)
