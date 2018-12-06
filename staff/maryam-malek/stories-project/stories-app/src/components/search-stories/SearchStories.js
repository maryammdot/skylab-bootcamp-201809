import React, { Component } from 'react'
import './style.css'
import logic from '../../logic'
import Error from '../error/Error'
import Detail from '../detail/Detail'

class SearchStories extends Component {
    state = { error: null, stories: [] }

    componentDidMount() {
        logic.searchRandomStories()
            .then((stories) => {

                this.setState({ stories, error: null })
            })
            .catch(err => {
                let message

                switch (err.message) {
                    case `stories not found`:
                        message = `ENCARA NO HI HA CAP CONTE`
                        break
                    default:
                        message = err.message
                }
                this.setState({ error: message, stories: [] })
            })
    }

    handleRandomClick = () => {
        logic.searchRandomStories()
            .then((stories) => {

                this.setState({ stories, error: null })
            })
            .catch(err => {
                let message
                switch (err.message) {
                    case `stories not found`:
                        message = `ENCARA NO HI HA CAP CONTE`
                        break
                    default:
                        message = err.message
                }
                this.setState({ error: message, stories: [] })
            })
    }

    handleInputChange = event => {
        const query = event.target.value

        this.setState({ query, error: null })

        if (query.length) {
            try {
                logic.searchStory(query)
                    .then((stories) => {

                        this.setState({ stories, error: null })
                    })
                    .catch(err => {
                        let message
                        switch (err.message) {
                            case `stories with query ${this.state.query} not found`:
                                message = `NO S'HA TROBAT CAP CONTE AMB AQUEST TÍTOL`
                                break
                            default:
                                message = err.message
                        }
                        this.setState({ error: message, stories: [] })
                    })
            } catch (err) {
                this.setState({ error: 'UPS! HI HA HAGUT UN ERROR, TORNA-HO A INTENTAR!', stories: [] })
            }
        }


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
                    switch (err.message) {
                        case `stories with query ${this.state.query} not found`:
                            message = `NO S'HA TROBAT CAP CONTE AMB AQUEST TÍTOL`
                            break
                        default:
                            message = err.message
                    }
                    this.setState({ error: message, stories: [] })
                })
        } catch (err) {
            this.setState({ error: 'UPS! HI HA HAGUT UN ERROR, TORNA-HO A INTENTAR!', stories: [] })
        }
    }

    handleDetailClick = id => {
        this.props.onReadClick(id)
    }

    render() {
        return <React.Fragment>
            <div className='container-search-stories'>
                <div className='title-form-container'>
                    <div className='search-stories-header'>
                        <h1>CERCAR CONTES</h1>
                    </div>
                    <div className='form-search-container'>
                        <form className='search-form' onSubmit={this.handleSubmit}>
                            <input type="text" placeholder="TÍTOL DEL CONTE" onChange={this.handleInputChange} autoFocus />
                            <button type="submit"><i className="fa fa-search"></i></button>
                        </form>
                        <button className='random-button' onClick={this.handleRandomClick}>BUSCAR CONTES ALEATORIS</button>
                    </div>
                </div>
                <ul className='search-stories-list'>
                    {this.state.stories.map(story => <div className='detail-search-stories'><Detail edit={false} id={story.id} img={story.hasCover ? story.dataURL : './images/cover.png'} text={story.title} onDetailClick={this.handleDetailClick} /></div>)}
                </ul>
            </div>
            {this.state.error && <Error message={this.state.error} />}
        </React.Fragment>
    }
}

export default SearchStories