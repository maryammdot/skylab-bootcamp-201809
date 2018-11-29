import React, { Component } from 'react'
import './style.css'
import logic from '../../logic'
import Canvas from '../canvas/Canvas'
import Textarea from '../textarea/Textarea'
import Audio from '../audio/Audio'
import Preview from '../preview/Preview'
import Error from '../error/Error'


class CreatePage extends Component {
    state = { error: null, draw: false, showText: false, showAudio: false, preview: true, text: undefined, storyId: '', pageId: '', image: '../../images/picture.png', hasImage: false, hasAudio: false, audioURL: '', dataURL: '', vectors: [] }

    componentDidMount() {
        try {
            logic.retrieveStory(this.props.storyId)
                .then(({ id, title, pages }) => {
                    this.setState({ storyId: this.props.storyId, title, pages, error: null })

                    return logic.retrievePage(this.props.pageId, id)
                })
                .then(({ id, image, audioURL, text, hasImage, hasAudio }) => {
                    this.setState({ pageId: id, image, audioURL, text, hasImage, hasAudio, error: null })

                    if (hasImage) {
                        return logic.retrievePagePicture(this.props.pageId, this.props.storyId)
                            .then(({ dataURL, vectors }) => {

                                this.setState({ dataURL, vectors, error: null })
                            })
                    } else {
                        this.setState({dataURL: false, vectors: []})
                    }
                })
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.pageId !== this.props.pageId) {
            try {
                logic.retrieveStory(nextProps.storyId)
                    .then(({ id, title, pages }) => {
                        this.setState({ storyId: nextProps.storyId, title, pages, error: null })

                        return logic.retrievePage(nextProps.pageId, id)
                    })
                    .then(({ id, image, audioURL, text, hasImage, hasAudio }) => {
                        this.setState({ pageId: id, image, audioURL, text, hasImage, hasAudio, error: null })
                        
                        if (hasImage) {
                            return logic.retrievePagePicture(nextProps.pageId, nextProps.storyId)
                                .then(({ dataURL, vectors }) => {

                                    this.setState({ dataURL, vectors, error: null })
                                })
                        }else {
                            this.setState({dataURL: false, vectors: []})
                        }
                    })
                    .catch(err => this.setState({ error: err.message }))
            } catch (err) {
                this.setState({ error: err.message })
            }
        }
    }

    //Navbar flags
    handleDrawClick = () => {
        this.setState({ draw: true, showText: false, showAudio: false, preview: false, error: null })
    }

    handleTextClick = () => {
        this.setState({ showText: true, draw: false, showAudio: false, preview: false, error: null })
    }

    handleAudioClick = () => {
        this.setState({ showAudio: true, showText: false, draw: false, preview: false, error: null })
    }

    handlePreviewClick = () => {
        this.setState({ preview: true, showText: false, showAudio: false, draw: false, error: null })
    }


    //Canvas component
    handleCanvasChange = (dataURL, vectors) => {
        try {
            logic.savePagePicture(this.state.pageId, this.state.storyId, dataURL, vectors)
                .then(() => {
                    this.setState({ error: null })
                    return logic.retrievePagePicture(this.state.pageId, this.state.storyId)
                })
                .then(({ dataURL, vectors }) => {
                    this.setState({ dataURL, vectors, error: null })
                })
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    //Textarea component
    handleSaveText = text => {
        const { storyId, pageId } = this.state

        this.setState({ text, error: null })
        try {
            logic.updatePage(pageId, storyId, text)
                .then(() => {
                    this.setState({ error: null })
                })
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    //Audio component
    handleSaveAudio = (audioBlob) => {
        try {
            logic.savePageAudio(this.state.pageId, this.state.storyId, audioBlob)
                .then(() => {
                    this.setState({ error: null, hasAudio: true })
                })
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    //Preview component
    handleBackClick = () => {
        this.props.onBackClick(this.state.storyId)
    }

    handleNewPageClick = () => {
        if (this.state.storyId) {
            try {
                logic.addPage(this.state.storyId, null)
                    .then(({ pageId }) => {
                        this.props.onNewPageClick(this.state.storyId, pageId)

                        this.setState({ pageId, error: null })

                        // this.props.onNewPageClick(this.state.storyId, pageId)
                    })
                    .catch(err => {
                        let message
                        switch (err.message) {
                            // case `stories with query ${this.state.query} not found`:
                            //     message = `NO S'HA TROBAT CAP CONTE AMB AQUEST TÍTOL`
                            //     break
                            default:
                                message = err.message
                        }
                        this.setState({ error: message })
                    })
            } catch (err) {
                let message
                switch (err.message) {
                    // case `stories with query ${this.state.query} not found`:
                    //     message = `NO S'HA TROBAT CAP CONTE AMB AQUEST TÍTOL`
                    //     break
                    default:
                        message = err.message
                }
                this.setState({ error: message })
            }
        } else {
            this.setState({ error: 'omple i guarda la informació del compte primer' })
        }
    }



    render() {
        return <div className='container-create-page'>
            <div>
                <h1 className="title-create-page">{this.state.title}</h1>
                <button className="new-page-button" onClick={this.handleNewPageClick}>CREAR UNA NOVA PÀGINA</button>
            </div>
            <div className='content'>
                {this.state.draw && <Canvas onPreviewClick={this.handlePreviewClick} onTextClick={this.handleTextClick} storyId={this.state.storyId} pageId={this.state.pageId} vectors={this.state.vectors} onChange={this.handleCanvasChange} onHelpClick={this.handleHelpDrawClick} onBackClick={this.handleBackClick} />}
                {this.state.showText && <Textarea onDrawClick={this.handleDrawClick} onAudioClick={this.handleAudioClick} text={this.state.text} onSaveText={this.handleSaveText} onBackClick={this.handleBackClick} />}
                {this.state.showAudio && <Audio onTextClick={this.handleTextClick} onPreviewClick={this.handlePreviewClick} storyId={this.state.storyId} pageId={this.state.pageId} onBackClick={this.handleBackClick} onSaveAudio={this.handleSaveAudio} />}
                {this.state.preview && <Preview onAudioClick={this.handleAudioClick} onDrawClick={this.handleDrawClick} hasAudio={this.state.hasAudio} audioURL={this.state.audioURL} dataURL={this.state.dataURL} text={this.state.text} onBackClick={this.handleBackClick} />}
            </div>
            <div className="navbar-pages">
                <button className="draw" onClick={this.handleDrawClick}><i className="fa fa-pencil"></i></button>
                <button className="text" onClick={this.handleTextClick}><i className="fa fa-text-width"></i></button>
                <button className="audio" onClick={this.handleAudioClick}><i className="fa fa-dot-circle-o"></i></button>
                <button className="preview" onClick={this.handlePreviewClick}><i className="fa fa-eye"></i></button>
            </div>
            {this.state.error && <Error message={this.state.error} />}
        </div>
    }
}

export default CreatePage