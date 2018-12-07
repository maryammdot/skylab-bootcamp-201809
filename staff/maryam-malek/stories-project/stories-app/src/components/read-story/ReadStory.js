import React, { Component } from 'react'
import './style.css'
import logic from '../../logic'
import Error from '../../components/error/Error'
import swal from 'sweetalert2'
import ReactTooltip from 'react-tooltip'

class ReadStory extends Component {
    state = { pages: [], dataURL: './images/cover.png', favourite: false, author: '' }

    componentDidMount() {
        try {
            logic.retrieveStory(this.props.storyId)
                .then(({ id, title, pages, hasCover, textLanguage, audioLanguage, author }) => {

                    this.setState({ error: null, storyId: id, title, pages, hasCover, textLanguage, audioLanguage, author })
                    if (hasCover) {
                        return logic.retrieveStoryCover(this.props.storyId)
                            .then(({ dataURL }) => {
                                this.setState({ dataURL, error: null })
                            })
                    }
                })
                .then(() => {
                    this.setState({ error: null })
                    return logic.listFavourites()
                })
                .then(stories => {
                    stories.forEach(story => {
                        if (story.id === this.state.storyId) {
                            this.setState({ favourite: true, error: null })
                        }
                    })
                })
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    handleHelpClick = () => {
        swal({
            text: `APRETA EL BOTÓ DE 'COMENÇAR A LLEGIR' PER INICIAR EL CONTE. SI T'AGRADA, TE'L POTS GUARDAR A LA TEVA PÀGINA APRETANT EL COR`,
            width: 400,
            padding: '3em',
            confirmButtonText: 'SOM-HI',
            confirmButtonColor: '#0097A7'
        })
    }

    handleReadClick = () => {
        this.props.onReadClick(this.props.storyId, this.state.pages[0].id)
    }

    handleFavouritesClick = () => {

        try {
            if (this.state.favourite === false) {

                logic.addFavourite(this.props.storyId)
                    .then(() => {
                        this.setState({ favourite: true, error: null })
                    })
                    .catch(err => this.setState({ error: err.message }))
            } else {
                logic.removeFavourite(this.props.storyId)
                    .then(() => {
                        this.setState({ favourite: false, error: null })
                    })
                    .catch(err => this.setState({ error: err.message }))
            }
        } catch (err) {
            this.setState({ error: err.message })
        }
    }


    render() {
        return <div className='container-read-story'>
            <div className='read-story-header'>
                <div className='buttons-story-read'>
                    <button className="help-story-read-button" onClick={this.handleHelpClick}><i className="fa fa-question icon-question-read-story"></i></button>
                    {!this.state.favourite && <button className="favourites-story-button" data-tip="AFEGIR EL CONTE A PREFEREITS" onClick={this.handleFavouritesClick}><i className="fa fa-heart-o icon-fav-read-story"></i></button>}
                    {this.state.favourite && <button className="favourites-story-button" data-tip="ELIMINAR EL CONTE DE PREFERITS" onClick={this.handleFavouritesClick}><i className="fa fa-heart favourites-button_on"></i></button>}
                    <ReactTooltip effect='solid' />
                </div>
            </div>
            <div className='read-story-body'>
                <div className='read-story-body-img-div'>
                    <img src={this.state.dataURL} alt="book cover"></img>
                </div>
                <div className='book-info-read'>
                    <h4>TÍTOL</h4>
                    <p>{this.state.title}</p>
                    <h4>AUTOR</h4>
                    <p>{this.state.author}</p>
                    <h4>IDIOMA DE L'ÀUDIO</h4>
                    <p>{this.state.audioLanguage}</p>
                    <h4>IDIOMA DEL TEXT</h4>
                    <p>{this.state.textLanguage}</p>
                    <h4>NÚMERO DE PÀGINES</h4>
                    <p>{this.state.pages.length}</p>
                </div>
            </div>
            <div className='read-buttons'>
                {!!this.state.pages.length && <button className="begin-story-read-button" onClick={this.handleReadClick}>COMENÇAR A LLEGIR</button>}
                {!this.state.pages.length && <h3 className="begin-story-read-h3">AQUEST CONTE NO TÉ CAP PÀGINA</h3>}
            </div>
            {this.state.error && <Error message={this.state.error} />}
            <ReactTooltip effect='solid' />
        </div >
    }

}

export default ReadStory