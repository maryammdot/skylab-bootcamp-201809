import React, { Component } from 'react'
import { Route, withRouter, Redirect } from 'react-router-dom'
import Register from './components/register/Register'
import Login from './components/login/Login'
import Error from './components/error/Error'
import CreateStory from './components/create-story/CreateStory'
import CreatePage from './components/create-page/CreatePage'
import MyStories from './components/my-stories/MyStories'
import ReadStory from './components/read-story/ReadStory'
import ReadPage from './components/read-page/ReadPage'
import logic from './logic'


class App extends Component {
    state = { error: null, storyId: '' }

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
                .then(() => this.props.history.push('/my-stories'))
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }


    handleNewPageClick = (id) => {
        this.setState({ storyId: id })
        this.props.history.push(`/story/${id}/pages`)
    }

    handleUpdatePageClick = (id, pageId) => {
        this.setState({ storyId: id })
        this.props.history.push(`/story/${id}/pages/${pageId}`)
    }

    handleNewStoryClick = () => this.props.history.push('/story')

    handleReadClick = (id) => {
        // this.setState({ storyId: id })
        this.props.history.push(`/tales/${id}`)
    }

    handleEditClick = (id) => {
        // this.setState({ storyId: id })
        this.props.history.push(`/story/${id}`)
    }

    handleDetailPageClick = (id, pageId) => {
        // this.setState({ storyId: id })
        this.props.history.push(`/story/${id}/pages/${pageId}`)
    }

    onLogoutClick = () => {
        logic.logout()

        this.props.history.push('/')
    }

    handleGoBack = () => this.props.history.push('/')

    handleBackToBookClick = (id) => {
        // this.setState({ storyId: id })
        this.props.history.push(`/story/${id}`)
    }

    handleBackStoryClick = () => {
        this.props.history.push(`/my-stories`)
    }

    handleBackTaleClick = () => {
        this.props.history.push(`/my-stories`)
    }

    handleBackTalePageClick = storyId => {
        this.props.history.push(`/tales/${storyId}`)
    }

    handleReadTaleClick = (storyId, pageId) => {
        const index = 0
        this.props.history.push(`/tales/${storyId}/pages/${index}/${pageId}`)
    }

    handleNextPageClick = (storyId, pageId, index) => {
        this.props.history.push(`/tales/${storyId}/pages/${index}/${pageId}`)
    }

    handleLastPageClick = (storyId, pageId, index) => {
        this.props.history.push(`/tales/${storyId}/pages/${index}/${pageId}`)
    }

    render() {
        const { error } = this.state

        return <div >
            <Route exact path="/" render={() => <div><button onClick={this.onRegisterClick}>Register</button> or <button onClick={this.onLoginClick}>Login </button></div>} />
            <Route path="/" render={() => <button onClick={this.onLogoutClick}>LogOut</button>} />
            <Route path="/register" render={() => !logic.loggedIn ? <Register onRegister={this.handleRegister} onGoBack={this.handleGoBack} /> : <Redirect to="/" />} />
            <Route path="/login" render={() => !logic.loggedIn ? <Login onLogin={this.handleLogin} onGoBack={this.handleGoBack} /> : <Redirect to="/" />} />
            <Route path="/my-stories" render={() => logic.loggedIn ? <MyStories onNewStoryClick={this.handleNewStoryClick} onBackClick={this.handleBackStoryClick} onReadClick={this.handleReadClick} onEditClick={this.handleEditClick}/> : <Redirect to="/" />} />
            <Route exact path="/story" render={() => logic.loggedIn ? <CreateStory onNewPageClick={this.handleNewPageClick} storyId={undefined} onBackClick={this.handleBackStoryClick}/> : <Redirect to="/" />} />
            <Route exact path="/story/:id" render={(props) => logic.loggedIn ? <CreateStory onNewPageClick={this.handleNewPageClick} storyId={props.match.params.id} onBackClick={this.handleBackStoryClick} onDetailClick={pageId => this.handleDetailPageClick(props.match.params.id, pageId)}/> : <Redirect to="/" />} />
            <Route exact path="/story/:id/pages" render={(props) => logic.loggedIn ? <CreatePage storyId={props.match.params.id} onBackClick={this.handleBackToBookClick} /> : <Redirect to="/" />} />
            <Route exact path="/story/:id/pages/:pageId" render={(props) => logic.loggedIn ? <CreatePage storyId={props.match.params.id} pageId={props.match.params.pageId} onBackClick={this.handleBackToBookClick} /> : <Redirect to="/" />} />
            <Route exact path="/tales/:id" render={(props) => logic.loggedIn ? <ReadStory storyId={props.match.params.id} onBackClick={this.handleBackTaleClick} onReadClick={this.handleReadTaleClick} /> : <Redirect to="/" />} />
            <Route exact path="/tales/:id/pages/:index/:pageId" render={(props) => logic.loggedIn ? <ReadPage storyId={props.match.params.id} pageId={props.match.params.pageId} index={props.match.params.index} onBackClick={this.handleBackTalePageClick} onNextPageClick={this.handleNextPageClick} onLastPageClick={this.handleLastPageClick}/> : <Redirect to="/" />} />
            {error && <Error message={error} />}
        </div>
    }
}

export default withRouter(App)
