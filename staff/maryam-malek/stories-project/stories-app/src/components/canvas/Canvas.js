
import React, { Component } from 'react'
import swal from 'sweetalert2'
import './style.css'
import Error from '../error/Error'
import ReactTooltip from 'react-tooltip'

class Canvas extends Component {

    state = { error: null, isPainting: false, width: 4, userStrokeStyle: '#EE92C2', line: [], storage: [], last: [], prevPos: { offsetX: 0, offsetY: 0 }, width: 4 }

    componentDidMount() {
        if (this.props.cover) {
            this.canvas.width = 250

            this.canvas.height = 350
        } else {
            this.canvas.width = 500

            this.canvas.height = 300
        }

        this.ctx = this.canvas.getContext('2d')
        this.ctx.lineJoin = 'round'
        this.ctx.lineCap = 'round'
        this.ctx.lineWidth = 4

        if (this.props.vectors.length !== 0) {

            try {
                this.paintComplete(this.props.vectors)

                this.setState({ line: [], storage: this.props.vectors, error: null })
            } catch (err) {
                this.setState({ error: err.message })
            }
        }
    }

    handleColor1 = () => {
        this.setState({ userStrokeStyle: '#0097A7', error: null })
    }

    handleColor2 = () => {
        this.setState({ userStrokeStyle: '#CDDC39', error: null })
    }

    handleColor3 = () => {
        this.setState({ userStrokeStyle: '#EE92C2', error: null })
    }

    handleWidth1 = () => {
        this.setState({ width: 1, error: null })
    }

    handleWidth2 = () => {
        this.setState({ width: 4, error: null })
    }

    handleWidth3 = () => {
        this.setState({ width: 8, error: null })
    }

    handleHelpDrawClick = () => {
        swal({
            text: this.props.cover ? 'ARROSSEGANT EL DIT O EL RATOLÍ DIBUIXA LA PORTADA DEL TEU CONTE. APRETA A SOBRE DE LES RODONES DE COLOR PER A TRIAR EL COLOR I A SOBRE DE LES NEGRES PER A TRIAR EL GRUIX DE LA LÍNIA. DESFÉS I REFÉS EL TEU DIBUIX APRETANT SOBRE LES FLETXES' : 'ARROSSEGANT EL DIT O EL RATOLÍ DIBUIXA LA PÀGINA DEL TEU CONTE. APRETA A SOBRE DE LES RODONES DE COLOR PER A TRIAR EL COLOR I A SOBRE DE LES NEGRES PER A TRIAR EL GRUIX DE LA LÍNIA. DESFÉS I REFÉS EL TEU DIBUIX APRETANT SOBRE LES FLETXES',
            width: 300,
            padding: '3em',
            confirmButtonText: 'SOM-HI',
            confirmButtonColor: '#0097A7'
        })
    }

    handleCloseDrawClick = () => {
        this.props.onCloseDrawClick()
    }

    handleUndoClick = () => {
        if (this.state.storage.length > 0) {

            let stg = this.state.storage

            const lastLine = stg.pop()

            let last = this.state.last

            last.push(lastLine)

            this.setState({ last, storage: stg, error: null })

            try {
                this.clear()

                this.paintComplete(this.state.storage)

                this.setState({ error: null })
            } catch (err) {
                this.setState({ error: err.message })
            }

            const dataURL = this.canvas.toDataURL()

            this.setState({ dataURL, error: null })

            this.props.onChange(dataURL, this.state.storage)
        }
    }

    handleRedoClick = () => {
        if (this.state.last.length > 0) {

            this.state.last[this.state.last.length - 1].forEach(el => {
                try {
                    this.paint(el.start, el.stop, el.strokeStyle, el.width)

                    this.setState({ error: null })
                } catch (err) {
                    this.setState({ error: err.message })
                }
            })

            let stg = this.state.storage

            let last = this.state.last

            let lastLine = last.pop()

            stg.push(lastLine)

            const dataURL = this.canvas.toDataURL()

            this.setState({ last, storage: stg, error: null })

            this.props.onChange(dataURL, this.state.storage)
        }
    }

    onMouseDown = ({ nativeEvent }) => {
        const length = this.state.line.length

        const { offsetX, offsetY } = nativeEvent

        this.setState({ length, isPainting: true, prevPos: { offsetX, offsetY }, error: null })
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    onMouseMove = ({ nativeEvent }) => {
        if (this.state.isPainting) {
            const { offsetX, offsetY } = nativeEvent
            const offSetData = { offsetX, offsetY }

            const positionData = {
                start: { ...this.state.prevPos },
                stop: { ...offSetData },
                strokeStyle: this.state.userStrokeStyle,
                width: this.state.width
            }

            let line = this.state.line.concat(positionData)

            this.setState({ line, error: null })

            try {
                this.paint(this.state.prevPos, offSetData, this.state.userStrokeStyle, this.state.width)

                this.setState({ error: null })
            } catch (err) {
                this.setState({ error: err.message })
            }
        }
    }

    onMouseUp = ({ nativeEvent }) => {
        if (this.state.isPainting) {

            this.setState({ isPainting: false, error: null })

            try {
                this.setState({ error: null })

                this.sendPaintData()
            } catch (err) {
                this.setState({ error: err.message })
            }
        }
    }

    sendPaintData = () => {
        let stg = this.state.storage

        stg.push(this.state.line)

        this.setState({ storage: stg, line: [], last: [], error: null })


    }

    endPaintEvent = () => {
        if (this.state.isPainting) {

            const dataURL = this.canvas.toDataURL()

            this.setState({ dataURL, isPainting: false, error: null })

            try {
                this.setState({ error: null })

                this.sendPaintData()
            } catch (err) {
                this.setState({ error: err.message })
            }

            this.props.onChange(dataURL, this.state.storage)
        }
    }

    paint(prevPos, currPos, strokeStyle, width) {
        const { offsetX, offsetY } = currPos
        const { offsetX: x, offsetY: y } = prevPos

        this.ctx.beginPath()
        this.ctx.strokeStyle = strokeStyle
        this.ctx.lineWidth = width

        // Move the the prevPosition of the mouse
        this.ctx.moveTo(x, y)

        // Draw a line to the current position of the mouse
        this.ctx.lineTo(offsetX, offsetY)

        // Visualize the line using the strokeStyle
        this.ctx.stroke()

        this.setState({ prevPos: { offsetX, offsetY }, error: null })
    }

    paintComplete = (vectors) => {

        vectors.forEach(arr => {

            arr.forEach(el => {
                try {
                    this.setState({ error: null })

                    this.paint(el.start, el.stop, el.strokeStyle, el.width)
                } catch (err) {
                    this.setState({ error: err.message })
                }
            })
        })
    }

    render() {
        return <div className='container-canvas'>
            <div className='header-canvas'>
                {!this.props.cover && <h4 className="draw-title">DIBUIXA LA PÀGINA</h4>}
                <div className="info-canvas">
                    {!this.props.cover && <button className='help-canvas-button' onClick={this.handleHelpDrawClick}><i class="fa fa-question icons-canvas"></i></button>}
                    {this.props.cover && <div className='canvas-cover-buttons'>
                        <button className='help-canvas-button' onClick={this.handleHelpDrawClick}><i class="fa fa-question icons-canvas"></i></button>
                        {this.props.cover && <button className='close-canvas-button' onClick={this.handleCloseDrawClick}><i class="fa fa-check-circle-o icons-canvas"></i></button>}
                    </div>}
                </div>
            </div>
            <div>
                <div className='canvas-area'>
                    <div>
                        <canvas className='canvas'
                            id="page-draw"
                            ref={(ref) => (this.canvas = ref)}
                            onMouseDown={this.onMouseDown}
                            onMouseLeave={this.endPaintEvent}
                            onMouseUp={this.endPaintEvent}
                            onMouseMove={this.onMouseMove}
                        />
                    </div>
                    <div className="utils-canvas">
                        <div className='do-container-buttons'>
                            <button className='undo-canvas-button' data-tip="DESFER" onClick={this.handleUndoClick}><i class="fa fa-reply icons-canvas"></i></button>
                            <button className='redo-canvas-button' data-tip="REFER" onClick={this.handleRedoClick}><i class="fa fa-share icons-canvas"></i></button>
                        </div>
                        <div className='color-container-buttons' data-tip="TRIAR EL COLOR">
                            <button className='color1-canvas-button' onClick={this.handleColor1}></button>
                            <button className='color2-canvas-button' onClick={this.handleColor2}></button>
                            <button className='color3-canvas-button' onClick={this.handleColor3}></button></div>
                        <div className='width-container-buttons' data-tip="TRIAR EL GRUIX DEL LLAPIS">
                            <button className='width1-canvas-button' onClick={this.handleWidth1}></button>
                            <button className='width2-canvas-button' onClick={this.handleWidth2}></button>
                            <button className='width3-canvas-button' onClick={this.handleWidth3}></button></div>
                    </div>
                </div>
            </div>
            {this.state.error && <Error message={this.state.error} />}
            <ReactTooltip effect='solid' />
        </div>
    }
}
export default Canvas