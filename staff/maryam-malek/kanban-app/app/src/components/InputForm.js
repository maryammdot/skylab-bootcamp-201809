import React, { Component } from 'react'

class InputForm extends Component {
    state = { text: '' }

    handleInput = event => {
        const text = event.target.value

        this.setState({ text })
    }

    handleSubmit = event => {
        event.preventDefault()

        this.props.onSubmit(this.state.text)

        this.setState({ text: '' })
    }

    render() {
        return <div>
            {!this.props.colaborators && <form className="form" onSubmit={this.handleSubmit}>
            <input value={this.state.text} placeholder="Write text here..." onChange={this.handleInput} />

            <button type="submit"><i className="fas fa-plus"></i></button>
        </form>}
        {this.props.colaborators && <form className="form" onSubmit={this.handleSubmit}>
            <input value={this.state.text} placeholder="Colaborator username" onChange={this.handleInput} />

            <button type="submit"><i className="fas fa-plus"></i></button>
        </form>}
        </div>
    }
}

export default InputForm