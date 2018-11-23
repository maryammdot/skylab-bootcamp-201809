import React, { Component } from 'react'
import './style.css'
import logic from '../../logic'
import Canvas from '../canvas/Canvas'
import Textarea from '../textarea/Textarea'
import Audio from '../audio/Audio'
import Preview from '../preview/Preview'
import Error from '../error/Error'


class CreatePage extends Component {
    state = { error: null, draw: false, showText: false, showAudio: false, preview: true, index: 1, text: undefined, storyId: '', pageId: '', image: '../../images/picture.png', hasImage: false, dataURL: '', vectors: [] }

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
                    .then(({ id, index, image, audio, text, hasImage }) => {

                        this.setState({ pageId: id, image, audio, index, text, hasImage })
                        if (hasImage) {
                            return logic.retrievePagePicture(this.props.pageId, this.props.storyId)
                        }
                    })
                    .then(({ dataURL, vectors }) => {
                        
                        this.setState({ dataURL, vectors })
                    })
                    .catch(err => this.setState({ error: err.message }))
            }

        } catch (err) {
            this.setState({ error: err.message })
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
        // logic.savePagePic() 
        logic.savePagePicture(this.state.pageId, this.state.storyId, dataURL, vectors)
            .then(() => {
                return logic.retrievePagePicture(this.state.pageId, this.state.storyId)
            })
            .then(({ dataURL, vectors }) => {
                
                this.setState({ dataURL, vectors })
            })
    }

    //Textarea component
    handleSaveText = text => {
        const { storyId, pageId, index } = this.state

        this.setState({ text })

        logic.updatePage(pageId, storyId, index, text)
    }

    //Audio component
    handleSaveAudioClick = () => {
        // logic.savePageAudio() 
    }

    //Preview component
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
                </div>
                {this.state.draw && <Canvas storyId={this.state.storyId} pageId={this.state.pageId} vectors={this.state.vectors} onChange={this.handleCanvasChange} onHelpClick={this.handleHelpDrawClick} />}
                {this.state.showText && <Textarea text={this.state.text} onSaveText={this.handleSaveText}/>}
                {this.state.showAudio && <Audio />}
                {this.state.preview && <Preview dataURL={this.state.dataURL} text={this.state.text} onBackClick={this.handleBackPreviewClick}/>}
                <div className="navbar">
                    <button className="draw" onClick={this.handleDrawClick}><i className="fa fa-pencil"></i></button>
                    <button className="text" onClick={this.handleTextClick}><i className="fa fa-text-width"></i></button>
                    <button className="audio" onClick={this.handleAudioClick}><i className="fa fa-youtube-play"></i></button>
                    <button className="preview" onClick={this.handlePreviewClick}><i className="fa fa-eye"></i></button>
                </div>
            </div>
            {this.state.error && <Error message={this.state.error} />}
        </div>
    }

}

export default CreatePage