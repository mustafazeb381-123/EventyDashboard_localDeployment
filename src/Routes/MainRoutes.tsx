import React, { useState } from 'react' // Import useState
import { Outlet } from 'react-router-dom'
import SideBar from '@/components/SideBar/SideBar'
import Footer from '@/components/Footer/Footer'
import Header from '@/components/Header/Header'

function MainRoutes() {
  const [isExpanded, setIsExpanded] = useState(false); // New state for sidebar

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Pass state and a function to toggle it */}
      <SideBar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      
      {/* Pass isExpanded to Header */}
      <Header isExpanded={isExpanded} />
      
      {/* Main content with dynamic margin */}
      <main className={`relative p-4 h-full pt-20 transition-all duration-300 ease-in-out ${
          isExpanded ? 'ml-[280px]' : 'ml-[80px]'
      }`}>
        <Outlet />
      </main>
      
      <Footer />
    </div>
  )
}

export default MainRoutes;