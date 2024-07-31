import React, { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

import python from './utils/python'

function App () {
  const [response, setResponse] = useState('')

  const handleClick = async () => {
    const res = await python('http://localhost:8000/test', 'GET', null)
    setResponse(res.message)
  }

  return (
    <div className='App'>
      <header className='App-header'>
        <h1>Electron React Python Boilerplate</h1>
        <button onClick={handleClick}>Click me</button>
        <p>{response}</p>
      </header>
    </div>
  )
}

export default App
