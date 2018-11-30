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
                    this.setState({stories, error: null})
                })
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    handleDetailClick = id => {
        this.props.onReadClick(id)
    }

    handleEditClick = id => {
        this.props.onEditClick(id)
    }

    handleNewStoryClick = () => {
        this.props.onNewStoryClick()
    }

    render() {
        return <div>
            <div className='container-my-stories'>
                <h1>ELS MEUS CONTES</h1>
                <ul className='my-stories-list'>
                    {this.state.stories.map(story => <div className='detail-my-stories'><Detail edit={true} id={story.id} img={story.hasCover? story.dataURL: './images/cover.png'} text={story.title} onDetailClick={this.handleDetailClick} onEditClick={this.handleEditClick}/></div>)}
                {this.state.stories.length? <button className="newStoryButton" onClick={this.handleNewStoryClick}><i className="fa fa-plus-circle"></i></button>: <button className="firstStoryButton" onClick={this.handleNewStoryClick}>CREA EL TEU PRIMER CONTE</button>}
                </ul>
            </div>
            {this.state.error && <Error message={this.state.error} />}
        </div>
    }

}

export default MyStories