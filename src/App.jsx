import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Signup from './pages/Signup'




const App = () => {
  return (
     <BrowserRouter>
      <div className="bg-cover min-h-screen bg-[url('/src/assets/background.png')]">
        <Routes>
          <Route path='signup' element={<Signup/>}/>
        </Routes>
      </div>
    </BrowserRouter>

  )
}

export default App