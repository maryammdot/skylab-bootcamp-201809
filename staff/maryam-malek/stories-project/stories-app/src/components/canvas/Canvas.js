
import React, { Component } from 'react'
import swal from 'sweetalert2'
import './style.css'

class Canvas extends Component {

    state = { isPainting: false, userStrokeStyle: '#EE92C2', line: [], prevPos: { offsetX: 0, offsetY: 0 } }

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

            this.setState({ line: this.props.vectors })
            this.paintComplete(this.props.vectors)
        }
    }

    handleHelpDrawClick = () => {
        swal({
            title: this.props.cover ? 'ARROSSEGANT EL DIT DIBUIXA LA PORTADA DEL TEU CONTE' : 'ARROSSEGANT EL DIT DIBUIXA LA PÀGINA DEL TEU CONTE',
            width: 300,
            padding: '3em',
            // background: '#fff url(/images/trees.png)',
            confirmButtonText: 'ESTIC PREPARAT',
            confirmButtonColor: '#0097A7'
        })
    }

    handleCloseDrawClick = () => {
        this.props.onCloseDrawClick()
    }

    onMouseDown = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent
        this.state.isPainting = true
        this.state.prevPos = { offsetX, offsetY }
    }

    onMouseMove = ({ nativeEvent }) => {
        if (this.state.isPainting) {
            const { offsetX, offsetY } = nativeEvent
            const offSetData = { offsetX, offsetY }
            // Set the start and stop position of the paint event.
            const positionData = {
                start: { ...this.state.prevPos },
                stop: { ...offSetData },
            }
            // Add the position to the line array
            this.state.line = this.state.line.concat(positionData)
            // this.state.line2 = this.state.line
            this.paint(this.state.prevPos, offSetData, this.state.userStrokeStyle)
        }
    }

    endPaintEvent = () => {
        if (this.state.isPainting) {
            this.state.isPainting = false
            //   this.sendPaintData()
            // this.paintComplete()
            const dataURL = this.canvas.toDataURL()
            this.setState({ dataURL })
            // this.props.onEnd(dataURL)

            this.props.onChange(dataURL, this.state.line)
        }
    }

    paint(prevPos, currPos, strokeStyle) {
        const { offsetX, offsetY } = currPos
        const { offsetX: x, offsetY: y } = prevPos

        this.ctx.beginPath()
        this.ctx.strokeStyle = strokeStyle
        // Move the the prevPosition of the mouse
        this.ctx.moveTo(x, y)
        // Draw a line to the current position of the mouse
        this.ctx.lineTo(offsetX, offsetY)
        // Visualize the line using the strokeStyle
        this.ctx.stroke()
        this.state.prevPos = { offsetX, offsetY }
    }

    paintComplete = (vectors) => {

        vectors.forEach(el => {

            this.paint(el.start, el.stop, this.state.userStrokeStyle)
        })
    }

    render() {
        return <div>
            {!this.props.cover && <h4 className="draw-title">PAGE DRAW</h4>}
            <div className="info-canvas">
                <button onClick={this.handleHelpDrawClick}><i class="fa fa-question"></i></button>
                {this.props.cover && <button onClick={this.handleCloseDrawClick}><i class="fa fa-check-circle-o"></i></button>}
            </div>
            <canvas className='canvas'
                id="page-draw"
                // We use the ref attribute to get direct access to the canvas element. 
                ref={(ref) => (this.canvas = ref)}
                onMouseDown={this.onMouseDown}
                onMouseLeave={this.endPaintEvent}
                onMouseUp={this.endPaintEvent}
                onMouseMove={this.onMouseMove}
            />
        </div>
    }
}
export default Canvas