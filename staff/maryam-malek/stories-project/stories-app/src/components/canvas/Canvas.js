
import React, { Component } from 'react'
import swal from 'sweetalert2'
import './style.css'

class Canvas extends Component {

    state = { isPainting: false, width: 4, userStrokeStyle: '#EE92C2', line: [], storage: [], last: [], prevPos: { offsetX: 0, offsetY: 0 }, width: 4 }

    componentDidMount() {
        // Here we set up the properties of the canvas element. 
        if (this.props.cover) {
            this.canvas.width = 150
            this.canvas.height = 250

        } else {

            this.canvas.width = 500
            this.canvas.height = 300
        }
        this.ctx = this.canvas.getContext('2d')
        this.ctx.lineJoin = 'round'
        this.ctx.lineCap = 'round'
        this.ctx.lineWidth = 4
        if (this.props.vectors.length !== 0) {

            this.setState({ line: [], storage: this.props.vectors })
            this.paintComplete(this.props.vectors)
        }
    }

    handleColor1 = () => {
        this.setState({ userStrokeStyle: '#0097A7' })
    }

    handleColor2 = () => {
        this.setState({ userStrokeStyle: '#CDDC39' })
    }

    handleColor3 = () => {
        this.setState({ userStrokeStyle: '#EE92C2' })
    }

    handleWidth1 = () => {
        this.setState({ width: 1 })
    }

    handleWidth2 = () => {
        this.setState({ width: 4 })
    }

    handleWidth3 = () => {
        this.setState({ width: 8 })
    }

    handleHelpDrawClick = () => {
        swal({
            title: this.props.cover ? 'ARROSSEGANT EL DIT O EL RATOLÍ DIBUIXA LA PORTADA DEL TEU CONTE' : 'ARROSSEGANT EL DIT O EL RATOLÍ DIBUIXA LA PÀGINA DEL TEU CONTE',
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

            this.setState({ last, storage: stg })

            this.clear()

            this.paintComplete(this.state.storage)

            const dataURL = this.canvas.toDataURL()

            this.setState({ dataURL })

            this.props.onChange(dataURL, this.state.storage)
        }
    }

    handleRedoClick = () => {

        if (this.state.last.length > 0) {

            this.state.last[this.state.last.length - 1].forEach(el => {

                this.paint(el.start, el.stop, el.strokeStyle, el.width)
            })

            let stg = this.state.storage

            let last = this.state.last

            let lastLine = last.pop()

            stg.push(lastLine)

            const dataURL = this.canvas.toDataURL()
            
            this.setState({ last, storage: stg })

            this.props.onChange(dataURL, this.state.storage, dataURL)
        }
    }

    onMouseDown = ({ nativeEvent }) => {
        const length = this.state.line.length
        const { offsetX, offsetY } = nativeEvent
        this.setState({ length, isPainting: true, prevPos: { offsetX, offsetY } })
    }

    // onTouchStart = ({ nativeEvent }) => {
    //     const { offsetX, offsetY } = nativeEvent
    //     this.state.isPainting = true
    //     this.state.prevPos = { offsetX, offsetY }
    // }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    onMouseMove = ({ nativeEvent }) => {
        if (this.state.isPainting) {
            const { offsetX, offsetY } = nativeEvent
            const offSetData = { offsetX, offsetY }
            // Set the start and stop position of the paint event.
            const positionData = {
                start: { ...this.state.prevPos },
                stop: { ...offSetData },
                strokeStyle: this.state.userStrokeStyle,
                width: this.state.width
            }
            // Add the position to the line array
            let line = this.state.line.concat(positionData)

            this.setState({ line })

            this.paint(this.state.prevPos, offSetData, this.state.userStrokeStyle, this.state.width)
        }
    }

    onMouseUp = ({ nativeEvent }) => {
        if (this.state.isPainting) {
            this.setState({ isPainting: false })

            this.sendPaintData()
        }
    }

    sendPaintData = () => {
        let stg = this.state.storage

        stg.push(this.state.line)

        this.setState({ storage: stg, line: [], last: [] })


    }

    // onTouchMove = ({ nativeEvent }) => {
    //     if (this.state.isPainting) {
    //         const { offsetX, offsetY } = nativeEvent
    //         const offSetData = { offsetX, offsetY }
    //         // Set the start and stop position of the paint event.
    //         const positionData = {
    //             start: { ...this.state.prevPos },
    //             stop: { ...offSetData },
    //         }
    //         // Add the position to the line array
    //         this.state.line = this.state.line.concat(positionData)
    //         // this.state.line2 = this.state.line
    //         this.paint(this.state.prevPos, offSetData, this.state.userStrokeStyle)
    //     }
    // }

    endPaintEvent = () => {
        if (this.state.isPainting) {

            const dataURL = this.canvas.toDataURL()

            this.setState({ dataURL, isPainting: false })

            this.sendPaintData()

            this.props.onChange(dataURL, this.state.storage)
        }
    }

    // onTouchEnd = () => {
    //     if (this.state.isPainting) {
    //         this.state.isPainting = false
    //         //   this.sendPaintData()
    //         // this.paintComplete()
    //         const dataURL = this.canvas.toDataURL()
    //         this.setState({ dataURL })
    //         // this.props.onEnd(dataURL)

    //         this.props.onChange(dataURL, this.state.line)
    //     }
    // }

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

        this.setState({ prevPos: { offsetX, offsetY } })
    }

    paintComplete = (vectors) => {

        vectors.forEach(arr => {

            arr.forEach(el => {

                this.paint(el.start, el.stop, el.strokeStyle, el.width)
            })
        })
    }

    render() {
        return <div className='container-canvas'>
            <div className='header-canvas'>
                {!this.props.cover && <h4 className="draw-title">DIBUIXA LA PÀGINA</h4>}
                <div className="info-canvas">
                    <button className='help-canvas-button' onClick={this.handleHelpDrawClick}><i class="fa fa-question"></i></button>
                    {this.props.cover && <button className='close-canvas-button' onClick={this.handleCloseDrawClick}><i class="fa fa-check-circle-o"></i></button>}
                    {!this.props.cover && <button className='back-canvas-button' onClick={this.props.onBackClick}>TORNAR AL LLIBRE</button>}
                </div>
                <div className="utils-canvas">
                    <button className='undo-canvas-button' onClick={this.handleUndoClick}><i class="fa fa-reply"></i></button>
                    <button className='redo-canvas-button' onClick={this.handleRedoClick}><i class="fa fa-share"></i></button>
                    <div><button className='color1-canvas-button' onClick={this.handleColor1}><i class="fa fa-circle"></i></button>
                    <button className='color2-canvas-button' onClick={this.handleColor2}><i class="fa fa-circle"></i></button>
                    <button className='color3-canvas-button' onClick={this.handleColor3}><i class="fa fa-circle"></i></button></div>
                    <div><button className='width1-canvas-button' onClick={this.handleWidth1}><i class="fa fa-circle"></i></button>
                    <button className='width2-canvas-button' onClick={this.handleWidth2}><i class="fa fa-circle"></i></button>
                    <button className='width3-canvas-button' onClick={this.handleWidth3}><i class="fa fa-circle"></i></button></div>
                </div>
            </div>
            <div className='canvas-area'>
                <canvas className='canvas'
                    id="page-draw"
                    ref={(ref) => (this.canvas = ref)}
                    onMouseDown={this.onMouseDown}
                    onMouseLeave={this.endPaintEvent}
                    onMouseUp={this.endPaintEvent}
                    onMouseMove={this.onMouseMove}
                // onTouchStart={this.onTouchStart}
                // onTouchEnd={this.onTouchEnd}
                // onTouchMove={this.onTouchMove}
                />
            </div>
        </div>
    }
}
export default Canvas