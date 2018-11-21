import React, { Component } from 'react'
// import './style.css'

class Detail extends Component {

    render() {
        return <div>
            <div className="detail">
                <img className="detail-img" src={this.props.img} alt="detail cover"></img>
                <span>{this.props.text}</span>
            </div>
        </div>
    }

}

export default Detail