import React, { Component } from 'react'
import './style.css'
import logic from '../../logic'
import Error from '../error/Error'
import Detail from '../detail/Detail'

class CreateStory extends Component {
    state = { error: null, editCover: false, id: '', cover: './../../../public/cover.png', title: 'ESCRIU EL TÍTOL DEL CONTE', audioLanguage: `ESCRIU LA LLENGUA DE L'AUDIO DEL CONTE`, textLanguage: 'ESCRIU LA LLENGUA DEL TEXT DEL CONTE', pages: [] }

    componentDidMount() {
        if (this.props.storyId) {
            try {
                logic.retrieveStory(this.props.storyId)
                    .then(({ title, pages, cover }) => {
                        this.setState({ title, pages, cover, id: this.props.storyId, error: null })
                    })
                    .catch(err => this.setState({ error: err.message }))
            } catch (err) {
                this.setState({ error: err.message })
            }
        }
    }

    handleCoverClick = () => {
        this.setState({ editCover: true })
    }

    handleTitleChange = event => {
        const title = event.target.value

        this.setState({ title })
    }

    handleAudioLanguageChange = event => {
        const audioLanguage = event.target.value

        this.setState({ audioLanguage })
    }

    handleTextLanguageChange = event => {
        const textLanguage = event.target.value

        this.setState({ textLanguage })
    }

    handleNewPageClick = () => {
        if (this.state.id) {
            this.props.onNewPageClick(this.state.id)
        } else {
            this.setState({ error: 'omple i guarda la informació del compte primer' })
        }
    }

    handleDetailClick = id => {
        this.props.onDetailClick(id)
    }

    handleSubmit = event => {
        event.preventDefault()

        const { title, audioLanguage, textLanguage } = this.state

        try {
            if (this.state.storyId) {

                logic.updateStory(this.state.storyId, title, audioLanguage, textLanguage)
                    .then(() => {
                        this.setState({ error: null })
                        return logic.retrieveStory(this.state.storyId)
                    })
                    .then(({ title, audioLanguage, textLanguage, pages }) => {
                        this.setState({ title, audioLanguage, textLanguage, pages, error: null })
                    })
                    .catch(err => {
                        this.setState({ error: err.message })
                    })
            } else {

                logic.addStory(title, audioLanguage, textLanguage)
                    .then(({ storyId }) => {

                        this.setState({ id: storyId, error: null })
                        return logic.retrieveStory(storyId)
                    })
                    .then(({ title, audioLanguage, textLanguage, pages }) => {
                        this.setState({ title, audioLanguage, textLanguage, pages, error: null })
                    })
                    .catch(err => {
                        this.setState({ error: err.message })
                    })
            }
        } catch (err) {

            this.setState({ error: err.message })
        }
    }

    render() {
        return <div className='body'>
            <div className='container-story'>
                <h1>EL TEU CONTE</h1>
                {!this.state.editCover && <a onClick={this.handleCoverClick}><img className="book-cover" src={this.state.cover} alt="book cover"></img></a>}
                {this.state.editCover && <canvas class="canvas" id="cover-draw" width="200" height="300"></canvas>}
                <form className="book-details" onSubmit={this.handleSubmit}>
                    <input type="text" placeholder={this.state.title} onChange={this.handleTitleChange} />
                    <input type="text" disabled placeholder={logic._userId} />
                    <input type="text" placeholder={this.state.audioLanguage} onChange={this.handleAudioLanguageChange} />
                    <input type="text" placeholder={this.state.textLanguage} onChange={this.handleTextLanguageChange} />
                    <button type="submit">GUARDA</button>
                </form>
                <h3>PÀGINES</h3>
                <ul className="pages-section">
                    {this.state.pages.map(page => <Detail img={page.image} text={page.index} id={page.id} onDetailClick={this.handleDetailClick} />)}
                    <button className="newPageButton" onClick={this.handleNewPageClick}>+</button>
                </ul>
            </div>
            {this.state.error && <Error message={this.state.error} />}
        </div>
    }

}

export default CreateStory