
import React, { Component } from 'react'
import logic from '../../logic'

class Canvas extends Component {

    state = { isPainting: false, userStrokeStyle: '#EE92C2', line: [], prevPos: { offsetX: 0, offsetY: 0 } }

    componentDidMount() {
        // Here we set up the properties of the canvas element. 
        this.canvas.width = 500
        this.canvas.height = 300
        this.ctx = this.canvas.getContext('2d')
        this.ctx.lineJoin = 'round'
        this.ctx.lineCap = 'round'
        this.ctx.lineWidth = 4
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
            this.state.line2 = this.state.line
            this.paint(this.state.prevPos, offSetData, this.state.userStrokeStyle)
        }
    }

    endPaintEvent = () => {
        if (this.state.isPainting) {
            this.state.isPainting = false
            //   this.sendPaintData()
            // this.paintComplete()
            const dataURL = this.canvas.toDataURL()
            this.setState({dataURL})
            // this.props.onEnd(dataURL)

            logic.savePagePicture(this.props.pageId, this.props.storyId, dataURL, this.state.line)
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

    paintComplete = () => {

        this.state.line2.forEach(el => {

            this.paint(el.start, el.stop, '#0097A7')
        })
    }






    render() {
        return (
            <canvas className='canvas'
                id="page-draw"
                width="500"
                height="300"
                // We use the ref attribute to get direct access to the canvas element. 
                ref={(ref) => (this.canvas = ref)}
                onMouseDown={this.onMouseDown}
                onMouseLeave={this.endPaintEvent}
                onMouseUp={this.endPaintEvent}
                onMouseMove={this.onMouseMove}
            />
        )
    }
}
export default Canvas