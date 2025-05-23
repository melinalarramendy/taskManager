import React from 'react'
import Signup from './components/Signup'
import Login from './components/Login'
import ForgotPassword from './components/Forgotpassword'
import ResetPassword from './components/ResetPassword'
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard'
import Error404 from './components/Error404'
import KanbanBoard from './components/KanbanBoard';
import { Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

function App() {

  return (
    <div>
      <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/resetpassword" element={<ResetPassword />} />
      <Route path="*" element={<Error404 />} />

      <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

      <Route 
          path="/boards/:id" 
          element={
            <ProtectedRoute>
              <KanbanBoard />
            </ProtectedRoute>
          } 
        />
    </Routes>
    </div>

  )
}

export default App
