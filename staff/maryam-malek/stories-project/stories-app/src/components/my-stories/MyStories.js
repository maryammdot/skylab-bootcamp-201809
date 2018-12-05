import React, { Component } from 'react'
import './style.css'
import logic from '../../logic'
import Error from '../error/Error'
import Detail from '../detail/Detail'
import ReactTooltip from 'react-tooltip'

class MyStories extends Component {
    state = { error: null, stories: [] }

    componentDidMount() {
        try {
            logic.listStories()
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

    handleEditClick = id => {
        this.props.onEditClick(id)
    }

    handleNewStoryClick = () => {
        this.props.onNewStoryClick()
    }

    render() {
        return <React.Fragment>
            <div className='container-my-stories'>
                <div className='my-stories-header'>
                    <h1>ELS MEUS CONTES</h1>
                    {!!this.state.stories.length && <button className="newStoryButton" data-tip="CREA UN NOU CONTE" onClick={this.handleNewStoryClick}><i className="fa fa-plus-circle icon-new-my-stories"></i></button>}
                </div>
                <ul className='my-stories-list'>
                    {this.state.stories.map(story => <div className='detail-my-stories' data-tip="LLEGEIX EL CONTE"><Detail edit={true} id={story.id} img={story.hasCover ? story.dataURL : './images/cover.png'} text={story.title} onDetailClick={this.handleDetailClick} onEditClick={this.handleEditClick} /></div>)}
                    {!this.state.stories.length && <button className="firstStoryButton" onClick={this.handleNewStoryClick}>CREA EL TEU PRIMER CONTE</button>}
                </ul>
            </div>
            {this.state.error && <Error message={this.state.error} />}
            <ReactTooltip effect='solid' />
        </React.Fragment>
    }

}

export default MyStories