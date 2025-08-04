import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// src/main.jsx
import './styles/fonts.css'; // 👈 Import font definitions

import '../src/utils/i18n'; // Import i18n configuration
import { AuthProvider } from './context/AuthContext.tsx';
document.documentElement.dir = localStorage.getItem('i18nextLng') === 'ar' ? 'rtl' : 'ltr';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>

    <App />
    </AuthProvider>
  </StrictMode>,
)
