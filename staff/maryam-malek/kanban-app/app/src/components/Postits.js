import React, { Component } from 'react'
import logic from '../logic'
import InputForm from './InputForm'
import Navbar from './Navbar'
import Post from './Post'
import Error from './Error'


class Postits extends Component {
    state = { postits: [], asigned: [], todo: [], doing: [], review: [], done: [], error: null, colaborators:[] }

    componentDidMount() {
        try {
            logic.listPostits()
                .then(postits => this.setState({ postits, error: null }))
                .then(() => logic.listAssignedPostits())
                .then(asigned => this.setState({ asigned, error: null }))
                .then(() => logic.listColaborators()) 
                .then(colaborators => this.setState({ colaborators, error: null }))
        } catch ({ message }) {
            this.setState({ error: message })
        }
    }

    handleSubmit = text => {
        try {
            logic.addPostit(text)
                .then(() => logic.listPostits())
                .then(postits => this.setState({ postits, error: null }))
        } catch ({ message }) {
            this.setState({ error: message })
        }
    }

    handleSubmitColaborators = text => {
        try {
            logic.addColaborator(text)
                .then(() => logic.listColaborators())
                .then(colaborators => this.setState({ colaborators, error: null }))
        } catch ({ message }) {
            this.setState({ error: message })
        }
    }

    handleRemovePostit = id => {
        try {
            return logic.removePostit(id)
                .then(() => logic.listPostits())
                .then(postits => this.setState({ postits, error: null }))
        } catch ({ message }) {
            this.setState({ error: message })
        }
    }

    handleRemoveAsignedPostit = id => {
        try {
            return logic.removeAsigned(id)
                .then(() => logic.listAssignedPostits())
                .then(asigned => this.setState({ asigned, error: null }))
        } catch ({ message }) {
            this.setState({ error: message })
        }
    }

    handleAsignPost = (colaborator) => {
        try {
            return logic.addColaborator(colaborator)
                .then(() => this.setState({ error: null }))
        } catch ({ message }) {
            this.setState({ error: message })
        }
    }

    handleAsignPost = (id, username) => {
        try {
            return logic.asignPostit(id, username)
                .then(() => this.setState({ error: null }))
        } catch ({ message }) {
            this.setState({ error: message })
        }
    }

    handleModifyPostit = (id, text) => {
        try {
            return logic.modifyPostit(id, text)
                .then(() => logic.listPostits())
                .then(postits => this.setState({ postits, error: null }))
                .then(() => logic.listAssignedPostits())
                .then(asigned => this.setState({ asigned, error: null }))
        } catch ({ message }) {
            this.setState({ error: message })
        }
    }

    allowDrop = event => {
        event.preventDefault()
    }

    drop = (event, status) => {
        event.preventDefault()
        const id = event.dataTransfer.getData("id")
        try {
            logic.modifyStatus(id, status)
                .then(() => logic.listPostits())
                .then(postits => this.setState({ postits, error: null }))
                .then(() => logic.listAssignedPostits())
                .then(asigned => this.setState({ asigned, error: null }))
        } catch ({ message }) {
            this.setState({ error: message })
        }

    }

    render() {
        return <div className="home">
            <Navbar />
            <InputForm colaborators={true} onSubmit={this.handleSubmitColaborators} />
            <InputForm onSubmit={this.handleSubmit} />
            {this.state.error && <Error className="postit-error" message={this.state.error} />}
            <div className="postit-board">
                <section className="postit-col postit-col--todo" onDragOver={this.allowDrop} onDrop={(event) => this.drop(event, 'TODO')}>
                    <h3>TO DO</h3>
                    {this.state.postits.filter(postit => postit.status === 'TODO').map(postit => <Post asignedColab={postit.asigned} key={postit.id} colaborators={this.state.colaborators} text={postit.text} status={postit.status} id={postit.id} onDeletePost={this.handleRemovePostit} onUpdatePost={this.handleModifyPostit} onAsignPost={this.handleAsignPost} onUpdateColaborator={this.handleUpdateColaborator} />)}
                    {this.state.asigned.filter(postit => postit.status === 'TODO').map(postit => <Post owner={postit.user} asigned={true} key={postit.id} text={postit.text} status={postit.status} id={postit.id} onDeleteAsignedPost={this.handleRemoveAsignedPostit} onUpdatePost={this.handleModifyPostit} />)}

                </section>
                <section className="postit-col postit-col--doing" onDragOver={this.allowDrop} onDrop={(event) => this.drop(event, 'DOING')}>
                    <h3>DOING</h3>
                    {this.state.postits.filter(postit => postit.status === 'DOING').map(postit => <Post asignedColab={postit.asigned} key={postit.id} colaborators={this.state.colaborators} text={postit.text} status={postit.status} id={postit.id} onDeletePost={this.handleRemovePostit} onUpdatePost={this.handleModifyPostit} onAsignPost={this.handleAsignPost} onUpdateColaborator={this.handleUpdateColaborator} />)}
                    {this.state.asigned.filter(postit => postit.status === 'DOING').map(postit => <Post owner={postit.user} asigned={true} key={postit.id} text={postit.text} status={postit.status} id={postit.id} onDeleteAsignedPost={this.handleRemoveAsignedPostit} onUpdatePost={this.handleModifyPostit} />)}                
                </section>
                <section className="postit-col postit-col--review" onDragOver={this.allowDrop} onDrop={(event) => this.drop(event, 'REVIEW')}>
                    <h3>REVIEW</h3>
                    {this.state.postits.filter(postit => postit.status === 'REVIEW').map(postit => <Post asignedColab={postit.asigned} key={postit.id} colaborators={this.state.colaborators} text={postit.text} status={postit.status} id={postit.id} onDeletePost={this.handleRemovePostit} onUpdatePost={this.handleModifyPostit} onAsignPost={this.handleAsignPost} onUpdateColaborator={this.handleUpdateColaborator} />)}
                    {this.state.asigned.filter(postit => postit.status === 'REVIEW').map(postit => <Post owner={postit.user} asigned={true} key={postit.id} text={postit.text} status={postit.status} id={postit.id} onDeleteAsignedPost={this.handleRemoveAsignedPostit} onUpdatePost={this.handleModifyPostit} />)}                
                </section>
                <section className="postit-col postit-col--done" onDragOver={this.allowDrop} onDrop={(event) => this.drop(event, 'DONE')}>
                    <h3>DONE</h3>
                    {this.state.postits.filter(postit => postit.status === 'DONE').map(postit => <Post asignedColab={postit.asigned} key={postit.id} colaborators={this.state.colaborators} text={postit.text} status={postit.status} id={postit.id} onDeletePost={this.handleRemovePostit} onUpdatePost={this.handleModifyPostit} onAsignPost={this.handleAsignPost} onUpdateColaborator={this.handleUpdateColaborator} />)}
                    {this.state.asigned.filter(postit => postit.status === 'DONE').map(postit => <Post owner={postit.user} asigned={true} key={postit.id} text={postit.text} status={postit.status} id={postit.id} onDeleteAsignedPost={this.handleRemoveAsignedPostit} onUpdatePost={this.handleModifyPostit} />)}                
                </section>
            </div>
        </div>
    }
}

export default Postits
