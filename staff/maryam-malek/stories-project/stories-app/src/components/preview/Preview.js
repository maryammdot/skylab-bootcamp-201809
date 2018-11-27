import React, { Component } from 'react'
import './style.css'
import swal from 'sweetalert2'

class Preview extends Component {

    state={hasAudio: false, audioURL: ''}

    componentDidMount(){
        
        const {hasAudio, audioURL} = this.props
        
        this.setState({hasAudio, audioURL})
        if(this.state.hasAudio) {
            this.audioPlayer.play()
        }
    }

    componentWillReceiveProps(nextProps){
        if(nextProps !== this.props) {
            const {hasAudio, audioURL} = nextProps
            
            this.setState({hasAudio, audioURL})
        
            if(this.state.hasAudio) {
                this.audioPlayer.play()
            }
        }
    }
    
    handleHelpPreviewClick = () => {
        swal({
            text: `AIXÍ ÉS COM QUEDA LA PÀGINA DEL TEU CONTE. SI LA VOLS MODIFICAR APRETA EL LLÀPIS PER DIBUIXAR, LA T PER ESCRIURE I EL TRIANGLE PER GRAVAR I AIXÍ AFEGIR TOT ALLÒ QUE HI VULGUIS POSAR`,
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
                    <button className='help-preview-button' onClick={this.handleHelpPreviewClick}><i class="fa fa-question"></i></button>
                    <button className='back-preview-button' onClick={this.props.onBackClick}>TORNAR AL LLIBRE</button>
                </div>
            </div>
            <div className="preview-book-page">
                {this.props.dataURL && <img src={this.props.dataURL} alt="page image" />}
                {!this.props.dataURL && <img src='./images/picture.png' alt="page image" />}
                <div className="audio-buttons">
                    <button onClick={this.handlePlayClick} className="audio"><i className="fa fa-play-circle"></i></button>
                    <button onClick={this.handleStopClick} className="audio"><i className="fa fa-stop"></i></button>
                    {/* {this.state.volume && <button onClick={this.handleVolume} className="audio"><i className="fa fa-volume-up"></i></button>}
                    <button onClick={this.handleVolume} className="audio"><i className="fa fa-volume-off"></i></button> */}
                </div>
                {this.state.hasAudio && <div>
                    <audio ref={(ref) => (this.audioPlayer = ref)} src={this.state.audioURL}></audio>
                </div>}
                <div className="text-area">
                    <span>{this.props.text}</span>
                </div>
            </div>
            {/* <button className="audio"><i className="fa fa-volume-off"></i></button> */}
        </div>
    }

}

export default Preview