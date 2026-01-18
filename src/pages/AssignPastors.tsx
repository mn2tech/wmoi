import { useState, useEffect, useContext } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Church } from '../types'
import { ToastContext } from '../App'

interface ChurchUser {
  id: string
  auth_user_id: string
  email: string
  name?: string
  role?: string
  church_id?: string | null
}

interface PendingAssignment {
  id: string
  church_id: string
  pastor_name: string
  pastor_email: string
  status: string
  created_at: string
}

export default function AssignPastors() {
  const toast = useContext(ToastContext)
  const [churches, setChurches] = useState<Church[]>([])
  const [churchUsers, setChurchUsers] = useState<ChurchUser[]>([])
  const [pendingAssignments, setPendingAssignments] = useState<PendingAssignment[]>([])
  const [loading, setLoading] = useState(true)
  // Pending assignment form
  const [pendingPastorName, setPendingPastorName] = useState('')
  const [pendingChurchId, setPendingChurchId] = useState<string>('')
  
  // Unused state (for hidden sections - can be removed if not needed)
  // const [selectedChurch, setSelectedChurch] = useState<string>('')
  // const [selectedUser, setSelectedUser] = useState<string>('')
  // const [newPastorEmail, setNewPastorEmail] = useState('')
  // const [newPastorName, setNewPastorName] = useState('')
  // const [newPastorPassword, setNewPastorPassword] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [churchesRes, usersRes, pendingRes] = await Promise.all([
        supabase.from('churches').select('*').order('name'),
        supabase.from('church_users').select('*').order('email'),
        supabase.from('pending_pastor_assignments').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
      ])

      if (churchesRes.error) {
        console.error('Error loading churches:', churchesRes.error)
        toast?.error('Failed to load churches')
      } else {
        setChurches(churchesRes.data || [])
      }

      if (usersRes.error) {
        console.error('Error loading users:', usersRes.error)
        toast?.error('Failed to load users')
      } else {
        setChurchUsers(usersRes.data || [])
      }

      if (pendingRes.error) {
        console.error('Error loading pending assignments:', pendingRes.error)
        toast?.error('Failed to load pending assignments')
      } else {
        setPendingAssignments(pendingRes.data || [])
      }
    } catch (error: any) {
      console.error('Error loading data:', error)
      toast?.error(`Error loading data: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Unused functions (for hidden sections - not relevant since there are no regular users)
  /*
  const handleAssignPastor = async () => {
    if (!selectedChurch || !selectedUser) {
      toast?.warning('Please select both a church and a user')
      return
    }

    try {
      // Update church_user to link to church and set role to pastor
      const { error } = await supabase
        .from('church_users')
        .update({
          church_id: selectedChurch,
          role: 'pastor',
        })
        .eq('id', selectedUser)

      if (error) throw error

      // Update church to link pastor_user_id
      await supabase
        .from('churches')
        .update({ pastor_user_id: selectedUser })
        .eq('id', selectedChurch)

      toast?.success('Pastor assigned successfully!')
      setSelectedChurch('')
      setSelectedUser('')
      loadData()
    } catch (error) {
      console.error('Error assigning pastor:', error)
      toast?.error('Error assigning pastor. Please try again.')
    }
  }

  const handleCreateAndAssignPastor = async () => {
    if (!selectedChurch || !newPastorEmail || !newPastorPassword) {
      toast?.warning('Please fill in all required fields')
      return
    }

    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newPastorEmail,
        password: newPastorPassword,
        options: {
          data: {
            name: newPastorName || newPastorEmail,
          },
        },
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('User creation failed')

      // Create church_user record
      const { data: churchUserData, error: churchUserError } = await supabase
        .from('church_users')
        .insert({
          auth_user_id: authData.user.id,
          email: newPastorEmail,
          name: newPastorName || newPastorEmail,
          role: 'pastor',
          church_id: selectedChurch,
        })
        .select()
        .single()

      if (churchUserError) throw churchUserError

      // Update church to link pastor_user_id
      await supabase
        .from('churches')
        .update({ pastor_user_id: churchUserData.id })
        .eq('id', selectedChurch)

      toast?.success('Pastor created and assigned successfully!')
      setSelectedChurch('')
      setNewPastorEmail('')
      setNewPastorName('')
      setNewPastorPassword('')
      loadData()
    } catch (error: any) {
      console.error('Error creating pastor:', error)
      toast?.error(`Error creating pastor: ${error.message}`)
    }
  }
  */

  const handleUnassignPastor = async (userId: string, churchId: string) => {
    if (!window.confirm('Are you sure you want to unassign this pastor from their church?')) return

    try {
      // Remove church_id and set role back to user
      await supabase
        .from('church_users')
        .update({
          church_id: null,
          role: 'user',
        })
        .eq('id', userId)

      // Remove pastor_user_id from church
      await supabase
        .from('churches')
        .update({ pastor_user_id: null })
        .eq('id', churchId)

      toast?.success('Pastor unassigned successfully!')
      loadData()
    } catch (error) {
      console.error('Error unassigning pastor:', error)
      toast?.error('Error unassigning pastor. Please try again.')
    }
  }

  const handleCreatePendingAssignment = async () => {
    if (!pendingChurchId || !pendingPastorName) {
      toast?.warning('Please enter pastor name and select a church')
      return
    }

    try {
      // Get current admin user ID
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: adminUser } = await supabase
        .from('church_users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      const { error } = await supabase
        .from('pending_pastor_assignments')
        .insert({
          church_id: pendingChurchId,
          pastor_name: pendingPastorName,
          assigned_by: adminUser?.id,
          status: 'pending',
        })

      if (error) {
        if (error.code === '23505') {
          toast?.warning('A pending assignment already exists for this church and pastor name')
          return
        } else {
          throw error
        }
      }

      toast?.success('Pending assignment created! The pastor can now register and enter their email.')
      setPendingPastorName('')
      setPendingChurchId('')
      loadData()
    } catch (error: any) {
      console.error('Error creating pending assignment:', error)
      toast?.error(`Error: ${error.message}`)
    }
  }

  const handleCancelPendingAssignment = async (assignmentId: string) => {
    if (!window.confirm('Are you sure you want to cancel this pending assignment? The pastor will not be able to register using this assignment.')) return

    try {
      const { error } = await supabase
        .from('pending_pastor_assignments')
        .update({ status: 'cancelled' })
        .eq('id', assignmentId)

      if (error) throw error
      toast?.success('Pending assignment cancelled')
      loadData()
    } catch (error) {
      console.error('Error cancelling assignment:', error)
      toast?.error('Error cancelling assignment. Please try again.')
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  // Unused variable (for hidden section)
  // const unassignedUsers = churchUsers.filter(
  //   (u) => u.role !== 'admin' && (!u.church_id || u.church_id === null)
  // )
  const assignedPastors = churchUsers.filter(
    (u) => u.role === 'pastor' && u.church_id
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Assign Pastors to Churches</h1>
        <p className="text-gray-600 mt-2">
          Pre-assign churches to pastors by name. Pastors will complete their registration when available.
        </p>
      </div>

      {/* Create Pending Assignment */}
      <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Pre-Assign Church to Pastor</h2>
        <p className="text-sm text-gray-700 mb-4">
          Enter the pastor's name and select their church. This creates a pending assignment that the pastor can use when registration is available.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pastor Name *</label>
            <input
              type="text"
              value={pendingPastorName}
              onChange={(e) => setPendingPastorName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Pastor's full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Church *</label>
            <select
              value={pendingChurchId}
              onChange={(e) => setPendingChurchId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a church...</option>
              {churches.map((church) => (
                <option key={church.id} value={church.id}>
                  {church.name} - {church.location}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={handleCreatePendingAssignment}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Pending Assignment
        </button>
      </div>

      {/* Pending Assignments List */}
      <div className="bg-yellow-50 border-2 border-yellow-200 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">
          Pending Assignments {pendingAssignments.length > 0 && `(${pendingAssignments.length})`}
        </h2>
        {pendingAssignments.length === 0 ? (
          <p className="text-gray-600">No pending assignments. Create one above to get started.</p>
        ) : (
          <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pastor Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Church</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingAssignments.map((assignment) => {
                  const church = churches.find((c) => c.id === assignment.church_id)
                  return (
                    <tr key={assignment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{assignment.pastor_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{church?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                          Waiting for registration
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(assignment.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleCancelPendingAssignment(assignment.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {/* Assign Existing User - Hidden (not relevant since there are no regular users) */}
      {/* This section is hidden because the app only has admins and pastors, no regular users to assign */}
      {/* 
      {false && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Assign Church to Existing User</h2>
          <p className="text-sm text-gray-600 mb-4">
            Select a church and an existing user to assign them as the pastor for that church.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Church</label>
              <select
                value={selectedChurch}
                onChange={(e) => setSelectedChurch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a church...</option>
                {churches.map((church) => (
                  <option key={church.id} value={church.id}>
                    {church.name} - {church.location}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a user...</option>
                {unassignedUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleAssignPastor}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Assign Church to User
          </button>
        </div>
      )}
      */}

      {/* Create New Pastor - Temporarily Hidden */}
      {/* This section is hidden because pastor self-registration is the preferred flow */}
      {/* Uncomment this section if you need to create pastor accounts directly */}
      {/* 
      {false && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Create New Pastor Account and Assign Church</h2>
          <p className="text-sm text-gray-600 mb-4">
            Create a new pastor account and immediately assign them to a church. The pastor will receive login credentials.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Church</label>
              <select
                value={selectedChurch}
                onChange={(e) => setSelectedChurch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a church...</option>
                {churches.map((church) => (
                  <option key={church.id} value={church.id}>
                    {church.name} - {church.location}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={newPastorEmail}
                onChange={(e) => setNewPastorEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={newPastorName}
                onChange={(e) => setNewPastorName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input
                type="password"
                value={newPastorPassword}
                onChange={(e) => setNewPastorPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <button
            onClick={handleCreateAndAssignPastor}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Create Pastor & Assign Church
          </button>
        </div>
      )}
      */}

      {/* Assigned Pastors List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Currently Assigned Pastors</h2>
        {assignedPastors.length === 0 ? (
          <p className="text-gray-500">No pastors assigned yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pastor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Church
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignedPastors.map((pastor) => {
                  const church = churches.find((c) => c.id === pastor.church_id)
                  return (
                    <tr key={pastor.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {pastor.name || pastor.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {church?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleUnassignPastor(pastor.id, pastor.church_id!)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Unassign
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
