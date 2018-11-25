import React from 'react'
import './style.css'

function Error(props) {
    return <p className="error">{props.message}</p>
}

export default Error