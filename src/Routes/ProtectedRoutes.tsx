// components/ProtectedRoute.jsx
import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRoute = () => {
  const token = localStorage.getItem('token') // or from a context/MMKV

  return token ? <Outlet /> : <Navigate to="/login" />
}

export default ProtectedRoute