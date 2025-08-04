import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
    Home, 
  Users, 
  UserCheck,
  Settings,
  LogOut,
  Menu,
  CheckCircle,
  Clock,
  UserPlus,
  Bell,
  User
} from "lucide-react"
import { Button } from '../ui/button'

function Header({ isExpanded }) {



  // const [isExpanded, setIsExpanded] = useState(false)
   const [activeItem, setActiveItem] = useState("Registered Users")
   const [expandedMenus, setExpandedMenus] = useState({})
   const [isRTL, setIsRTL] = useState(false)
 
   const naviagte = useNavigate()
   
  
  // Detect RTL direction and listen for changes
  useEffect(() => {
    const checkRTL = () => {
      const dir = document.documentElement.dir || document.documentElement.getAttribute('dir')
      setIsRTL(dir === 'rtl')
    }
    
    // Check initially
    checkRTL()
    
    // Create observer to watch for direction changes
    const observer = new MutationObserver(() => {
      checkRTL()
    })
    
    // Watch for changes to the dir attribute
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir']
    })
    
    // Cleanup
    return () => {
      observer.disconnect()
    }
  }, [])

  // const toggleSubmenu = (label) => {
  //   setExpandedMenus(prev => ({
  //     ...prev,
  //     [label]: !prev[label]
  //   }))
  // }

 
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between z-40 shadow-sm transition-all duration-300"
        style={{ 
          paddingLeft: isRTL ? '16px' : (isExpanded ? '296px' : '88px'), 
          paddingRight: isRTL ? (isExpanded ? '296px' : '88px') : '16px'
        }}
      >
        
        <div className="flex items-center space-x-4">
          {/* <Button 
            variant="ghost" 
            size="icon"
            className="text-gray-700 hover:bg-gray-100"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Menu className="h-5 w-5" />
          </Button>
           */}
          
          <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
        </div>

        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100">
            <Bell className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <span>My Account</span>
          </div>
        </div>
      </header>
  )
}

export default Header

const styles = {
  header: {
    backgroundColor: '#282c34',
    padding: '10px 20px',
    color: 'white',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-around',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '18px',
  }
}
