import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getChurchUser } from '../lib/churchAuth'

export default function Sidebar() {
  const location = useLocation()
  const [userRole, setUserRole] = useState<'admin' | 'pastor' | null>(null)

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const churchUser = await getChurchUser(user)
        if (churchUser) {
          const role = churchUser.role === 'admin' && !churchUser.church_id ? 'admin' : 
                       churchUser.role === 'pastor' && churchUser.church_id ? 'pastor' : null
          setUserRole(role)
        }
      }
    }
    checkRole()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const adminMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/church-form', label: 'Church Form', icon: '⛪' },
    { path: '/manage-churches', label: 'Manage Churches', icon: '➕' },
    { path: '/assign-pastors', label: 'Assign Pastors', icon: '👤' },
  ]

  const pastorMenuItems = [
    { path: '/pastor-dashboard', label: 'My Church', icon: '⛪' },
  ]

  const menuItems = userRole === 'admin' ? adminMenuItems : pastorMenuItems

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-800">WMOI Church Admin</h1>
        <p className="text-sm text-gray-500 mt-1">Word Ministries of India</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-3 text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <span className="mr-2">🚪</span>
          Logout
        </button>
      </div>
    </div>
  )
}
