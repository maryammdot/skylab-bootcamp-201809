import React, {Component} from 'react'

class CreateStory extends Component {
    state = {}



    render() {
        return <div>
            <div className='container'>
            <h1>CREA EL TEU CONTE</h1>
            <img className="book-cover" src="../images/chicken.png" alt="chicken - book cover"></img>
            <form className="book-details" onSubmit={this.handleSubmit}>
                <input type="text" placeholder="Title" onChange={this.handleUsernameChange}></input>
                <input type="text" disabled placeholder="Author" onChange={this.handleUsernameChange}></input>
                <input type="text" placeholder="Audio language" onChange={this.handleUsernameChange}></input>
                <input type="text" placeholder="Text language" onChange={this.handleUsernameChange}></input>
                <button type="submit">GUARDA</button>
            </form>
            <h3>PÀGINES</h3>
            <ul className="pages-section">
                <div className="page">
                    <img className="page-img" src="../images/bat.png" alt="page image"></img>
                    <span>1</span>
                </div>
            </ul>
        </div>
        </div>   
    }

}

export default CreateStory