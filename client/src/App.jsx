import React from 'react'
import Signup from './components/Signup'
import Login from './components/Login'
import ForgotPassword from './components/Forgotpassword'
import ResetPassword from './components/ResetPassword'
import { Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

function App() {

  return (
    <div>
      <Routes>
      <Route path="/register" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/resetpassword" element={<ResetPassword />} />
    </Routes>
    </div>

  )
}

export default App
