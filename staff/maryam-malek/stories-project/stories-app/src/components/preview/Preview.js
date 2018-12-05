import React, { Component } from 'react'
import './style.css'
import swal from 'sweetalert2'

class Preview extends Component {

    state = { hasAudio: false, audioURL: '' }

    componentDidMount() {
        const { hasAudio, audioURL } = this.props

        this.setState({ hasAudio, audioURL })

        if (this.state.hasAudio) {
            this.audioPlayer.play()
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps !== this.props) {
            const { hasAudio, audioURL } = nextProps

            this.setState({ hasAudio, audioURL })

            if (this.state.hasAudio) {
                this.audioPlayer.play()
            }
        }
    }

    handleHelpPreviewClick = () => {
        swal({
            text: `AIXÍ ÉS COM QUEDA LA PÀGINA DEL TEU CONTE. SI LA VOLS MODIFICAR APRETA EL LLÀPIS PER DIBUIXAR, LA T PER ESCRIURE I LA RODONA PER GRAVAR I AIXÍ AFEGIR TOT ALLÒ QUE HI VULGUIS POSAR`,
            width: 400,
            padding: '3em',
            confirmButtonText: 'SOM-HI',
            confirmButtonColor: '#0097A7'
        })
    }

    handlePlayClick = () => {
        this.audioPlayer.play()
    }

    handleStopClick = () => {
        this.audioPlayer.currentTime = 0

        this.audioPlayer.pause()
    }

    render() {
        return <div className='container-preview'>
            <div className='header-preview'>
                <h4 className="preview-title">AIXÍ QUEDA LA PÀGINA DEL TEU CONTE</h4>
                <div className="info-preview">
                    <button className='help-preview-button' onClick={this.handleHelpPreviewClick}><i className="fa fa-question icons-preview"></i></button>
                    {/* <button className='back-preview-button' onClick={this.props.onBackClick}>TORNAR AL LLIBRE</button> */}
                </div>
            </div>
            <div className='main-container'>
                {/* <button className="last-button" onClick={this.props.onAudioClick}>GRAVAR LA VEU</button> */}
                <div className="preview-book-page">
                    {this.props.dataURL && <img src={this.props.dataURL} alt="page" />}
                    {!this.props.dataURL && <img src='./images/picture.png' alt="page" />}
                    {this.state.hasAudio && <div className="audio-buttons">
                        <button onClick={this.handlePlayClick} className="audio-play"><i className="fa fa-play-circle icons-preview"></i></button>
                        <button onClick={this.handleStopClick} className="audio-stop"><i className="fa fa-stop icons-preview"></i></button>
                        {/* {this.state.volume && <button onClick={this.handleVolume} className="audio"><i className="fa fa-volume-up"></i></button>}
                    <button onClick={this.handleVolume} className="audio"><i className="fa fa-volume-off"></i></button> */}
                    </div>}
                    {this.state.hasAudio && <div>
                        <audio ref={(ref) => (this.audioPlayer = ref)} autoPlay src={this.state.audioURL}></audio>
                    </div>}
                    <div className="text-area">
                        <span>{this.props.text}</span>
                    </div>
                </div>
                {/* <button className="next-button" onClick={this.props.onDrawClick}>DIBUIXAR</button> */}
            </div>
            {/* <button className="audio"><i className="fa fa-volume-off"></i></button> */}
        </div>
    }

}

export default Preview