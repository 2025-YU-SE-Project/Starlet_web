import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import SignIn from './pages/SignIn'

const App = () => {
  return (
    <BrowserRouter>
    <div className="bg-cover min-h-screen  bg-[url('/src/assets/background.png')]">
    <SignIn/>
    </div>
    </BrowserRouter>
  )
}

export default App