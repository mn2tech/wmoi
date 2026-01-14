import { useState, useEffect, useContext } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getPastorChurchId } from '../lib/churchAuth'
import { Church, Member } from '../types'
import { ToastContext } from '../App'

export default function PastorDashboard() {
  const toast = useContext(ToastContext)
  const [church, setChurch] = useState<Church | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [churchId, setChurchId] = useState<string | null>(null)
  
  // Member form state
  const [showMemberForm, setShowMemberForm] = useState(false)
  const [memberForm, setMemberForm] = useState({
    name: '',
    age: '',
    gender: '',
    role: '',
  })
  const [editingMember, setEditingMember] = useState<Member | null>(null)

  useEffect(() => {
    // Check if layouts are saved
    console.log('Saved layouts:', localStorage.getItem('dashboard_layouts'))
    console.log('Saved visibility:', localStorage.getItem('dashboard_widget_visibility'))
    
    loadChurchData()
  }, [])

  const loadChurchData = async () => {
    try {
      // Get current user's church ID
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('No user found')
        setLoading(false)
        return
      }

      const pastorChurchId = await getPastorChurchId(user)
      if (!pastorChurchId) {
        console.error('Pastor not linked to a church')
        setLoading(false)
        return
      }

      setChurchId(pastorChurchId)

      // Load church data
      const { data: churchData, error: churchError } = await supabase
        .from('churches')
        .select('*')
        .eq('id', pastorChurchId)
        .single()

      if (churchError) throw churchError
      setChurch(churchData)

      // Load members for this church
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('*')
        .eq('church_id', pastorChurchId)
        .order('name')

      if (membersError) throw membersError
      setMembers(membersData || [])
    } catch (error) {
      console.error('Error loading church data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async () => {
    if (!churchId || !memberForm.name) {
      toast?.warning('Please fill in at least the member name')
      return
    }

    try {
      const memberData = {
        church_id: churchId,
        name: memberForm.name,
        age: memberForm.age ? parseInt(memberForm.age) : null,
        gender: memberForm.gender || null,
        role: memberForm.role || null,
      }

      if (editingMember) {
        // Update existing member
        const { error } = await supabase
          .from('members')
          .update(memberData)
          .eq('id', editingMember.id)

        if (error) throw error
      } else {
        // Insert new member
        const { error } = await supabase
          .from('members')
          .insert(memberData)

        if (error) throw error
      }

      // Reset form and reload
      setMemberForm({ name: '', age: '', gender: '', role: '' })
      setEditingMember(null)
      setShowMemberForm(false)
      toast?.success(editingMember ? 'Member updated successfully!' : 'Member added successfully!')
      loadChurchData()
    } catch (error) {
      console.error('Error saving member:', error)
      toast?.error('Error saving member. Please try again.')
    }
  }

  const handleEditMember = (member: Member) => {
    setEditingMember(member)
    setMemberForm({
      name: member.name || '',
      age: member.age?.toString() || '',
      gender: member.gender || '',
      role: member.role || '',
    })
    setShowMemberForm(true)
  }

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return

    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId)

      if (error) throw error
      toast?.success('Member deleted successfully!')
      loadChurchData()
    } catch (error) {
      console.error('Error deleting member:', error)
      toast?.error('Error deleting member. Please try again.')
    }
  }

  const handleUpdateChurch = async (field: string, value: any) => {
    if (!churchId) return

    try {
      const { error } = await supabase
        .from('churches')
        .update({ [field]: value })
        .eq('id', churchId)

      if (error) throw error
      toast?.success('Church information updated successfully!')
      loadChurchData()
    } catch (error) {
      console.error('Error updating church:', error)
      toast?.error('Error updating church information. Please try again.')
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading your church data...</div>
  }

  if (!church) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">You are not linked to a church. Please contact an administrator.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{church.name}</h1>
          <p className="text-gray-600 mt-1">{church.location}</p>
        </div>
        <button
          onClick={() => setShowMemberForm(!showMemberForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showMemberForm ? 'Cancel' : 'Add Member'}
        </button>
      </div>

      {/* Church Information Card */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Church Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pastor Name</label>
            <input
              type="text"
              value={church.pastor_name || ''}
              onChange={(e) => handleUpdateChurch('pastor_name', e.target.value)}
              onBlur={(e) => handleUpdateChurch('pastor_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pastor Phone</label>
            <input
              type="text"
              value={church.pastor_phone || ''}
              onChange={(e) => handleUpdateChurch('pastor_phone', e.target.value)}
              onBlur={(e) => handleUpdateChurch('pastor_phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pastor Email</label>
            <input
              type="email"
              value={church.pastor_email || ''}
              onChange={(e) => handleUpdateChurch('pastor_email', e.target.value)}
              onBlur={(e) => handleUpdateChurch('pastor_email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attendance</label>
            <input
              type="number"
              value={church.attendance || ''}
              onChange={(e) => handleUpdateChurch('attendance', e.target.value ? parseInt(e.target.value) : null)}
              onBlur={(e) => handleUpdateChurch('attendance', e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tithes (₹)</label>
            <input
              type="number"
              step="0.01"
              value={church.tithes || ''}
              onChange={(e) => handleUpdateChurch('tithes', e.target.value ? parseFloat(e.target.value) : null)}
              onBlur={(e) => handleUpdateChurch('tithes', e.target.value ? parseFloat(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Member Form */}
      {showMemberForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            {editingMember ? 'Edit Member' : 'Add New Member'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={memberForm.name}
                onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                value={memberForm.age}
                onChange={(e) => setMemberForm({ ...memberForm, age: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={memberForm.gender}
                onChange={(e) => setMemberForm({ ...memberForm, gender: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input
                type="text"
                value={memberForm.role}
                onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                placeholder="e.g., Elder, Deacon, Member"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleAddMember}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingMember ? 'Update Member' : 'Add Member'}
            </button>
            <button
              onClick={() => {
                setShowMemberForm(false)
                setEditingMember(null)
                setMemberForm({ name: '', age: '', gender: '', role: '' })
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Members ({members.length})</h2>
        {members.length === 0 ? (
          <p className="text-gray-500">No members added yet. Click "Add Member" to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {member.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.age || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.gender || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.role || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditMember(member)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => member.id && handleDeleteMember(member.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={!member.id}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
