import React, { Component } from 'react'
import './style.css'
import swal from 'sweetalert2'

class Preview extends Component {

    handleHelpPreviewClick = () => {
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
        return <div>
            <h4 className="preview-title">PREVIEW PAGE</h4>
            <div className="info">
                <button className="help" onClick={this.handleHelpPreviewClick}>?</button>
                <button className="save" onClick={this.props.onBackClick}>TORNAR AL LLIBRE</button>
            </div>
            <div className="preview-container">
                <img src={this.props.dataURL} alt="page 1 image" />
                <div className="audio-buttons">
                    <button className="audio"><i className="fa fa-play-circle"></i></button>
                    <button className="audio"><i className="fa fa-volume-up"></i></button>
                </div>
                <div className="text-area">
                    <span>{this.props.text}</span>
                </div>
            </div>
            {/* <button className="audio"><i className="fa fa-volume-off"></i></button> */}
        </div>
    }

}

export default Preview