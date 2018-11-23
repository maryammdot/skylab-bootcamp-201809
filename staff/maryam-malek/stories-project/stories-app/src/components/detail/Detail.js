import React, { Component } from 'react'
import './style.css'

class Detail extends Component {

    handleDetailClick = () => {
        
        this.props.onDetailClick(this.props.id)
    }

    render() {
        return <div className='container-detail'>
            <button onClick={this.handleDetailClick}><div className='detail'>
                <img className='detail-img' src={this.props.img} alt="detail image"></img>
                <span className='detail-text'>{this.props.text}</span>
                {/* <div className='buttons-bar'>
                    <button></button>
                </div> */}
            </div></button>
        </div>
    }

}

export default Detail