import React, { Component } from 'react'
import './style.css'
import logic from '../../logic'
import Error from '../../components/error/Error'
import swal from 'sweetalert2'
import ReactTooltip from 'react-tooltip'

class ReadPage extends Component {
    state = { pages: [], next: false, last: false, dataURL: '../../images/picture.png' }

    componentDidMount() {
        try {
            logic.retrieveStory(this.props.storyId)
                .then(({ id, title, pages }) => {
                    this.setState({ error: null, index: Number(this.props.index), storyId: id, title, pages })
                    return logic.retrievePage(this.props.pageId, id)
                })
                .then(({ text, hasImage, hasAudio, audioURL }) => {
                    this.setState({ error: null, text, hasImage, hasAudio, audioURL })
                    if (hasImage) {
                        return logic.retrievePagePicture(this.props.pageId, this.props.storyId)
                            .then(({ dataURL }) => {
                                this.setState({ error: null, dataURL })
                            })
                    }
                })
                .then(() => {
                    if (this.state.pages.length > this.state.index + 1) {

                        this.setState({ error: null, next: true })
                    } else {

                        this.setState({ error: null, next: false })
                    }
                    if (this.state.index > 0) {

                        this.setState({ error: null, last: true })
                    } else {

                        this.setState({ error: null, last: false })
                    }
                    if (this.state.hasAudio) {
                        this.audioPlayer.play()
                    }
                })
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps)
            try {
                logic.retrieveStory(nextProps.storyId)
                    .then(({ id, title, pages }) => {
                        this.setState({ error: null, index: Number(nextProps.index), storyId: id, title, pages })
                        return logic.retrievePage(nextProps.pageId, id)
                    })
                    .then(({ text, hasImage, hasAudio, audioURL }) => {
                        this.setState({ error: null, text, hasImage, hasAudio, audioURL })
                        if (hasImage) {
                            return logic.retrievePagePicture(nextProps.pageId, nextProps.storyId)
                                .then(({ dataURL }) => {
                                    this.setState({ error: null, dataURL })
                                })
                        } else {
                            this.setState({ dataURL: '../../images/picture.png' })
                        }
                    })
                    .then(() => {
                        if (this.state.pages.length > this.state.index + 1) {

                            this.setState({ error: null, next: true })
                        } else {
                            this.setState({ error: null, next: false })
                        }
                        if (this.state.index > 0) {

                            this.setState({ error: null, last: true })
                        } else {
                            this.setState({ error: null, last: false })
                        }
                        if (this.state.hasAudio) {
                            this.audioPlayer.play()
                        }
                    })
                    .catch(err => this.setState({ error: err.message }))
            } catch (err) {
                this.setState({ error: err.message })
            }
    }

    handleHelpPageClick = () => {
        swal({
            text: `APRETA LES FLETXES DE LA DRETA O L'ESQUERRA PER ANAR ENDAVANT O ENDARRERE EN LES PÀGINES DEL CONTE APRETA EL TRIANGLE PER TORNAR A SENTIR L'AUDIO DE LA PÀGINA O EL QUADRAT PER DEIXAR-LO DE SENTIR`,
            width: 400,
            padding: '3em',
            confirmButtonText: 'SOM-HI',
            confirmButtonColor: '#0097A7'
        })
    }

    handleBackClick = () => {
        this.props.onBackClick(this.props.storyId)
    }

    handleNextPageClick = () => {
        const nextPageId = this.state.pages[this.state.index + 1].id

        this.props.onNextPageClick(this.props.storyId, nextPageId, ++this.state.index)
    }

    handleLastPageClick = () => {
        const lastPageId = this.state.pages[this.state.index - 1].id

        this.props.onLastPageClick(this.props.storyId, lastPageId, --this.state.index)
    }

    handlePlayClick = () => {
        this.audioPlayer.play()
    }

    handleStopClick = () => {
        this.audioPlayer.currentTime = 0

        this.audioPlayer.pause()
    }

    render() {
        return <div className='container-read-page'>
            <div className='header-read-page'>
                <h1>{this.state.title}</h1>
                <div className="info-read-page">
                    <button className='help-read-page-button' onClick={this.handleHelpPageClick}><i className="fa fa-question icon-question-read-page"></i></button>
                    <button className='back-read-page-button' onClick={this.handleBackClick}>TORNAR AL CONTE</button>
                </div>
            </div>
            <div className='read-page-book-extra-area'>
                <div className="read-page-book-area">
                    <img src={this.state.dataURL} alt="page image" />
                    {this.state.hasAudio && <div className="audio-buttons">
                        <button onClick={this.handlePlayClick} className="audio-play" data-tip="REPRODUIR L'AUDIO"><i className="fa fa-play-circle icon-audio-read"></i></button>
                        <button onClick={this.handleStopClick} className="audio-stop" data-tip="ATURAR L'AUDIO"><i className="fa fa-stop icon-audio-read"></i></button>
                        <audio ref={(ref) => (this.audioPlayer = ref)} onLoadedMetadataCapture={this.handleLoadedMetadata} autoPlay src={this.state.audioURL}></audio>
                    </div>}
                    <div className="text-area-read-page">
                        <span className='text-read-story'>{this.state.text}</span>
                    </div>
                    <span className='page-number-read-page'>PÀGINA {this.state.index + 1}</span>
                    {this.state.next && <button className="next" onClick={this.handleNextPageClick} data-tip="ANAR A LA SEGÜENT PÀGINA"><i className="fa fa-chevron-right icon-move-read-page"></i></button>}
                    {this.state.last && <button className="last" onClick={this.handleLastPageClick} data-tip="ANAR A LA PÀGINA ANTERIOR"><i className="fa fa-chevron-left icon-move-read-page"></i></button>}
                    <ReactTooltip effect='solid' />
                </div>
            </div>
            {this.state.error && <Error message={this.state.error} />}
            <ReactTooltip effect='solid' />
        </div>
    }
}

export default ReadPage