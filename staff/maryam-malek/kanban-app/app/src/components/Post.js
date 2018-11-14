import React, { Component } from 'react'
import logic from '../logic'

class Post extends Component {
    state = { text: this.props.text, colaborator: false, owner: false}

    componentDidMount() {
        try {
            
            if(this.props.asignedColab) {
                
                logic.getUsername(this.props.asignedColab)
                .then(colaborator => this.setState({ colaborator, error: null }))
            }
            if(this.props.asigned) {
                logic.getUsername(this.props.owner)
                .then(owner => this.setState({ owner, error: null }))
            }
        } catch ({ message }) {
            this.setState({ error: message })
        }
    }

   
    handleChange = event => {
        const text = event.target.value

        this.setState({ text })
    }

    handleSelectChange = event => {
        const colaborator = event.target.value

        this.props.onAsignPost(this.props.id, colaborator)

        this.setState({ colaborator })
    }

    handleBlur = () => {
        this.props.onUpdatePost(this.props.id, this.state.text)
    }

    drag = event => {
        event.dataTransfer.setData("id", event.target.id)
    }

    render() {
        return <div>
        {!this.props.asigned && <article className="postIt" draggable="true" id={this.props.id} onDragStart={this.drag}>
            <textarea defaultValue={this.state.text} onChange={this.handleChange} onBlur={this.handleBlur} />
            {!this.state.colaborator && <select onChange={this.handleSelectChange}>
            <option value={this.state.colaborator}>{'colaborators'}</option>
                {this.props.colaborators.map(colaborator => <option value={colaborator}>{colaborator}</option>)}
            </select>}
            <button className="postIt__button" onClick={() => this.props.onDeletePost(this.props.id)}><i className="far fa-trash-alt"></i></button>
            {this.state.colaborator && <h4 className="colaborator">{this.state.colaborator}</h4>}
        </article>}
        {this.props.asigned && <article className="postIt postIt--asigned" draggable="true" id={this.props.id} onDragStart={this.drag}>
            <textarea defaultValue={this.state.text} onChange={this.handleChange} onBlur={this.handleBlur} />
            <button className=" postIt__button" onClick={() => this.props.onDeleteAsignedPost(this.props.id)}><i className="far fa-trash-alt"></i></button>
            <h4 className="colaborator">{this.state.owner}</h4>
        </article>}
        </div>
    }
}
    
export default Post