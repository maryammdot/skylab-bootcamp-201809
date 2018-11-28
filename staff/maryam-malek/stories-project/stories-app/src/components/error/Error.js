import React from 'react'
import './style.css'

function Error(props) {
    return <div className='error-container'> 
        <p className="error">{props.message}</p>
    </div>
}

export default Error