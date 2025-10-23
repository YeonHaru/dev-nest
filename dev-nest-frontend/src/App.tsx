import { Outlet } from 'react-router-dom'
import Header from './components/Header'

const App = () => {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <Outlet />
    </div>
  )
}

export default App
