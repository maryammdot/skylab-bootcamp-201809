import React, { Component } from 'react'
import './style.css'
import logic from '../../logic'
import Error from '../../components/error/Error'
import swal from 'sweetalert2'

class ReadStory extends Component {
    state = { pages: [], dataURL: './images/cover.png' }

    componentDidMount() {
        try {
            logic.retrieveStory(this.props.storyId)
                .then(({ id, title, pages, hasCover, textLanguage, audioLanguage }) => {
                    this.setState({ error: null, storyId: id, title, pages, hasCover, textLanguage, audioLanguage })
                    if (hasCover) {
                        return logic.retrieveStoryCover(this.props.storyId)
                            .then(({ dataURL }) => {
                                this.setState({ dataURL })

                            })
                    }
                })
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    handleHelpClick = () => {
        swal({
            title: `TODO`,
            width: 400,
            padding: '3em',
            confirmButtonText: 'ESTIC PREPARAT',
            confirmButtonColor: '#0097A7'
        })
    }

    handleBackClick = () => {
        this.props.onBackClick()
    }

    handleReadClick = () => {
        this.props.onReadClick(this.props.storyId, this.state.pages[0].id)
    }


    render() {
        return <div className='container-read-story'>
            <div className='read-story-header'>
                <h1>{this.state.title}</h1>
                <div className='buttons-story-read'>
                    <button className="help-story-read-button" onClick={this.handleHelpClick}><i class="fa fa-question"></i></button>
                    <button className="favourites-story-button" onClick={this.handleHelpClick}><i class="fa fa-heart-o"></i></button>
                    <button className="back-story-read-button" onClick={this.handleBackClick}>TORNAR ALS CONTES</button>
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
                    <p>{this.state.title}</p>
                    {/* <p>{this.state.author}</p> */}
                    <h4>IDIOMA DE L'ÀUDIO</h4>
                    <p>{this.state.audioLanguage}</p>
                    <h4>IDIOMA DEL TEXT</h4>
                    <p>{this.state.textLanguage}</p>
                    <h4>NÚMERO DE PÀGINES</h4>
                    <p>{this.state.pages.length}</p>
                </div>
            </div>
            <button className="begin-story-read-button" onClick={this.handleReadClick}>COMENÇAR A LLEGIR</button>
            {this.state.error && <Error message={this.state.error} />}
        </div >
    }

}

export default ReadStory