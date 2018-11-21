import React, { Component } from 'react'
import './style.css'
import logic from '../../logic'
import Error from '../error/Error'
import Detail from '../detail/Detail'

class CreatePage extends Component {
    state = { error: null, draw: true, text: false, audio: false, preview: false }

    componentDidMount() {
        try {
            logic.retrieveStory(this.props.storyId)
                .then(({ title, pages }) => {
                    this.setState({ title, pages, error: null })
                })
                .catch(err => this.setState({ error: err.message }))
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    handleDrawClick = () => {
        this.setState({ draw: true, text: false, audio: false, preview: false, error: null })
    }

    handleTextClick = () => {
        this.setState({ text: true, draw: false, audio: false, preview: false, error: null })
    }

    handleAudioClick = () => {
        this.setState({ audio: true, text: false, draw: false, preview: false, error: null })
    }

    handlePreviewlick = () => {
        this.setState({ preview: true, text: false, audio: false, draw: false, error: null })
    }

    render() {
        return <div className='body'>
            <div className='container'>
                <div class="title">
                    <h1>{this.state.title}</h1>
                    <div class="info">
                        <button className="help">?</button>
                        <button className="save">SAVE / GO TO BOOK</button>
                        <button className="not-save">DON'T SAVE</button>
                    </div>
                </div>
                {this.state.draw && <div>
                    <h4 className="draw-title">PAGE DRAW</h4>
                    <canvas className="canvas" id="page-draw" width="500" height="300"></canvas>
                </div>}
                {this.state.text && <div>
                    <h4 className="text-title">PAGE TEXT</h4>
                    <textarea className="textarea" name="DRAW" id="DRAW-PAGE" placeholder="WRITE HERE YOUR TEXT..." cols="20" rows="10"></textarea>
                </div>}
                {this.state.audio && <div>
                    <h4 className="audio-title">PAGE AUDIO</h4>
                    <div className="audio-container">
                        <div className="rec-stop">
                            <button className="rec"><i className="fa fa-dot-circle-o"></i></button>
                            <button><i className="fa fa-stop"></i></button>
                        </div>
                        <div className="play-sec">
                            <button><i className="fa fa-play-circle"></i></button>
                            <span> 10 SECONDS</span>
                        </div>
                    </div>
                </div>}
                {this.state.preview && <div>
                    <h4 className="preview-title">PREVIEW PAGE</h4>
                    <div className="preview-container">
                        <img src="../images/bat.png" alt="page 1 image" />
                        <div className="audio-buttons">
                            <button className="audio"><i className="fa fa-play-circle"></i></button>
                            <button className="audio"><i className="fa fa-volume-up"></i></button>
                        </div>
                        <div className="text-area">
                            <span>ONCE UPON A TIME, A BAT NAMED BATTY WAS FLYING THROUGH BARCELONA</span>
                        </div>
                    </div>
                    {/* <button className="audio"><i className="fa fa-volume-off"></i></button> */}
                </div>}
                <div className="navbar">
                    <button className="draw" onClick={this.handleDrawClick}><i className="fa fa-pencil"></i></button>
                    <button className="text" onClick={this.handleTextClick}><i className="fa fa-text-width"></i></button>
                    <button className="audio" onClick={this.handleAudioClick}><i className="fa fa-youtube-play"></i></button>
                    <button className="preview" onClick={this.handlePreviewlick}><i className="fa fa-eye"></i></button>
                </div>
            </div>
            {this.state.error && <Error message={this.state.error} />}
        </div>
    }

}

export default CreatePage