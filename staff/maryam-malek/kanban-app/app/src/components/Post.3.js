import React, { Component } from 'react'

class Post extends Component {
    state = { text: this.props.text, status: this.props.status }


    handleChange = event => {
        const text = event.target.value

        this.setState({ text })
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
            <button className = "postIt__button" onClick={() => this.props.onDeletePost(this.props.id)}><i className="far fa-trash-alt"></i></button>
            {/* <button className = "postIt__button" onClick={() => this.props.onAsignPost(this.props.id)}><i class="fas fa-user-friends"></i></button> */}
        </article>
    }
}

export default Post