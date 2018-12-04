import React, { Component } from 'react'
import './style.css'

class Navbar extends Component {

    handleLogoutClick = () => {

        this.props.onLogoutClick()
    }

    handleMyStoriesClick = () => {

        this.props.onMyStoriesClick()
    }

    handleMyFavouritesClick = () => {

        this.props.onFavouritesClick()
    }

    handleSearchClick = () => {

        this.props.onSearchClick()
    }

    handleRegisterClick = () => {

        this.props.onRegisterClick()
    }

    handleLoginClick = () => {

        this.props.onLoginClick()
    }

    render() {

        return <React.Fragment>
            {this.props.loggedIn && <div className='navbar-container'>
                <button className='my-stories-button' onClick={this.handleMyStoriesClick}>ELS MEUS CONTES</button>
                <button className='favourit-stories-button' onClick={this.handleMyFavouritesClick}>CONTES PREFERITS</button>
                <button className='search-stories-button' onClick={this.handleSearchClick}>BUSCAR CONTES</button>
                <button className='logout-button' onClick={this.handleLogoutClick}>TANCAR SESSIÓ</button>
            </div>}
            {!this.props.loggedIn && <div className='navbar-container'>
                <button className='register-button' onClick={this.handleRegisterClick}>REGISTRA'T</button>
                <button className='login-button' onClick={this.handleLoginClick}>INICIA SESSIÓ</button>
            </div>}
            </React.Fragment>
    }
}

export default Navbar