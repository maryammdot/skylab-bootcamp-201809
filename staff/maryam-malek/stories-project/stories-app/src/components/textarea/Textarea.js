import React, { Component } from 'react'
import './style.css'
import swal from 'sweetalert2'
import Error from '../error/Error'

class Textarea extends Component {

    state = { text: this.props.text, error: null }

    componentDidMount() {
        if (this.props.text) {
            this.setState({ text: this.props.text, error: null })
        }
    }

    handleHelpTextClick = () => {
        swal({
            title: 'ESCRIU EL TEXT QUE VOLS QUE APAREGUI A LA PÀGINA DEL TEU CONTE',
            width: 300,
            padding: '3em',
            background: '#fff url(/images/trees.png)',
            confirmButtonText: 'SOM-HI',
            confirmButtonColor: '#0097A7'
        })
    }

    handleChangeText = event => {
        const text = event.target.value

        this.setState({ text, error: null })
    }

    handleOnBlur = event => {
        event.preventDefault()

        this.props.onSaveText(this.state.text)
    }

    render() {
        return <div className='container-text'>
            <div className='header-text'>
                <div>
                    <h4>TEXT DE LA PÀGINA</h4>
                </div>
                <div className='info-text'>
                    <button className='help-text-button' onClick={this.handleHelpTextClick}><i class="fa fa-question icon-question-textarea"></i></button>
                </div>
            </div>
            <div>
                <div className='text-area-space'>
                    <textarea required className='textarea-page' name='text' id='text-page' maxLength='100' placeholder='ESCRIU AQUÍ EL TEXT DE LA PÀGINA...' defaultValue={this.state.text} onChange={this.handleChangeText} onBlur={this.handleOnBlur} cols='20' rows='10' ></textarea>
                </div>
            </div>
            {this.state.error && <Error message={this.state.error} />}
        </div>
    }
}

export default Textarea