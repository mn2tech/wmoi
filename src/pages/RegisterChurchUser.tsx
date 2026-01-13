import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { createChurchUser } from '../lib/churchAuth'
import { useNavigate } from 'react-router-dom'

/**
 * This page allows creating a church_user record for an existing Supabase Auth user
 * Use this if you want to manually register users for the church app
 */
export default function RegisterChurchUser() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      let authUserId: string

      // First, try to sign in to see if user already exists in Auth
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInData?.user) {
        // User exists in Auth, use existing user
        authUserId = signInData.user.id
      } else if (signInError) {
        // User doesn't exist in Auth, create new one
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name || email,
            },
          },
        })

        if (authError) {
          throw new Error(authError.message || 'Failed to create user account')
        }

        if (!authData.user) {
          throw new Error('User creation failed')
        }

        authUserId = authData.user.id
      } else {
        throw new Error('Unable to authenticate. Please check your credentials.')
      }

      // Check if church_user already exists
      const { data: existingChurchUser } = await supabase
        .from('church_users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .single()

      if (existingChurchUser) {
        setSuccess('You are already registered! Redirecting to login...')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
        return
      }

      // Create the church_user record
      console.log('🔄 Creating church user record...')
      const churchUser = await createChurchUser(
        authUserId,
        email,
        name || email,
        'user'
      )

      if (!churchUser) {
        console.error('❌ createChurchUser returned null')
        // Check if it's a duplicate error
        const { data: existingUser } = await supabase
          .from('church_users')
          .select('*')
          .eq('auth_user_id', authUserId)
          .maybeSingle()
        
        if (existingUser) {
          setSuccess('You are already registered! Redirecting to login...')
          setTimeout(() => {
            navigate('/login')
          }, 2000)
          return
        }
        
        throw new Error('Failed to create church user record. Check the console for details. Make sure the church_users table exists and RLS policies are set up correctly.')
      }

      setSuccess('User registered successfully! You can now log in.')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Register Church User
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create an account for the Church Admin app
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
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
                autoComplete="new-password"
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
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
          <div className="text-center">
            <a
              href="/login"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Already have an account? Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
