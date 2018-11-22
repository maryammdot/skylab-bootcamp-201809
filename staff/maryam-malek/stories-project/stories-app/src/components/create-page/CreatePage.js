import React, { Component } from 'react'
import './style.css'
import logic from '../../logic'
import Error from '../error/Error'
import Canvas from '../canvas/Canvas'
import swal from 'sweetalert2'


class CreatePage extends Component {
    state = { error: null, draw: true, text: false, showAudio: false, preview: false, index: 1, textPh:'ESCRIU AQUÍ EL TEXT DE LA PÀGINA... ', storyId: '', pageId: '', image:'../../images/picture.png' }

    componentDidMount() {
        try {
            if (!this.props.pageId) {
                logic.retrieveStory(this.props.storyId)
                    .then(({ id, title, pages }) => {

                        this.setState({ storyId: this.props.storyId, title, pages, index: (pages.length + 1), error: null })
                        return logic.addPage(id, this.state.index, null)
                    })
                    .then(({ pageId, image }) => {

                        this.setState({ pageId, image })
                    })
                    .catch(err => this.setState({ error: err.message }))
            } else {
                logic.retrieveStory(this.props.storyId)
                    .then(({ id, title, pages }) => {

                        this.setState({ storyId: this.props.storyId, title, pages, index: (pages.length + 1), error: null })
                        return logic.retrievePage(this.props.pageId, id)
                    })
                    .then(({ id, index, image, audio, text }) => {

                        this.setState({ pageId: id, image, audio, index, textPh: text })
                        return logic.retrievePagePicture(this.props.pageId, this.props.storyId)
                    })
                    .then(({dataURL, vecArr}) => {
                        this.setState({ dataURL, vecArr})
                    })
                    .catch(err => this.setState({ error: err.message }))
            }

        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    handleDrawClick = () => {
        this.setState({ draw: true, text: false, showAudio: false, preview: false, error: null })
    }

    handleTextClick = () => {
        this.setState({ text: true, draw: false, showAudio: false, preview: false, error: null })
    }

    handleAudioClick = () => {
        this.setState({ showAudio: true, text: false, draw: false, preview: false, error: null })
    }

    handlePreviewlick = () => {
        this.setState({ preview: true, text: false, showAudio: false, draw: false, error: null })
    }

    handleHelpDrawClick = () => {
        //MODAL WITH INFO
        swal({
            title: 'ARROSSEGANT EL DIT DIBUIXA LA PÀGINA DEL TEU CONTE',
            width: 300,
            padding: '3em',
            background: '#fff url(/images/trees.png)',
            confirmButtonText: 'ESTIC PREPARADA',
            confirmButtonColor: '#0097A7'
            // backdrop: `
            //   rgba(0,0,123,0.4)
            //   url("/images/nyan-cat.gif")
            //   center left
            //   no-repeat
            // `
          })          
    }

    handleSaveDrawClick = () => {
        // logic.savePagePic() 
    }

    handleHelpTextClick = () => {
        //MODAL WITH INFO
    }

    handleChangeText = event => {
        const textPh = event.target.value
        this.setState({ textPh })
    }

    handleSaveTextClick = () => {
        const { storyId, pageId, index, textPh } = this.state

        logic.updatePage(pageId, storyId, index, textPh)
    }

    handleHelpAudioClick = () => {
        //MODAL WITH INFO
    }

    handleSaveAudioClick = () => {
        // logic.savePageAudio() 
    }

    handleHelpPreviewClick = () => {
        //MODAL WITH INFO
    }

    handleBackPreviewClick = () => {
        this.props.onBackClick(this.state.storyId)
    }

    // clearContents = (element) =>{
    //     element.value = ''
    // onFocus={() => this.clearContents(this)}
    // }

    // handleEnd = dataURL => {
    //     this.setState({dataURL})
    // onEnd={this.handleEnd}
    // }

    render() {
        return <div className='body'>
            <div className='container'>
                <div className="title">
                    <h1>{this.state.title}</h1>
                    {/* <div className="info">
                        <button className="help">?</button>
                        <button className="save">SAVE / GO TO BOOK</button>
                        <button className="not-save">DON'T SAVE</button>
                    </div> */}
                </div>
                {this.state.draw && <div>
                    <h4 className="draw-title">PAGE DRAW</h4>
                    <div className="info">
                        <button className="help" onClick={this.handleHelpDrawClick}>?</button>
                        <button className="save" onClick={this.handleSaveDrawClick}>GUARDAR</button>
                        {/* <button className="not-save" onClick={this.handleNotSaveDrawClick}>DESCARTAR</button> */}
                    </div>
                    {/* <canvas className="canvas" id="page-draw" width="500" height="300"></canvas> */}
                    <Canvas storyId={this.state.storyId} pageId={this.state.pageId} />
                </div>}
                {this.state.text && <div>
                    <h4 className="text-title">PAGE TEXT</h4>
                    <div className="info">
                        <button className="help" onClick={this.handleHelpTextClick}>?</button>
                        {/* <button className="save" onClick={this.handleSaveTextClick}>GUARDAR</button> */}
                        {/* <button className="not-save">DON'T SAVE</button> */}
                    </div>
                    <textarea className="textarea" name="text" id="text-page" maxLength='100' placeHolder='ESCRIU AQUÍ EL TEXT DE LA PÀGINA...' defaultValue={this.state.textPh} onChange={this.handleChangeText} onBlur={this.handleSaveTextClick} cols="20" rows="10" ></textarea>
                </div>}
                {this.state.showAudio && <div>
                    <h4 className="audio-title">PAGE AUDIO</h4>
                    <div className="info">
                        <button className="help" onClick={this.handleHelpAudioClick}>?</button>
                        <button className="save" onClick={this.handleSaveAudioClick}>GUARDAR</button>
                        {/* <button className="not-save">DON'T SAVE</button> */}
                    </div>
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
                    <div className="info">
                        <button className="help" onClick={this.handleHelpPreviewClick}>?</button>
                        <button className="save" onClick={this.handleBackPreviewClick}>TORNAR AL LLIBRE</button>
                        {/* <button className="not-save">DON'T SAVE</button> */}
                    </div>
                    <div className="preview-container">
                        <img src={this.state.dataURL} alt="page 1 image" />
                        <div className="audio-buttons">
                            <button className="audio"><i className="fa fa-play-circle"></i></button>
                            <button className="audio"><i className="fa fa-volume-up"></i></button>
                        </div>
                        <div className="text-area">
                            <span>{this.state.textPh}</span>
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