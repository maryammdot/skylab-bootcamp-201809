import React, { Component } from 'react'
// import './style.css'
import logic from '../../logic'
import Error from '../error/Error'
import Detail from '../detail/Detail'

class SearchStories extends Component {
    state = { error: null, stories: [] }

    handleInputChange = event => {
        const query = event.target.value

        this.setState({ query })
    }

    handleSubmit = event => {
        event.preventDefault()

        const { query } = this.state
        try {

            logic.searchStory(query)
                .then((stories) => {
                    debugger
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
    render() {
        return <div>
            <div className='container-search-stories'>
                <h1>CERCA CONTES</h1>
                <form className='search-form' onSubmit={this.handleSubmit}>
                    <input type="text" placeholder="TÍTOL DEL CONTE" onChange={this.handleInputChange} />
                    <button type="submit"><i class="fa fa-search"></i></button>
                </form>
                <ul className='search-stories-list'>
                    {this.state.stories.map(story => <div className='detail-search-stories'><Detail edit={false} id={story.id} img={story.hasCover ? story.dataURL : './images/cover.png'} text={story.title} onDetailClick={this.handleDetailClick} /></div>)}
                </ul>
            </div>
            {this.state.error && <Error message={this.state.error} />}
        </div>
    }

}

export default SearchStories