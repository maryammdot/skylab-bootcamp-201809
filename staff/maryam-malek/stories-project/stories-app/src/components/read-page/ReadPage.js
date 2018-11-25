import React, { Component } from 'react'
import './style.css'
import logic from '../../logic'
import Error from '../../components/error/Error'
import swal from 'sweetalert2'

class ReadPage extends Component {
    state = {pages:[], next: false, last: false}

    componentDidMount() {
        try {
            
            logic.retrieveStory(this.props.storyId)
                .then(({ id, title, pages }) => {
                    this.setState({ error: null, index:Number(this.props.index), storyId: id, title, pages })
                    return logic.retrievePage(this.props.pageId, id)
                })
                .then(({ text, hasImage, hasAudio }) => {
                    this.setState({ error: null, text, hasImage, hasAudio })
                    if (hasImage) {
                        return logic.retrievePagePicture(this.props.pageId, this.props.storyId)
                    }
                })
                .then(({ dataURL }) => {
                    this.setState({ error: null, dataURL })

                    if(this.state.pages.length > this.state.index +1) {
                        this.setState({ error: null, next: true })
                    }
                    if(this.state.index > 0) {
                        this.setState({ error: null, last: true })
                    }
                })
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    componentWillReceiveProps(nextProps) {
        if(this.props !== nextProps)
        try {

            logic.retrieveStory(nextProps.storyId)
                .then(({ id, title, pages }) => {
                    this.setState({ error: null, index:Number(nextProps.index), storyId: id, title, pages })
                    return logic.retrievePage(nextProps.pageId, id)
                })
                .then(({ text, hasImage, hasAudio }) => {
                    this.setState({ error: null, text, hasImage, hasAudio })
                    if (hasImage) {
                        return logic.retrievePagePicture(nextProps.pageId, nextProps.storyId)
                    }
                })
                .then(({ dataURL }) => {
                    this.setState({ error: null, dataURL })

                    if(this.state.pages.length > this.state.index +1) {
                        this.setState({ error: null, next: true })
                    }
                    if(this.state.index > 0) {
                        this.setState({ error: null, last: true })
                    }
                })
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    handleBackClick = () => {
        this.props.onBackClick(this.props.storyId)
    }
    
    handleNextPageClick = () => {        
        const nextPageId = this.state.pages[this.state.index + 1].id
        this.props.onNextPageClick(this.props.storyId, nextPageId, ++ this.state.index)
    }

    handleLastPageClick = () => {
        const lastPageId = this.state.pages[this.state.index -1].id
        this.props.onLastPageClick(this.props.storyId, lastPageId, -- this.state.index)
    }

    render() {
        return <div className='container-read-page'>
            <div className='header-read-page'>
                <h1>{this.state.title}</h1>
                <div className="info-read-page">
                    <button className='help-read-page-button' onClick={this.handleHelpPageClick}><i className="fa fa-question"></i></button>
                    <button className='back-read-page-button' onClick={this.handleBackClick}>TORNAR AL LLIBRE</button>
                </div>
            </div>
            <div className="read-page-book-area">
                <img src={this.state.dataURL} alt="page image" />
                <div className="audio-buttons">
                    <button className="audio"><i className="fa fa-play-circle"></i></button>
                    <button className="audio"><i className="fa fa-volume-up"></i></button>
                    {/* <button className="audio"><i className="fa fa-volume-off"></i></button> */}
                </div>
                <div className="text-area-read-page">
                    <span className='text-read-story'>{this.state.text}</span>
                    <span>PÀGINA {this.state.index +1}</span>
                </div>
                {this.state.next && <button className="next" onClick={this.handleNextPageClick}><i className="fa fa-chevron-right"></i></button>}
                {this.state.last && <button className="last" onClick={this.handleLastPageClick}><i className="fa fa-chevron-left"></i></button>}
            </div>
        </div>
    }

}

export default ReadPage