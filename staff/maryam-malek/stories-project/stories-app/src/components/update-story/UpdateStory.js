import React, { Component } from 'react'
import './style.css'
import logic from '../../logic'
import Error from '../error/Error'
import Detail from '../detail/Detail'
import Canvas from '../canvas/Canvas'
import swal from 'sweetalert2'
import ReactTooltip from 'react-tooltip'

class CreateStory extends Component {
    state = { error: null, editCover: false, id: '', pages: [], dataURL: './images/cover.png', vectors: [] }

    componentDidMount() {
        try {
            logic.retrieveStory(this.props.storyId)
                .then(({ id, title, pages, hasCover, textLanguage, audioLanguage, inProcess, author }) => {

                    this.setState({ author, storyId: id, title, pages, hasCover, inProcess, error: null, textLanguage, audioLanguage })
                    if (hasCover) {
                        return logic.retrieveStoryCover(this.props.storyId)
                            .then(({ dataURL, vectors }) => {

                                this.setState({ dataURL, vectors, error: null })
                            })
                    }
                })
                .catch(err => {
                    let message
                    switch (err.message) {
                        default:
                            message = err.message
                    }
                    this.setState({ error: message })
                })
        } catch (err) {
            let message
            switch (err.message) {
                default:
                    message = err.message
            }
            this.setState({ error: message })
        }
    }

    // Cover methods
    handleCoverClick = () => {
        this.setState({ editCover: true, error: null })
    }

    handleCanvasChange = (dataURL, vectors) => {

        try {
            logic.saveStoryCover(this.props.storyId, dataURL, vectors)
                .then(() => {
                    this.setState({ error: null })
                    return logic.retrieveStoryCover(this.props.storyId)
                })
                .then(({ dataURL, vectors }) => {

                    this.setState({ dataURL, vectors, error: null })
                })
                .catch(err => {
                    let message
                    switch (err.message) {
                        default:
                            message = err.message
                    }
                    this.setState({ error: message })
                })
        } catch (err) {
            let message
            switch (err.message) {
                default:
                    message = err.message
            }
            this.setState({ error: message })
        }
    }

    handleCloseDrawClick = () => {
        this.setState({ editCover: false, error: null })
    }


    // Form methods
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
            logic.updateStory(this.state.storyId, title, audioLanguage, textLanguage)
                .then(() => {
                    this.setState({ error: null })
                    swal({
                        title: `CANVIS GUARDATS`,
                        width: 300,
                        padding: '3em',
                        background: '#fff url(/images/trees.png)',
                        confirmButtonText: 'SOM-HI',
                        confirmButtonColor: '#0097A7'
                    })

                    return logic.retrieveStory(this.state.storyId)
                })
                .then(({ title, audioLanguage, textLanguage, pages }) => {
                    this.setState({ title, audioLanguage, textLanguage, pages, error: null })
                })
                .catch(err => {
                    let message
                    switch (err.message) {
                        default:
                            message = err.message
                    }
                    this.setState({ error: message })
                })
        } catch (err) {
            let message
            switch (err.message) {
                default:
                    message = err.message
            }
            this.setState({ error: message })
        }
    }

    //Pages methods
    handleNewPageClick = () => {
        if (this.state.storyId) {
            try {
                logic.addPage(this.state.storyId, null)
                    .then(({ pageId }) => {
                        this.props.onNewPageClick(this.state.storyId, pageId)

                        this.setState({ pageId, error: null })
                    })
                    .catch(err => {
                        let message
                        switch (err.message) {
                            default:
                                message = err.message
                        }
                        this.setState({ error: message })
                    })
            } catch (err) {
                let message
                switch (err.message) {
                    default:
                        message = err.message
                }
                this.setState({ error: message })
            }
        } else {
            this.setState({ error: 'omple i guarda la informació del compte primer' })
        }
    }

    handleDetailClick = id => {
        this.props.onDetailClick(id)
    }

    handleRemovePageClick = pageId => {
        swal({
            title: 'ESTÀS SEGUR?',
            text: "NO PODRÀS TORNAR A RECUPERAR LA PÀGINA!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'SI, LA VULL ESBORRAR!',
            cancelButtonText: 'NO!'
        }).then((result) => {
            if (result.value) {
                try {
                    return logic.removePage(pageId, this.state.storyId)
                        .then(() => {
                            swal(
                                'ESBORRAT!',
                                `S'HA ESBORRAT LA PÀGINA`,
                            )
                            return logic.retrieveStory(this.state.storyId)
                        })
                        .then(({ pages }) => {

                            this.setState({ pages, error: null })
                        })
                        .catch(err => {
                            let message
                            switch (err.message) {
                                default:
                                    message = err.message
                            }
                            this.setState({ error: message })
                        })
                } catch (err) {
                    let message
                    switch (err.message) {
                        default:
                            message = err.message
                    }
                    this.setState({ error: message })
                }
            }
        })
    }

    //Story methods

    handleHelpClick = () => {
        swal({
            text: `APRETA A SOBRE DEL PINGÜÍ PER A DIBUIXAR LA PORTADA DEL TEU CONTE, APRETA EL CUBELL D'ESCOMBRARIES SI VOLS ESBORRAR EL CONTE, APRETA EL COHET SI VOLS QUE EL CONTE EL PUGUIN VEURE ALTRES NENS O APRETA EL NEN SI EL VOLS PODER VEURE NOMÉS TU`,
            width: 300,
            padding: '3em',
            background: '#fff url(/images/trees.png)',
            confirmButtonText: 'SOM-HI',
            confirmButtonColor: '#0097A7'
        })
    }

    handleRemoveClick = () => {
        swal({
            title: 'ESTÀS SEGUR?',
            text: "NO PODRÀS TORNAR A RECUPERAR EL CONTE!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'SI, EL VULL ESBORRAR!',
            cancelButtonText: 'NO!'
        }).then((result) => {
            if (result.value) {
                try {
                    return logic.removeStory(this.state.storyId)
                        .then(() => {
                            swal(
                                'ESBORRAT!',
                                `S'HA ESBORRAT EL TEU CONTE`,
                            )
                            this.props.onBackClick()
                            this.setState({ error: null })
                        })
                        .catch(err => {
                            let message
                            switch (err.message) {
                                default:
                                    message = err.message
                            }
                            this.setState({ error: message })
                        })
                } catch (err) {

                    let message
                    switch (err.message) {
                        default:
                            message = err.message
                    }
                    this.setState({ error: message })
                }
            }
        })
    }

    handleFinishClick = () => {
        swal({
            title: 'HAS ACABAT EL CONTE?',
            text: "SI JA HAS ACABAT EL CONTE EL POTS COMPARTIR PER A QUE EL PUGUIN VEURE ALTRES NENS DE TOT EL MÓN",
            // type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'COMPARTIR',
            cancelButtonText: `NO L'HE ACABAT`
        }).then((result) => {
            if (result.value) {
                try {
                    return logic.finishStory(this.state.storyId)
                        .then(() => {
                            swal(
                                'ARA JA EL PODEN VEURE ALTRES NENS!',
                            )
                            this.setState({ inProcess: false, error: null })
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
                            this.setState({ error: message })
                        })
                } catch (err) {
                    let message
                    switch (err.message) {
                        default:
                            message = err.message
                    }
                    this.setState({ error: message })
                }
            }
        })
    }

    handleWorkingClick = () => {
        swal({
            title: 'VOLS SEGUIR TREBALLANT EN EL TEU CONTE?',
            text: "SI ESTÀS TREBALLANT EN EL TEU CONTE I NO VOLS QUE ELS ALTRES NENS EL PUGUIN VEURE APRETA EDITANT",
            // type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'EDITANT',
            cancelButtonText: `JA L'HE ACABAT`
        }).then((result) => {
            if (result.value) {
                try {
                    return logic.workInStory(this.state.storyId)
                        .then(() => {
                            swal(
                                'ARA EL POTS VEURE NOMÉS TU!',
                            )
                            this.setState({ inProcess: true, error: null })
                        })
                        .catch(err => {
                            let message
                            switch (err.message) {
                                default:
                                    message = err.message
                            }
                            this.setState({ error: message })
                        })
                } catch (err) {
                    let message
                    switch (err.message) {
                        default:
                            message = err.message
                    }
                    this.setState({ error: message })
                }
            }
        })
    }

    handleBackClick = () => {
        this.props.onBackClick()
    }

    render() {
        return <div className='container-story'>
            <div className='update-story-header'>
                <h1>{this.state.title}</h1>
            </div>
            <div className='body-container-update-story-extra'>
                <div className='body-container-update-story'>
                    <div className='upper-body-update-story'>
                        {!this.state.editCover && <img onClick={this.handleCoverClick} data-tip="DIBUIXA LA PORTADA" className="book-cover" src={this.state.dataURL} alt="book cover"></img>}
                        {this.state.editCover && <div className='canvas-cover'><Canvas className='canvas-cover' cover={true} vectors={this.state.vectors} onChange={this.handleCanvasChange} onCloseDrawClick={this.handleCloseDrawClick} /></div>}
                        {!this.state.editCover && <form className="book-details" onSubmit={this.handleSubmit}>
                            <input type="text" placeholder={`TÍTOL: ${this.state.title}`} onChange={this.handleTitleChange} />
                            <input type="text" disabled placeholder={`AUTOR: ${this.state.author}`} />
                            <input type="text" placeholder={`AUDIO: ${this.state.audioLanguage}`} onChange={this.handleAudioLanguageChange} />
                            <input type="text" placeholder={`TEXT: ${this.state.textLanguage}`} onChange={this.handleTextLanguageChange} />
                            <button type="submit">GUARDA ELS CANVIS</button>
                        </form>}
                        {!this.state.editCover && <div className='buttons-story'>
                            <button className="help-story" onClick={this.handleHelpClick}><i className="fa fa-question icon-update-page"></i></button>
                            <button data-tip="ESBORRA EL CONTE" className="delete-story" onClick={this.handleRemoveClick}><i className="fa fa-trash-o icon-update-page"></i></button>
                            {this.state.inProcess && <button data-tip="COMPARTEIX EL CONTE" className="finish" onClick={this.handleFinishClick}><i className="fa fa-rocket icon-update-page"></i></button>}
                            {!this.state.inProcess && <button data-tip="TORNAR A FER PRIVAT EL CONTE" className="finish" onClick={this.handleWorkingClick}><i className="fa fa-child icon-update-page"></i></button>}

                        </div>}
                    </div>
                    <div className='bottom-body-update-story'>
                        <div className='bottom-body-header'>
                            {!this.state.editCover && !!this.state.pages.length && <h3>PÀGINES</h3>}
                            {!this.state.editCover && !!this.state.pages.length && <button data-tip="CREA UNA NOVA PÀGINA" className="newPageButton" onClick={this.handleNewPageClick}><i className="fa fa-plus-circle icon-new-update-page"></i></button>}
                        </div>
                        {!this.state.editCover && <ul className="pages-section">
                            {!!this.state.pages.length && this.state.pages.map((page, i) => <div className='detail-pages-update-story'><Detail pages={true} img={page.hasImage ? page.dataURL : './images/picture.png'} text={i + 1} id={page.id} storyId={this.state.storyId} onDetailClick={this.handleDetailClick} onRemoveClick={this.handleRemovePageClick} /></div>)}
                            {!this.state.pages.length && <button className="firstPageButton" onClick={this.handleNewPageClick}>CREA LA PRIMERA PÀGINA DEL TEU CONTE</button>}
                        </ul>}
                    </div>
                </div>
            </div>
            {this.state.error && <Error message={this.state.error} />}
            <ReactTooltip effect='solid' />
        </div >
    }

}

export default CreateStory