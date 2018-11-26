import React, { Component } from 'react'
import { Route, withRouter, Redirect } from 'react-router-dom'
import Register from './components/register/Register'
import Login from './components/login/Login'
import Error from './components/error/Error'
import Navbar from './components/navbar/Navbar'
import CreateStory from './components/create-story/CreateStory'
import UpdateStory from './components/update-story/UpdateStory'
import CreatePage from './components/create-page/CreatePage'
import MyStories from './components/my-stories/MyStories'
import MyFavourites from './components/my-favourites/MyFavourites'
import ReadStory from './components/read-story/ReadStory'
import ReadPage from './components/read-page/ReadPage'
import SearchStories from './components/search-stories/SearchStories'
import logic from './logic'


class App extends Component {
    state = { error: null, storyId: '' }

    
    handleRegisterClick = () => this.props.history.push('/register')
    
    handleLoginClick = () => this.props.history.push('/login')
    
    handleLogoutClick = () => {
        
        logic.logout()
        
        this.props.history.push('/')
    }
    
    handleFavouritesClick = () => this.props.history.push(`/my-favourites`)
    
    handleMyStoriesClick = () => this.props.history.push(`/my-stories`)
    handleBackStoryClick = () => this.props.history.push(`/my-stories`)
    // handleBackTaleClick = () => this.props.history.push(`/my-stories`)
    
    handleFirstSearchClick = () => this.props.history.push('search')
    
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

    handleNewStory = (id) => this.props.history.push(`/story/${id}`)
    

    handleEditClick = (id) => this.props.history.push(`/story/${id}`)
    
    handleBackToBookClick = (id) => this.props.history.push(`/story/${id}`)
    
    handleReadClick = (id) => this.props.history.push(`/tales/${id}`)
    
    handleBackTalePageClick = storyId => this.props.history.push(`/tales/${storyId}`)

    handleDetailPageClick = (id, pageId) => this.props.history.push(`/story/${id}/pages/${pageId}`)

    handleGoBack = () => this.props.history.push('/')

    handleReadTaleClick = (storyId, pageId) => {
        const index = 0
        this.props.history.push(`/tales/${storyId}/pages/${index}/${pageId}`)
    }

    handleNextPageClick = (storyId, pageId, index) => this.props.history.push(`/tales/${storyId}/pages/${index}/${pageId}`)
    handleLastPageClick = (storyId, pageId, index) => this.props.history.push(`/tales/${storyId}/pages/${index}/${pageId}`)
    
    render() {
        const { error } = this.state

        return <div>
            {/* <Route exact path="/" render={() => <div><button onClick={this.onRegisterClick}>Register</button> or <button onClick={this.onLoginClick}>Login </button></div>} /> */}
            <Route path="/" render={() => !logic.loggedIn && <Navbar loggedIn={false} onLoginClick={this.handleLoginClick} onRegisterClick={this.handleRegisterClick} /> }/>
            <Route path="/" render={() => logic.loggedIn && <Navbar loggedIn={true} onLogoutClick={this.handleLogoutClick} onMyStoriesClick={this.handleMyStoriesClick} onFavouritesClick={this.handleFavouritesClick} /> } />
            <Route path="/register" render={() => !logic.loggedIn ? <Register onRegister={this.handleRegister} onGoBack={this.handleGoBack} /> : <Redirect to="/" />} />
            <Route path="/login" render={() => !logic.loggedIn ? <Login onLogin={this.handleLogin} onGoBack={this.handleGoBack} /> : <Redirect to="/" />} />
            <Route path="/my-stories" render={() => logic.loggedIn ? <MyStories onNewStoryClick={this.handleNewStoryClick} onBackClick={this.handleBackStoryClick} onReadClick={this.handleReadClick} onEditClick={this.handleEditClick} /> : <Redirect to="/" />} />
            <Route exact path="/story" render={() => logic.loggedIn ? <CreateStory onNewStory={this.handleNewStory} onNewPageClick={this.handleNewPageClick} storyId={undefined} onBackClick={this.handleBackStoryClick} /> : <Redirect to="/" />} />
            <Route exact path="/story/:id" render={(props) => logic.loggedIn ? <UpdateStory onNewPageClick={this.handleNewPageClick} storyId={props.match.params.id} onBackClick={this.handleBackStoryClick} onDetailClick={pageId => this.handleDetailPageClick(props.match.params.id, pageId)} /> : <Redirect to="/" />} />
            <Route exact path="/story/:id/pages" render={(props) => logic.loggedIn ? <CreatePage storyId={props.match.params.id} onBackClick={this.handleBackToBookClick} /> : <Redirect to="/" />} />
            <Route exact path="/story/:id/pages/:pageId" render={(props) => logic.loggedIn ? <CreatePage storyId={props.match.params.id} pageId={props.match.params.pageId} onBackClick={this.handleBackToBookClick} /> : <Redirect to="/" />} />
            <Route exact path="/tales/:id" render={(props) => logic.loggedIn ? <ReadStory storyId={props.match.params.id} onBackClick={this.handleBackStoryClick} onReadClick={this.handleReadTaleClick} /> : <Redirect to="/" />} />
            <Route exact path="/tales/:id/pages/:index/:pageId" render={(props) => logic.loggedIn ? <ReadPage storyId={props.match.params.id} pageId={props.match.params.pageId} index={props.match.params.index} onBackClick={this.handleBackTalePageClick} onNextPageClick={this.handleNextPageClick} onLastPageClick={this.handleLastPageClick} /> : <Redirect to="/" />} />
            <Route exact path="/search" render={() => logic.loggedIn ? <SearchStories onReadClick={this.handleReadClick} /> : <Redirect to="/" />} />
            <Route exact path="/my-favourites" render={() => logic.loggedIn ? <MyFavourites onReadClick={this.handleReadClick} onFirstSearchClick={this.handleFirstSearchClick} /> : <Redirect to="/" />} />
            {error && <Error message={error} />}
        </div>

    }
}
export default withRouter(App)
