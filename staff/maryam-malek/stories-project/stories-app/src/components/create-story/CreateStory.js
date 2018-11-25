import React, { Component } from 'react'
import './style.css'
import logic from '../../logic'
import Error from '../error/Error'
import Detail from '../detail/Detail'
import Canvas from '../canvas/Canvas'
import swal from 'sweetalert2'

class CreateStory extends Component {
    state = { error: null, editCover: false, id: '', cover: '../../images/cover.png', title: 'TÍTOL DEL CONTE', audioLanguage: `IDIOMA DE L'AUDIO`, textLanguage: 'IDIOMA DEL TEXT', pages: [], dataURL: '', vectors: [] }

    componentDidMount() {
        if (this.props.storyId) {
            try {
                logic.retrieveStory(this.props.storyId)
                    .then(({ id, title, pages, hasCover, textLanguage, audioLanguage, inProcess }) => {

                        this.setState({ storyId: id, title, pages, hasCover, inProcess, id: this.props.storyId, error: null, textLanguage, audioLanguage })
                        if (hasCover) {
                            return logic.retrieveStoryCover(this.props.storyId)
                        }
                    })
                    .then(({ dataURL, vectors }) => {
                        this.setState({ dataURL, vectors })
                    })
                    .catch(err => this.setState({ error: err.message }))
            } catch (err) {
                this.setState({ error: err.message })
            }
        }
    }

    // componentDidUpdate() {
    //     if (this.props.storyId) {
    //         try {
    //             logic.retrieveStory(this.props.storyId)
    //                 .then(({ title, pages, cover }) => {
    //                     debugger
    //                     this.setState({ title, pages, cover, id: this.props.storyId, error: null })
    //                 })
    //                 .catch(err => this.setState({ error: err.message }))
    //         } catch (err) {
    //             this.setState({ error: err.message })
    //         }
    //     }
    // }

    // Cover methods
    handleCoverClick = () => {
        this.setState({ editCover: true })
    }

    handleCanvasChange = (dataURL, vectors) => {
        try {
            logic.saveStoryCover(this.props.storyId, dataURL, vectors)
                .then(() => {
                    return logic.retrieveStoryCover(this.props.storyId)
                })
                .then(({ dataURL, vectors }) => {

                    this.setState({ dataURL, vectors })
                })
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    handleCloseDrawClick = () => {
        this.setState({ editCover: false })

    }


    // Form methods
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

    //Pages methods
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


    handleRemovePageClick = pageId => {
        swal({
            title: 'ESTÀS SEGUR?',
            text: "NO PODRÀS TORNAR A RECUPERAR LA PÀGINA!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'SI, EL VULL ESBORRAR!',
            cancelButtonText: 'NO!'
        }).then((result) => {
            if (result.value) {
                try {
                    return logic.removePage(pageId, this.state.storyId)
                        .then(() => {
                            swal(
                                'ESBORRAT!',
                                `S'HA ESBORRAT LA PÀGINA`,
                                'ÈXIT'
                            )
                            return logic.retrieveStory(this.state.storyId)
                        })
                        .then(({ pages }) => {

                            this.setState({ pages, error: null })
                        })
                        .catch(err => this.setState({ error: err.message }))
                } catch (err) {
                    this.setState({ error: err.message })
                }
            }
        })

    }

    //Story methods

    handleHelpClick = () => {
        swal({
            title: `APRETA EL CUBELL D'ESCOMBRSRIES SI VOLS ESBORRAR EL CONTE, APRETA EL COHET SI VOLS QUE EL TEU CONTE EL PUGUIN VEURE ALTRES NENS O APRETA EL NEN SI VOLS VEURE NOMÉS TU EL TEU CONTE`,
            width: 300,
            padding: '3em',
            background: '#fff url(/images/trees.png)',
            confirmButtonText: 'ESTIC PREPARAT',
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
                                'ÈXIT'
                            )
                            this.props.onBackClick()
                        })
                        .catch(err => this.setState({ error: err.message }))
                } catch (err) {
                    this.setState({ error: err.message })
                }
            }
        })
    }

    handleFinishClick = () => {
        swal({
            title: 'HAS ACABAT EL CONTE?',
            text: "SI JA HAS ACABAT EL CONTE EL POTS COMPARTIR PER A QUE EL PUGUIN VEURE TOTS ELS NENS DEL MÓN",
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
                                'ÈXIT'
                            )
                            this.setState({ inProcess: false })
                        })
                        .catch(err => this.setState({ error: err.message }))
                } catch (err) {
                    this.setState({ error: err.message })
                }
            }
        })
    }

    handleWorkingClick = () => {
        swal({
            title: 'VOLS TORNAR A EDITAR EL TEU CONTE?',
            text: "SI ESTÀS EDITANT EL TEU CONTE I NO VOLS QUE ELS ALTRES NENS EL PUGUIN VEURE APRETA EDITANT",
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
                                'ARA EL TORNES A VEURE NOMÉS TU!',
                                'ÈXIT'
                            )
                            this.setState({ inProcess: true })
                        })
                        .catch(err => this.setState({ error: err.message }))
                } catch (err) {
                    this.setState({ error: err.message })
                }
            }
        })
    }

    handleBackClick = () => {
        this.props.onBackClick()
    }

    render() {
        return <div className='container-story'>
                <h1>{this.state.title}</h1>
                <button className="back-story" onClick={this.handleBackClick}>TORNAR ALS MEUS CONTES</button>
                {!this.state.editCover && <a className='book-cover-container' onClick={this.handleCoverClick}><img className="book-cover" src={this.state.dataURL} alt="book cover"></img></a>}
                {this.state.editCover && <div className='canvas-cover'><Canvas className='canvas-cover' cover={true} vectors={this.state.vectors} onChange={this.handleCanvasChange} onCloseDrawClick={this.handleCloseDrawClick} /></div>}
                {!this.state.editCover && <form className="book-details" onSubmit={this.handleSubmit}>
                    <input type="text" placeholder={this.state.title} onChange={this.handleTitleChange} />
                    <input type="text" disabled placeholder={logic._userId} />
                    <input type="text" placeholder={this.state.audioLanguage} onChange={this.handleAudioLanguageChange} />
                    <input type="text" placeholder={this.state.textLanguage} onChange={this.handleTextLanguageChange} />
                    <button type="submit">GUARDA</button>
                </form>}
                {!this.state.editCover && <div className='buttons-story'>
                    <button className="help-story" onClick={this.handleHelpClick}><i class="fa fa-question"></i></button>
                    <div><button className="delete-story" onClick={this.handleRemoveClick}><i class="fa fa-trash-o"></i></button>
                    {this.state.inProcess && <button className="finish" onClick={this.handleFinishClick}><i class="fa fa-rocket"></i></button>}
                    {!this.state.inProcess && <button className="finish" onClick={this.handleWorkingClick}><i class="fa fa-child"></i></button>}
                    </div>
                </div>}
                {!this.state.editCover && <h3>PÀGINES</h3>}
                {!this.state.editCover && <ul className="pages-section">
                    {this.state.pages.map(page => <Detail pages={true} img={page.dataURL} text={page.index} id={page.id} storyId={this.state.storyId} onDetailClick={this.handleDetailClick} onRemoveClick={this.handleRemovePageClick} />)}
                    {this.state.pages.length? <button className="newPageButton" onClick={this.handleNewPageClick}><i class="fa fa-plus-circle"></i></button>: <button className="firstPageButton" onClick={this.handleNewPageClick}>CREA LA PRIMERA PÀGINA DEL TEU CONTE</button>}
                </ul>}
            {this.state.error && <Error message={this.state.error} />}
        </div>
    }

}

export default CreateStory