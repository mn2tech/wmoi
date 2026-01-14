import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, createContext } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabaseClient'
import { isChurchUser, getChurchUser } from './lib/churchAuth'
import Login from './pages/Login'
import RegisterChurchUser from './pages/RegisterChurchUser'
import PastorRegistration from './pages/PastorRegistration'
import Dashboard from './pages/Dashboard'
import ChurchForm from './pages/ChurchForm'
import ManageChurches from './pages/ManageChurches'
import PastorDashboard from './pages/PastorDashboard'
import AssignPastors from './pages/AssignPastors'
import Layout from './components/Layout'
import ToastContainer from './components/ToastContainer'
import { useToast } from './hooks/useToast'

// Toast Context
export const ToastContext = createContext<ReturnType<typeof useToast> | null>(null)

function App() {
  const toast = useToast()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isChurchAppUser, setIsChurchAppUser] = useState(false)
  const [userRole, setUserRole] = useState<'admin' | 'pastor' | null>(null)

  console.log('App rendering - loading:', loading, 'canAccess:', session && isChurchAppUser, 'role:', userRole)

  useEffect(() => {
    let mounted = true

    // Show login page immediately - don't wait for session check
    setLoading(false)

    // Check active session in background (non-blocking)
    const checkSession = async () => {
      try {
        console.log('🔍 Checking session in background...')

        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          // Ignore AbortError - it's from hot reload, harmless
          if (error.message?.includes('aborted') || error.name === 'AbortError') {
            console.warn('⚠️ Request aborted (likely from hot reload) - ignoring')
            return
          }
          console.error('❌ Session error:', error)
          return
        }

        console.log('✅ Session retrieved:', session ? 'User logged in' : 'No session')

        if (mounted) {
          setSession(session)
          
          // Only check church user if there's a session
          if (session?.user) {
            console.log('👤 Checking if user is church user...')
            // Do this asynchronously - don't block UI
            Promise.all([
              isChurchUser(session.user),
              getChurchUser(session.user),
            ])
              .then(([isChurch, churchUser]) => {
                if (mounted) {
                  console.log('📋 Church user check result:', isChurch)
                  setIsChurchAppUser(isChurch)
                  if (churchUser) {
                    const role = isChurch && churchUser.role === 'admin' && !churchUser.church_id ? 'admin' : 
                                 isChurch && churchUser.role === 'pastor' && churchUser.church_id ? 'pastor' : null
                    setUserRole(role)
                    console.log('👤 User role:', role)
                  }
                }
              })
              .catch((err: any) => {
                // Ignore AbortError from hot reload
                if (err?.name !== 'AbortError' && !err?.message?.includes('aborted')) {
                  console.error('❌ Error checking church user:', err)
                }
                if (mounted) {
                  setIsChurchAppUser(false)
                  setUserRole(null)
                }
              })
          } else {
            setIsChurchAppUser(false)
            setUserRole(null)
          }
        }
      } catch (err: any) {
        // Ignore AbortError - it's usually from hot reload
        if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
          console.warn('⚠️ Request aborted (likely from hot reload) - ignoring')
          return
        }
        console.error('❌ Error in checkSession:', err)
      }
    }

    // Run in background, don't block
    checkSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session ? 'Session exists' : 'No session')
      if (mounted) {
        setSession(session)
        if (session?.user) {
          console.log('👤 Auth state change - checking church user for:', session.user.id.substring(0, 8) + '...')
          try {
            const [isChurch, churchUser] = await Promise.all([
              isChurchUser(session.user),
              getChurchUser(session.user),
            ])
            console.log('📋 Auth state change result - isChurch:', isChurch, 'churchUser:', churchUser ? 'Found' : 'Not found')
            setIsChurchAppUser(isChurch)
            if (churchUser) {
              const role = isChurch && churchUser.role === 'admin' && !churchUser.church_id ? 'admin' : 
                           isChurch && churchUser.role === 'pastor' && churchUser.church_id ? 'pastor' : null
              console.log('👤 Setting user role to:', role)
              setUserRole(role)
            } else {
              console.log('⚠️ No church user found - user needs to be added to church_users table')
              setUserRole(null)
            }
          } catch (err: any) {
            // Ignore AbortError
            if (err?.name !== 'AbortError' && !err?.message?.includes('aborted')) {
              console.error('❌ Error checking church user in auth state change:', err)
            }
            setIsChurchAppUser(false)
            setUserRole(null)
          }
        } else {
          console.log('🔄 No session - clearing church user state')
          setIsChurchAppUser(false)
          setUserRole(null)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Check if user is authenticated AND is a church app user
  const canAccess = session && isChurchAppUser

  return (
    <ToastContext.Provider value={toast}>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
        <Route
          path="/login"
          element={canAccess ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={<RegisterChurchUser />}
        />
        <Route
          path="/register-pastor"
          element={<PastorRegistration />}
        />
        <Route
          path="/"
          element={
            loading ? (
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading...</div>
              </div>
            ) : canAccess ? (
              <Layout>
                {userRole === 'pastor' ? (
                  <Navigate to="/pastor-dashboard" replace />
                ) : (
                  <Navigate to="/dashboard" replace />
                )}
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            canAccess && userRole === 'admin' ? (
              <Layout>
                <Dashboard />
              </Layout>
            ) : canAccess && userRole === 'pastor' ? (
              <Navigate to="/pastor-dashboard" replace />
            ) : session ? (
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
                  <p className="text-gray-600 mb-4">
                    Your account is not registered for the Church Admin app.
                  </p>
                  <button
                    onClick={() => supabase.auth.signOut()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/pastor-dashboard"
          element={
            canAccess && userRole === 'pastor' ? (
              <Layout>
                <PastorDashboard />
              </Layout>
            ) : canAccess && userRole === 'admin' ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/church-form"
          element={
            canAccess && userRole === 'admin' ? (
              <Layout>
                <ChurchForm />
              </Layout>
            ) : canAccess ? (
              <Navigate to={userRole === 'pastor' ? '/pastor-dashboard' : '/dashboard'} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/manage-churches"
          element={
            canAccess && userRole === 'admin' ? (
              <Layout>
                <ManageChurches />
              </Layout>
            ) : canAccess ? (
              <Navigate to={userRole === 'pastor' ? '/pastor-dashboard' : '/dashboard'} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/assign-pastors"
          element={
            canAccess && userRole === 'admin' ? (
              <Layout>
                <AssignPastors />
              </Layout>
            ) : canAccess ? (
              <Navigate to={userRole === 'pastor' ? '/pastor-dashboard' : '/dashboard'} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        </Routes>
      </Router>
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </ToastContext.Provider>
  )
}

export default App
