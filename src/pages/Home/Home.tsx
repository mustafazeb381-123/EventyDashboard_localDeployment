import React from 'react'
import LanguageToggle from '../../components/LanguageToggle/LanguageToggle'
import { useTranslation } from 'react-i18next';
import { Dice1 } from 'lucide-react';


function Home() {
  const { t } = useTranslation();
  
  return (
    <div style={{ backgroundColor: "#F7FAFF" }} className='w-full'>
      <div className='flex flex-row justify-space-between items-center'>
        {/* express event */}
        <div className='flex flex-row justify-between items-center'>
          <div>
            Express event
          </div>

        </div>

        {/* create event cards */}

        <div>

        </div>
      </div>
   
    </div>
  )
}

export default Home
