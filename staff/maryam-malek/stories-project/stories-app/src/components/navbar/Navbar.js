import React, { Component } from 'react'
// import './style.css'

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

    render() {

        return <div>
            <button className='logout-button' onClick={() => this.handleLogoutClick}>TANCAR SESSIÓ</button>
            <button className='my-stories-button' onClick={() => this.handleMyStoriesClick}>ELS MEUS CONTES</button>
            <button className='favourit-stories-button' onClick={() => this.handleMyFavouritesClick}>CONTES PREFERITS</button>
        </div>
    }
}

export default Navbar