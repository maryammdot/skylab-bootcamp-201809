import React, { Component } from 'react'
import './style.css'
import swal from 'sweetalert2'
import Error from '../error/Error'

class Audio extends Component {

    state = { text: '', error: null, canListen: false, secs: 0 }

    componentDidMount() {
        if (this.props.audio) {
            this.setState({ audio: this.props.audio, error: null })
        }
    }

    handleHelpAudioClick = () => {
        swal({
            text: `APRETA EL BOTÓ RODÓ PER COMENÇAR A GRAVAR I EL QUADRAT PER PARAR. APRETA EL TRIANGLE QUE SORTIRÀ PER ESCOLTAR EL QUE HAS GRAVAT. SI NO T'AGRADA, TORNA-HO A GRAVAR!`,
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

            // this.beginCounter()

            this.setState({ recorder, error: null, canListen: false, clear: false, secs: 0 })
        } catch (err) {
            this.setState({ error: err.message })
        }
    }

    stop = async () => {
        try {
            if (this.state.recorder) {
                const audio = await this.state.recorder.stop()

                const { audioUrl, audioBlob } = audio

                this.setState({ audioUrl, error: null, canListen: true, clear: true })

                this.props.onSaveAudio(audioBlob)
            }
        } catch (err) {
            if (err.name === 'InvalidStateError') {
                this.setState({ error: null })
            } else {
                this.setState({ error: err.message })
            }
        }
    }

    // beginCounter = () => {
    //     let counter = setInterval(function () {
    //         let secs = this.state.secs

    //         secs++

    //         this.setState({ secs })
    //     }, 1000)

    //     if (this.state.clear) {
    //         clearInterval(counter)
    //     }
    // }

    render() {
        return <div className='container-audio'>
            <div className='header-audio'>
                <h4 className="audio-title">AUDIO DE LA PÀGINA</h4>
                <div className="info-audio">
                    <button className="help-audio-button" onClick={this.handleHelpAudioClick}><i class="fa fa-question"></i></button>
                    <button className='back-audio-button' onClick={this.props.onBackClick}>TORNAR AL LLIBRE</button>
                </div>
            </div>
            <div>
                <button className="last-button" onClick={this.props.onTextClick}>ESCRIURE EL TEXT</button>
                <div className="audio-displays">
                    <div className="rec-stop">
                        <button className="rec" onClick={this.start}><i className="fa fa-dot-circle-o"></i></button>
                        <button className="stop" onClick={this.stop}><i className="fa fa-stop"></i></button>
                    </div>
                    {!!this.state.clear && <h3>{this.state.secs}</h3>}
                    {this.state.canListen && <div className="play-sec">
                        <audio ref={(ref) => (this.audioPlayer = ref)} preload='metadata' controls="controls" src={this.state.audioUrl}></audio>
                    </div>}
                </div>
                <button className="next-button" onClick={this.props.onPreviewClick}>VEURE EL RESULTAT</button>
            </div>
            {this.state.error && <Error message={this.state.error} />}
        </div>
    }
}

export default Audio

