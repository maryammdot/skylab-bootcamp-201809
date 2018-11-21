import React, { Component } from 'react'
import './style.css'
import logic from '../../logic'
import Error from '../error/Error'
import Detail from '../detail/Detail'

class CreateStory extends Component {
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

    handleNewStoryClick = () => this.props.history.push('/create-story')

    render() {
        return <div>
            <div className='container'>
                <h1>ELS MEUS CONTES</h1>
                <ul>
                    {this.state.stories.map(story => <Detail cover={story.cover} title={story.title} />)}
                </ul>
                <button className="newStoryButton" onClick={this.handleNewStoryClick}>+</button>
            </div>
            {this.state.error && <Error message={this.state.error} />}
        </div>
    }

}

export default CreateStory