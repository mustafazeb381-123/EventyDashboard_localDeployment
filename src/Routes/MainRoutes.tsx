import React, { useState, useEffect } from 'react'; // Add useEffect
import { Outlet } from 'react-router-dom';
import SideBar from '@/components/SideBar/SideBar';
import Footer from '@/components/Footer/Footer';
import Header from '@/components/Header/Header';

function MainRoutes() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRTL, setIsRTL] = useState(false); // Move isRTL state here

  // Detect RTL direction and listen for changes
  useEffect(() => {
    const checkRTL = () => {
      const dir = document.documentElement.dir || document.documentElement.getAttribute('dir');
      setIsRTL(dir === 'rtl');
    };
    
    checkRTL();
    
    const observer = new MutationObserver(() => {
      checkRTL();
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir'],
    });
    
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Pass isRTL and other states as props */}
      <SideBar isExpanded={isExpanded} setIsExpanded={setIsExpanded} isRTL={isRTL} />
      <Header isExpanded={isExpanded} isRTL={isRTL} />
      
      {/* Main content with dynamic margin based on isRTL */}
      <main 
        className={`relative p-4 h-full pt-20 transition-all duration-300 ease-in-out ${
          isRTL 
            ? (isExpanded ? 'mr-[280px]' : 'mr-[80px]') // Use margin-right for RTL
            : (isExpanded ? 'ml-[280px]' : 'ml-[80px]') // Use margin-left for LTR
        }`}
      >
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
}

export default MainRoutes;