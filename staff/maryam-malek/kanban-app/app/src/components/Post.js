import React, { Component } from 'react'

class Post extends Component {
    state = { text: this.props.text, colaborator: this.props.colaborator }


    handleChange = event => {
        const text = event.target.value

        this.setState({ text })
    }

    handleSelectChange = event => {
        const colaborator = event.target.value
        
        this.props.onAsignPost(colaborator)
        
        this.setState({ colaborator })
    }

    handleBlur = () => {
        this.props.onUpdatePost(this.props.id, this.state.text)
    }
    
    drag = event => {
        event.dataTransfer.setData("id", event.target.id)
    }

    render() {
        return <article className="postIt" draggable="true" id = {this.props.id} onDragStart={this.drag}>
            <textarea defaultValue={this.state.text} onChange={this.handleChange} onBlur={this.handleBlur} />
            <select value={this.state.colaborator} onChange={this.handleSelectChange}>
               {this.props.colaborators.map(colaborator =><option value={colaborator}>{colaborator}</option>)}
            </select>
            <button className = "postIt__button" onClick={() => this.props.onDeletePost(this.props.id)}><i className="far fa-trash-alt"></i></button>
        </article>
    }
}

export default Post