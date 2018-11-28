import React, { Component } from 'react'
import './style.css'
import swal from 'sweetalert2'
import Error from '../error/Error'

class Audio extends Component {

    state = { text: '', error: null }

    componentDidMount() {
        if (this.props.audio) {
            this.setState({ audio: this.props.audio, error: null })
        }
    }

    handleHelpAudioClick = () => {
        swal({
            title: 'ARROSSEGANT EL DIT DIBUIXA LA PÀGINA DEL TEU CONTE',
            width: 300,
            padding: '3em',
            background: '#fff url(/images/trees.png)',
            confirmButtonText: 'SOM-HI',
            confirmButtonColor: '#0097A7'
        })
    }


    recordAudio = () => {
        return new Promise(resolve => {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    const mediaRecorder = new MediaRecorder(stream)
                    const audioChunks = []

                    mediaRecorder.addEventListener("dataavailable", event => {
                        audioChunks.push(event.data)
                    })

                    const start = () => {
                        mediaRecorder.start()
                    }

                    const stop = () => {
                        return new Promise(resolve => {
                            mediaRecorder.addEventListener("stop", () => {
                                const audioBlob = new Blob(audioChunks)
                                const audioUrl = URL.createObjectURL(audioBlob)
                                const audio = new Audio(audioUrl)
                                
                                const play = () => {
                                    audio.play()
                                }

                                resolve({ audioBlob, audioUrl, play })
                            })
                            mediaRecorder.stop()
                        })
                    }
                    resolve({ start, stop })
                })
        })
    }

    start = async () => {
        try {
            const recorder = await this.recordAudio()
            
            recorder.start()
            
            this.setState({ recorder, error: null })
        } catch (err) {
            this.setState({error: err.message})
        }
    }

    stop = async () => {
        try {
            const audio = await this.state.recorder.stop()
            
            const { audioUrl, audioBlob } = audio
            
            this.setState({ audioUrl, error: null })
            
            this.props.onSaveAudio(audioBlob)
        } catch (err) {
            this.setState({error: err.message})
        }
    }

    render() {
        return <div className='container-audio'>
            <div className='header-audio'>
                <h4 className="audio-title">AUDIO DE LA PÀGINA</h4>
                <div className="info-audio">
                    <button className="help-audio-button" onClick={this.handleHelpAudioClick}><i class="fa fa-question"></i></button>
                    <button className='back-audio-button' onClick={this.props.onBackClick}>TORNAR AL LLIBRE</button>
                </div>
            </div>
            <div className="audio-displays">
                <div className="rec-stop">
                    <button className="rec" onClick={this.start}><i className="fa fa-dot-circle-o"></i></button>
                    <button className="stop" onClick={this.stop}><i className="fa fa-stop"></i></button>
                </div>
                <div className="play-sec">
                    <audio ref={(ref) => (this.audioPlayer = ref)} preload='metadata' controls="controls" src={this.state.audioUrl}></audio>
                </div>
            </div>
            {this.state.error && <Error message={this.state.error} />}
        </div>
    }
}

export default Audio

