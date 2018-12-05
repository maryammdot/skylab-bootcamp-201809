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
            <button onClick={this.handleDetailClick}><div className={this.props.pages? 'detail detail_pages':'detail'}>
                {!this.props.pages && <span className='detail-text__top'>{this.props.text}</span>}
                <img className='detail-img' src={this.props.img} alt="detail"></img>
                {!!this.props.pages && <span className='detail-text__bottom'>{this.props.text}</span>}
            </div></button>
            {this.props.pages && <div className='buttons-bar'>
                <button data-tip="ESBORRA LA PÀGINA" className="delete" onClick={this.handleRemoveClick}><i className="fa fa-trash-o"></i></button>
                <ReactTooltip effect='solid' />
            </div>}
            {this.props.edit && <div className='buttons-bar'>
                <button data-tip="EDITA EL CONTE" className="edit" onClick={this.handleEditClick}><i className="fa fa-edit"></i></button>
                <ReactTooltip effect='solid' />
            </div>}
        </div>
    }

}

export default Detail