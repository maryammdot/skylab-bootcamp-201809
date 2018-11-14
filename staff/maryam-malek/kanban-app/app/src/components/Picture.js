import React, { Component } from 'react'

class Picture extends Component {

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
            <img></img>
            <form className="form" onSubmit={this.handleSubmit}>
                <input type="file" id="myFileField" name="myFile" />
                <button type="submit">Change picture</button>
            </form>
        </div>
    }
}

export default Picture