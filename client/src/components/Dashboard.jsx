import React from 'react'
import { useLogout } from './Logout';

const Dashboard = () => {
    const logout = useLogout();
  return (
    <button onClick={logout}>Cerrar Sesión</button>
  )
}

export default Dashboard;

