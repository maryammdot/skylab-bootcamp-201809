import React, { Component } from 'react'

class Post extends Component {
    state = { text: this.props.text, status: this.props.status }


    handleChange = event => {
        const text = event.target.value

        this.setState({ text })
    }

    handleSelectChange = event => {
        const status = event.target.value
        
        this.props.onUpdateStatus(this.props.id, status)
        
        this.setState({ status })

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
            <select value={this.state.status} onChange={this.handleSelectChange}>
                <option value="TODO">TO DO</option>
                <option value="DOING">DOING</option>
                <option value="REVIEW">REVIEW</option>
                <option value="DONE">DONE</option>
            </select>
            <button className = "postIt__button" onClick={() => this.props.onDeletePost(this.props.id)}><i className="far fa-trash-alt"></i></button>
        </article>
    }
}

export default Post