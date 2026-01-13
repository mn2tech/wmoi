import { useState, useEffect, useContext } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { Church } from '../types'
import { ToastContext } from '../App'

interface PendingAssignment {
  id: string
  church_id: string
  pastor_name: string
  pastor_email?: string | null
  status: string
}

export default function PastorRegistration() {
  const navigate = useNavigate()
  const toast = useContext(ToastContext)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pendingAssignment, setPendingAssignment] = useState<PendingAssignment | null>(null)
  const [assignedChurch, setAssignedChurch] = useState<Church | null>(null)
  const [checkingEmail, setCheckingEmail] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [selectedChurchId, setSelectedChurchId] = useState<string>('')
  const [churches, setChurches] = useState<Church[]>([])

  useEffect(() => {
    loadChurches()
  }, [])

  const loadChurches = async () => {
    try {
      const { data, error } = await supabase
        .from('churches')
        .select('id, name, location')
        .order('name')

      if (error) throw error
      setChurches(data || [])
    } catch (error) {
      console.error('Error loading churches:', error)
    }
  }

  const checkPendingAssignment = async (name: string, churchId: string) => {
    if (!name || !churchId) {
      setPendingAssignment(null)
      setAssignedChurch(null)
      return
    }
    
    setCheckingEmail(true)
    try {
      const { data, error } = await supabase
        .from('pending_pastor_assignments')
        .select('*')
        .eq('pastor_name', name.trim())
        .eq('church_id', churchId)
        .eq('status', 'pending')
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking pending assignment:', error)
        return
      }

      if (data) {
        setPendingAssignment(data)
        
        // Load church details
        const { data: churchData } = await supabase
          .from('churches')
          .select('*')
          .eq('id', data.church_id)
          .single()
        
        if (churchData) {
          setAssignedChurch(churchData)
        }
      } else {
        setPendingAssignment(null)
        setAssignedChurch(null)
      }
    } catch (error) {
      console.error('Error checking pending assignment:', error)
    } finally {
      setCheckingEmail(false)
    }
  }

  useEffect(() => {
    // Check for pending assignment when name or church changes
    const timeoutId = setTimeout(() => {
      if (formData.name && selectedChurchId) {
        checkPendingAssignment(formData.name, selectedChurchId)
      } else {
        setPendingAssignment(null)
        setAssignedChurch(null)
      }
    }, 500) // Debounce

    return () => clearTimeout(timeoutId)
  }, [formData.name, selectedChurchId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (!formData.name || !formData.email || !formData.password || !selectedChurchId) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    if (!pendingAssignment) {
      setError('No pending assignment found for this name and church. Please contact your administrator to be assigned first.')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      // Step 1: Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.toLowerCase(),
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
        },
      })

      if (authError) {
        // If user already exists, try to sign in
        if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email.toLowerCase(),
            password: formData.password,
          })

          if (signInError) {
            throw new Error('Account exists but password is incorrect. Please use the correct password or contact support.')
          }

          if (!signInData.user) {
            throw new Error('Failed to authenticate existing user')
          }

          // Use existing user
          await createChurchUserRecord(signInData.user.id, pendingAssignment.church_id, pendingAssignment.id)
          return
        }

        throw new Error(authError.message || 'Failed to create account')
      }

      if (!authData.user) {
        throw new Error('User creation failed')
      }

      // Step 2: Create church_user record and mark assignment as completed
      await createChurchUserRecord(authData.user.id, pendingAssignment.church_id, pendingAssignment.id)
    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err.message || 'Registration failed. Please try again.')
      setLoading(false)
    }
  }

  const createChurchUserRecord = async (authUserId: string, churchId: string, assignmentId: string) => {
    try {
      // Check if church_user already exists
      const { data: existing } = await supabase
        .from('church_users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .maybeSingle()

      let churchUserId: string

      if (existing) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('church_users')
          .update({
            church_id: churchId,
            role: 'pastor',
            name: formData.name,
            email: formData.email.toLowerCase(),
          })
          .eq('id', existing.id)

        if (updateError) throw updateError
        churchUserId = existing.id
      } else {
        // Create new record
        const { data: newUser, error: insertError } = await supabase
          .from('church_users')
          .insert({
            auth_user_id: authUserId,
            email: formData.email.toLowerCase(),
            name: formData.name,
            role: 'pastor',
            church_id: churchId,
          })
          .select()
          .single()

        if (insertError) throw insertError
        if (!newUser) throw new Error('Failed to create church user')
        churchUserId = newUser.id
      }

      // Update church to link pastor_user_id
      const { error: churchError } = await supabase
        .from('churches')
        .update({ pastor_user_id: churchUserId })
        .eq('id', churchId)

      if (churchError) {
        console.warn('Warning: Could not update church pastor_user_id:', churchError)
        // Don't fail registration if this fails
      }

      // Mark pending assignment as completed and update with pastor's email
      const { error: assignmentError } = await supabase
        .from('pending_pastor_assignments')
        .update({ 
          status: 'completed',
          pastor_email: formData.email.toLowerCase(),
          completed_at: new Date().toISOString()
        })
        .eq('id', assignmentId)

      if (assignmentError) {
        console.warn('Warning: Could not update pending assignment:', assignmentError)
        // Don't fail registration if this fails
      }

      toast?.success('Registration successful! Redirecting to login...')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err: any) {
      console.error('Error creating church user:', err)
      throw new Error('Failed to create pastor account. Please contact support.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Pastor Registration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Register as a pastor for your church
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Your full name (must match admin's entry)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="church" className="block text-sm font-medium text-gray-700 mb-1">
                Select Your Church *
              </label>
              <select
                id="church"
                name="church"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={selectedChurchId}
                onChange={(e) => {
                  setSelectedChurchId(e.target.value)
                  // Check for pending assignment when church is selected
                  if (formData.name && e.target.value) {
                    checkPendingAssignment(formData.name, e.target.value)
                  }
                }}
              >
                <option value="">-- Select your church --</option>
                {churches.map((church) => (
                  <option key={church.id} value={church.id}>
                    {church.name} - {church.location}
                  </option>
                ))}
              </select>
            </div>

            {pendingAssignment && assignedChurch && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-800 font-semibold mb-2">
                  ✓ Pre-assigned Church Found!
                </p>
                <div className="text-xs text-green-700 space-y-1">
                  <p>
                    <strong>Church:</strong> {assignedChurch.name}
                  </p>
                  {assignedChurch.location && (
                    <p>
                      <strong>Location:</strong> {assignedChurch.location}
                    </p>
                  )}
                  <p className="mt-2 text-green-600">
                    Please enter your email and password to complete registration.
                  </p>
                </div>
              </div>
            )}
            
            {!pendingAssignment && formData.name && selectedChurchId && !checkingEmail && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-yellow-800">
                  <strong>⚠ No pending assignment found</strong>
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  No assignment found for "{formData.name}" at the selected church. Please contact your administrator.
                </p>
              </div>
            )}
            
            {checkingEmail && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">Checking for pending assignment...</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register as Pastor'}
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
