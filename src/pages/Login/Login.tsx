import React from 'react'
import { useTranslation } from 'react-i18next';

function Login() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>this is {t('login')} </h1>
    </div>
  )
}

export default Login
