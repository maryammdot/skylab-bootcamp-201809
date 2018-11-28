import React, { Component } from 'react'
import './style.css'
import logic from '../../logic'
import Error from '../error/Error'
import Detail from '../detail/Detail'

class MyFavourites extends Component {
    state = { error: null, stories: [] }

    componentDidMount() {
        try {
            logic.listFavourites()
                .then(stories => {
                    this.setState({ stories, error: null })
                })
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    handleDetailClick = id => {
        this.props.onReadClick(id)
    }

    handleFirstSearchClick = () => {
        this.props.onFirstSearchClick()
    }

    render() {
        return <div>
            <div className='container-my-favourites'>
                <h1>ELS MEUS CONTES PREFERITS</h1>
                <ul className='my-favourites-list'>
                    {this.state.stories.map(story => <div className='detail-my-favourite-stories'><Detail id={story.id} img={story.hasCover ? story.dataURL : './images/cover.png'} text={story.title} onDetailClick={this.handleDetailClick} edit={false} /></div>)}
                    {!this.state.stories.length && <button className="first-search-button" onClick={this.handleFirstSearchClick}>BUSCAR CONTES</button>}
                </ul>
            </div>
            {this.state.error && <Error message={this.state.error} />}
        </div>
    }

}

export default MyFavourites