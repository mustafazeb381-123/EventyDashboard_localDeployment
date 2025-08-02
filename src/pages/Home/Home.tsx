import React from 'react'
import LanguageToggle from '../../components/LanguageToggle/LanguageToggle'
import { useTranslation } from 'react-i18next';


function Home() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>this is home {t('title') }</h1>
      <LanguageToggle />
    </div>
  )
}

export default Home
