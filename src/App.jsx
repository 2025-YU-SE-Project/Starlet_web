import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import SignIn from './pages/SignIn'
import Mypage from './pages/Mypage'

const App = () => {
  return (
     <BrowserRouter>
      <div className="bg-cover min-h-screen bg-[url('/src/assets/background.png')]">
        <Routes>
          <Route path='/signin' element={<SignIn />} />
          <Route path='/mypage' element={<Mypage />} />

        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App