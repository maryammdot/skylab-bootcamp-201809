import React, { Component } from 'react'
import './style.css'
import logic from '../../logic'
import Error from '../error/Error'

class CreateStory extends Component {
    state = { error: null, title: '', audioLanguage: '', textLanguage: '' }

    componentDidMount () {
        logic.retrieveUser()
            .then(({name}) => {
                this.setState({name})
            })
    }

    handleTitleChange = event => {
        const title = event.target.value

        this.setState({ title, error: null })
    }

    handleAudioLanguageChange = event => {
        const audioLanguage = event.target.value

        this.setState({ audioLanguage, error: null })
    }

    handleTextLanguageChange = event => {
        const textLanguage = event.target.value

        this.setState({ textLanguage, error: null })
    }

    handleSubmit = event => {
        event.preventDefault()

        const { title, audioLanguage, textLanguage } = this.state

        try {
            logic.addStory(title, audioLanguage, textLanguage)
                .then(({ storyId }) => {
                    this.setState({ id: storyId, error: null })

                    this.props.onNewStory(storyId)
                })
                .catch(err => {
                    let message
                    switch (err.message) {
                        case `story with title ${this.state.title} already created by user with id ${logic._userId}`:
                            message = `JA HAS CREAT UN CONTE AMB AQUEST TÍTOL`
                            break
                        default:
                            message = err.message
                    }
                    this.setState({ error: message })
                })
        } catch (err) {
            this.setState({ error: `OMPLE TOTS ELS CAMPS PER A CREAR EL CONTE` })
        }
    }

    handleBackClick = () => {
        this.props.onBackClick()
    }

    render() {
        return <div className='container-create-story'>
            <div className='create-new-story-header'>
                <h1>CREA UN NOU CONTE</h1>
            </div>
            <form className="book-details-create" onSubmit={this.handleSubmit}>
                <h3>TÍTOL DEL CONTE</h3>
                <input type="text" value={this.state.title} onChange={this.handleTitleChange} autoFocus />
                <h3>AUTOR DEL CONTE</h3>
                <input type="text" disabled value={this.state.name} />
                <h3>IDIOMA DE L'AUDIO DEL CONTE</h3>
                <input type="text" value={this.state.audioLanguage} onChange={this.handleAudioLanguageChange} />
                <h3>IDIOMA DEL TEXT DEL CONTE</h3>
                <input type="text" value={this.state.textLanguage} onChange={this.handleTextLanguageChange} />
                <button type="submit">GUARDA</button>
            </form>
            {this.state.error && <Error message={this.state.error} />}
        </div>
    }
}

export default CreateStory