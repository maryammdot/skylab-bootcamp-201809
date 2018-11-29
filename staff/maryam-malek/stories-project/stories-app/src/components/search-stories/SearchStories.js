import React, { Component } from 'react'
import './style.css'
import logic from '../../logic'
import Error from '../error/Error'
import Detail from '../detail/Detail'

class SearchStories extends Component {
    state = { error: null, stories: [] }

    handleInputChange = event => {
        const query = event.target.value

        this.setState({ query, error: null })
    }

    handleSubmit = event => {
        event.preventDefault()

        const { query } = this.state
        try {
            logic.searchStory(query)
                .then((stories) => {
                    
                    this.setState({ stories, error: null })
                })
                .catch(err => {
                    let message
                    switch(err.message) {
                        case `stories with query ${this.state.query} not found`:
                            message = `NO S'HA TROBAT CAP CONTE AMB AQUEST TÍTOL`
                            break
                        default:
                        message = err.message
                    }
                    this.setState({ error: message, stories: [] })})
        } catch (err) {
            this.setState({ error: 'UPS! HI HA HAGUT UN ERROR, TORNA-HO A INTENTAR!', stories: [] })
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
                    <button type="submit"><i className="fa fa-search"></i></button>
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