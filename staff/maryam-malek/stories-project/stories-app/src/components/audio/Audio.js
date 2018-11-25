import React, { Component } from 'react'
import './style.css'
import swal from 'sweetalert2'

class Audio extends Component {

    state = { text: '' }

    componentDidMount() {
        if (this.props.audio) {
            this.setState({ audio: this.props.audio })
        }
    }

    handleHelpAudioClick = () => {
        swal({
            title: 'ARROSSEGANT EL DIT DIBUIXA LA PÀGINA DEL TEU CONTE',
            width: 300,
            padding: '3em',
            background: '#fff url(/images/trees.png)',
            confirmButtonText: 'ESTIC PREPARADA',
            confirmButtonColor: '#0097A7'
        })
    }


    render() {
        return <div className='container-audio'>
            <div className='header-audio'>
            <h4 className="audio-title">AUDIO DE LA PÀGINA</h4>
            <div className="info-audio">
                <button className="help-audio-button" onClick={this.handleHelpAudioClick}>?</button>
                <button className='back-audio-button' onClick={this.props.onBackClick}>TORNAR AL LLIBRE</button>
            </div>
            </div>
            <div className="audio-displays">
                <div className="rec-stop">
                    <button className="rec"><i className="fa fa-dot-circle-o"></i></button>
                    <button><i className="fa fa-stop"></i></button>
                </div>
                <div className="play-sec">
                    <button><i className="fa fa-play-circle"></i></button>
                    <span> 10 SECONDS</span>
                </div>
            </div>
        </div>
    }

}

export default Audio

