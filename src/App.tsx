import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Routes from './Routes/Routes'

function App() {
  const [count, setCount] = useState(0)

  const increamentCount = () => {
    setCount((prevCount) => prevCount + 1)
  }
  const decrementCount = () => {
    setCount((prevCount) => prevCount - 1)
  }
  const resetCount = () => {
    setCount(0)
  }

  return (
    <>
      <Routes />
    </>
  )
}

export default App
