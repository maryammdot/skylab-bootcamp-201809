import React, { Component } from 'react'
import './style.css'


class Detail extends Component {

    handleDetailClick = () => {
        
        this.props.onDetailClick(this.props.id)
    }

    handleRemoveClick = () => {
        this.props.onRemoveClick(this.props.id)
    }


    render() {
        return <div className='container-detail'>
            <button onClick={this.handleDetailClick}><div className='detail'>
                <img className='detail-img' src={this.props.img} alt="detail image"></img>
                <span className='detail-text'>{this.props.text}</span>
            </div></button>
                { this.props.pages &&<div className='buttons-bar'>
                    <button className="delete" onClick={this.handleRemoveClick}>X</button>
                </div>}
        </div>
    }

}

export default Detail