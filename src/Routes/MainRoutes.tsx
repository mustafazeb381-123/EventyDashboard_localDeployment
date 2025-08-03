import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../components/Header/Header'
import Footer from '../components/Footer/Footer'
import SideBar from '@/components/SideBar/SideBar'

function MainRoutes() {
  return (
    <>
      <Header />
    {/* <SideBar /> */}
      <Outlet />
    <Footer />
    </>
  )
}

export default MainRoutes
