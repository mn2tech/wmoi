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
  churches?: Church
}

export default function PastorRegistration() {
  const navigate = useNavigate()
  const toast = useContext(ToastContext)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pendingAssignment, setPendingAssignment] = useState<PendingAssignment | null>(null)
  const [assignedChurch, setAssignedChurch] = useState<Church | null>(null)
  const [loadingAssignments, setLoadingAssignments] = useState(true)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('')
  const [pendingAssignments, setPendingAssignments] = useState<PendingAssignment[]>([])

  useEffect(() => {
    loadPendingAssignments()
  }, [])

  const loadPendingAssignments = async (retryCount = 0) => {
    const MAX_RETRIES = 2
    try {
      setLoadingAssignments(true)
      
      // First, try loading pending assignments without the join
      const { data, error } = await supabase
        .from('pending_pastor_assignments')
        .select('*')
        .eq('status', 'pending')
        .order('pastor_name')

      if (error) {
        // Ignore AbortError
        if (error.message?.includes('aborted') || error.name === 'AbortError') {
          console.warn('⚠️ AbortError when loading pending assignments - ignoring')
          return
        }
        
        console.error('Error loading pending assignments:', error)
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        
        // Retry on network errors
        if (retryCount < MAX_RETRIES && (error.message?.includes('network') || error.message?.includes('fetch'))) {
          console.log(`Retrying load pending assignments (attempt ${retryCount + 1}/${MAX_RETRIES})...`)
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
          return loadPendingAssignments(retryCount + 1)
        }
        
        throw error
      }

      // Load church details separately for each assignment
      const assignmentsWithChurches = await Promise.all(
        (data || []).map(async (assignment) => {
          try {
            const { data: churchData, error: churchError } = await supabase
              .from('churches')
              .select('id, name, location')
              .eq('id', assignment.church_id)
              .single()

            if (churchError) {
              console.warn(`Failed to load church ${assignment.church_id}:`, churchError)
              return {
                ...assignment,
                churches: null
              }
            }

            return {
              ...assignment,
              churches: churchData
            }
          } catch (err) {
            console.warn(`Error loading church for assignment ${assignment.id}:`, err)
            return {
              ...assignment,
              churches: null
            }
          }
        })
      )

      setPendingAssignments(assignmentsWithChurches as PendingAssignment[])
    } catch (error: any) {
      // Ignore AbortError - it's usually from hot reload or request cancellation
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
        console.warn('⚠️ AbortError when loading pending assignments (likely from hot reload) - ignoring')
        // Don't show error to user for AbortError, but ensure loading state is cleared
        setLoadingAssignments(false)
        return
      }
      
      console.error('Error loading pending assignments:', error)
      const errorMessage = error?.message || 'Failed to load pending assignments'
      
      // Only show error if we've exhausted retries
      const MAX_RETRIES = 2
      if (retryCount >= MAX_RETRIES) {
        toast?.error(`Failed to load pending assignments: ${errorMessage}. Please refresh the page.`)
      } else {
        // Retry on any error (not just network errors)
        console.log(`Retrying load pending assignments (attempt ${retryCount + 1}/${MAX_RETRIES})...`)
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
        return loadPendingAssignments(retryCount + 1)
      }
    } finally {
      setLoadingAssignments(false)
    }
  }

  const handleAssignmentSelect = (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId)
    
    if (!assignmentId) {
      setPendingAssignment(null)
      setAssignedChurch(null)
      setFormData({ ...formData, name: '' })
      return
    }

    const assignment = pendingAssignments.find(a => a.id === assignmentId)
    if (assignment) {
      setPendingAssignment(assignment)
      
      // Extract church from the joined data
      if (assignment.churches) {
        setAssignedChurch(assignment.churches as Church)
      } else {
        // Fallback: load church separately if join didn't work
        loadChurchDetails(assignment.church_id)
      }
      
      // Pre-fill the name
      setFormData({ ...formData, name: assignment.pastor_name })
    }
  }

  const loadChurchDetails = async (churchId: string) => {
    try {
      const { data, error } = await supabase
        .from('churches')
        .select('*')
        .eq('id', churchId)
        .single()
      
      if (error) throw error
      if (data) {
        setAssignedChurch(data as Church)
      }
    } catch (error) {
      console.error('Error loading church details:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (!formData.name || !formData.email || !formData.password || !selectedAssignmentId) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    if (!pendingAssignment) {
      setError('Please select your name from the dropdown. If you don\'t see your name, contact your administrator to be assigned first.')
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
              <label htmlFor="pastorName" className="block text-sm font-medium text-gray-700 mb-1">
                Select Your Name *
              </label>
              {loadingAssignments ? (
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 text-sm">
                  Loading pending assignments...
                </div>
              ) : (
                <select
                  id="pastorName"
                  name="pastorName"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={selectedAssignmentId}
                  onChange={(e) => handleAssignmentSelect(e.target.value)}
                >
                  <option value="">-- Select your name --</option>
                  {pendingAssignments.map((assignment) => (
                    <option key={assignment.id} value={assignment.id}>
                      {assignment.pastor_name}
                    </option>
                  ))}
                </select>
              )}
              {pendingAssignments.length === 0 && !loadingAssignments && (
                <p className="mt-1 text-xs text-gray-500">
                  No pending assignments found. Please contact your administrator to be assigned first.
                </p>
              )}
            </div>

            {pendingAssignment && assignedChurch && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-800 font-semibold mb-2">
                  ✓ Your Assigned Church
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

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                disabled={!!pendingAssignment}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {pendingAssignment && (
                <p className="mt-1 text-xs text-gray-500">
                  Name is pre-filled from your assignment. You can edit it if needed.
                </p>
              )}
            </div>

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
