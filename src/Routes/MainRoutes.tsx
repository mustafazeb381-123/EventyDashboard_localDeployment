import React from 'react'
import { Outlet } from 'react-router-dom' // Ensure this is imported
import SideBar from '@/components/SideBar/SideBar'
import Footer from '@/components/Footer/Footer'
import Header from '@/components/Header/Header'

function MainRoutes() {
  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Sidebar - Fixed positioning */}
      <SideBar />
      
      {/* Header */}
      {/* <Header /> */}
      
      {/* Main Content - Outlet renders child routes */}
      <main className="relative p-4 md:ml-64 h-full pt-20">
        <Outlet />
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}

export default MainRoutes;