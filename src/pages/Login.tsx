import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { isChurchUser } from '../lib/churchAuth'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('🔐 Attempting to sign in...')
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error('❌ Sign in error:', signInError)
        setError(signInError.message)
        setLoading(false)
        return
      }

      if (!data.session?.user) {
        console.error('❌ No session or user after sign in')
        setError('Sign in failed. Please try again.')
        setLoading(false)
        return
      }

      console.log('✅ Sign in successful, checking church user status...')
      
      // Check if user is registered for church app with timeout
      try {
        const timeoutPromise = new Promise<boolean>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        )
        
        const isChurch = await Promise.race([
          isChurchUser(data.session.user),
          timeoutPromise
        ])
        
        if (isChurch) {
          console.log('✅ User is registered for church app, navigating to dashboard')
          navigate('/dashboard')
        } else {
          console.warn('⚠️ User is not registered for church app')
          setError('Your account is not registered for the Church Admin app. Please contact an administrator.')
          await supabase.auth.signOut()
          setLoading(false)
        }
      } catch (checkError: any) {
        // Ignore AbortError - it's usually from hot reload or request cancellation
        if (checkError?.name === 'AbortError' || checkError?.message?.includes('aborted')) {
          console.warn('⚠️ Request aborted (likely from hot reload) - retrying...')
          // Retry the check once
          try {
            const isChurch = await isChurchUser(data.session.user)
            if (isChurch) {
              console.log('✅ User is registered for church app, navigating to dashboard')
              navigate('/dashboard')
              return
            } else {
              setError('Your account is not registered for the Church Admin app. Please contact an administrator.')
              await supabase.auth.signOut()
              setLoading(false)
              return
            }
          } catch (retryError: any) {
            // If retry also fails, show error
            if (retryError?.name === 'AbortError') {
              console.warn('⚠️ Retry also aborted - this is likely a development issue')
              setError('Please refresh the page and try again.')
            } else {
              setError('Unable to verify account. Please try again or contact support.')
            }
            await supabase.auth.signOut()
            setLoading(false)
            return
          }
        }
        
        console.error('❌ Error checking church user:', checkError)
        console.error('Check error details:', {
          message: checkError?.message,
          name: checkError?.name,
          code: checkError?.code,
          stack: checkError?.stack,
        })
        
        if (checkError.message === 'Timeout') {
          setError('Connection timeout. Please check your internet connection and try again.')
        } else if (checkError?.message) {
          setError(`Unable to verify account: ${checkError.message}`)
        } else {
          setError('Unable to verify account. Please try again or contact support.')
        }
        await supabase.auth.signOut()
        setLoading(false)
      }
    } catch (err: any) {
      // Ignore AbortError - it's usually from hot reload
      if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
        console.warn('⚠️ Request aborted (likely from hot reload) - ignoring')
        setLoading(false)
        return
      }
      
      console.error('❌ Unexpected error during login:', err)
      console.error('Error details:', {
        message: err?.message,
        name: err?.name,
        stack: err?.stack,
        cause: err?.cause,
      })
      
      // Show more specific error message
      let errorMessage = 'An unexpected error occurred. Please try again.'
      if (err?.message) {
        errorMessage = `Error: ${err.message}`
      } else if (err?.name) {
        errorMessage = `Error: ${err.name}`
      }
      
      setError(errorMessage)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            WMOI Church Admin
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Word Ministries of India
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          <div className="text-center space-y-2">
            <div>
              <Link
                to="/register-pastor"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Pastor Registration (Pre-assigned by admin)
              </Link>
            </div>
            <div>
              <Link
                to="/register"
                className="text-sm text-gray-600 hover:text-gray-500"
              >
                Admin Registration
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
