import React, { Component } from 'react'
import './style.css'
import ReactTooltip from 'react-tooltip'


class Detail extends Component {

    handleDetailClick = () => {
        
        this.props.onDetailClick(this.props.id)
    }

    handleEditClick = () => {
        
        this.props.onEditClick(this.props.id)
    }

    handleRemoveClick = () => {
        this.props.onRemoveClick(this.props.id)
    }


    render() {
        return <div className='container-detail'>
            <button onClick={this.handleDetailClick}><div className='detail'>
                <img className='detail-img' src={this.props.img} alt="detail"></img>
                <span className='detail-text'>{this.props.text}</span>
            </div></button>
                { this.props.pages && <div className='buttons-bar'>
                    <button data-tip="hello world" className="delete" onClick={this.handleRemoveClick}><i className="fa fa-trash-o"></i></button>
                    <ReactTooltip />
                </div>}
                {this.props.edit && <div className='buttons-bar'>
                    <button data-tip="hello world" className="edit" onClick={this.handleEditClick}><i className="fa fa-edit"></i></button>
                    <ReactTooltip />
                </div>}
        </div>
    }

}

export default Detail