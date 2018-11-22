import React, { Component } from 'react'
import './style.css'
import logic from '../../logic'
import Error from '../error/Error'
import Detail from '../detail/Detail'

class MyStories extends Component {
    state = { error: null, stories: [] }

    componentDidMount() {
        try {
            logic.listStories()
                .then(stories => {
                    this.setState({stories})
                })
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    handleDetailClick = id => {
        this.props.onDetailClick(id)
    }

    handleNewStoryClick = () => {
        this.props.onNewStoryClick()
    }

    render() {
        return <div>
            <div className='container-my-stories'>
                <h1>ELS MEUS CONTES</h1>
                <ul className='my-stories-list'>
                    {this.state.stories.map(story => <Detail id={story.id} img={story.cover} text={story.title} onDetailClick={this.handleDetailClick} />)}
                </ul>
                <button className="newStoryButton" onClick={this.handleNewStoryClick}>+</button>
            </div>
            {this.state.error && <Error message={this.state.error} />}
        </div>
    }

}

export default MyStories