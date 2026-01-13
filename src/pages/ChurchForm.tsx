import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Church, Member, MemberFormData } from '../types'

export default function ChurchForm() {
  const [churches, setChurches] = useState<Church[]>([])
  const [selectedChurchId, setSelectedChurchId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [pastorName, setPastorName] = useState('')
  const [pastorPhone, setPastorPhone] = useState('')
  const [pastorEmail, setPastorEmail] = useState('')
  const [pastorPhoto, setPastorPhoto] = useState<File | null>(null)
  const [pastorPhotoUrl, setPastorPhotoUrl] = useState('')
  const [attendance, setAttendance] = useState<number>(0)
  const [tithes, setTithes] = useState<number>(0)
  const [members, setMembers] = useState<MemberFormData[]>([
    { name: '', age: '', gender: '', role: '' },
  ])

  useEffect(() => {
    loadChurches()
  }, [])

  useEffect(() => {
    if (selectedChurchId) {
      loadChurchData()
    } else {
      resetForm()
    }
  }, [selectedChurchId])

  const loadChurches = async () => {
    try {
      const { data, error } = await supabase
        .from('churches')
        .select('*')
        .order('name')

      if (error) throw error
      setChurches(data || [])
    } catch (err: any) {
      setError(err.message)
    }
  }

  const loadChurchData = async () => {
    setLoading(true)
    try {
      // Load church data
      const { data: churchData, error: churchError } = await supabase
        .from('churches')
        .select('*')
        .eq('id', selectedChurchId)
        .single()

      if (churchError) throw churchError

      if (churchData) {
        setPastorName(churchData.pastor_name || '')
        setPastorPhone(churchData.pastor_phone || '')
        setPastorEmail(churchData.pastor_email || '')
        setPastorPhotoUrl(churchData.pastor_photo_url || '')
        setAttendance(churchData.attendance || 0)
        setTithes(Number(churchData.tithes) || 0)
      }

      // Load members
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('*')
        .eq('church_id', selectedChurchId)
        .order('created_at')

      if (membersError) throw membersError

      if (membersData && membersData.length > 0) {
        setMembers(
          membersData.map((m) => ({
            name: m.name || '',
            age: m.age?.toString() || '',
            gender: m.gender || '',
            role: m.role || '',
          }))
        )
      } else {
        setMembers([{ name: '', age: '', gender: '', role: '' }])
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setPastorName('')
    setPastorPhone('')
    setPastorEmail('')
    setPastorPhoto(null)
    setPastorPhotoUrl('')
    setAttendance(0)
    setTithes(0)
    setMembers([{ name: '', age: '', gender: '', role: '' }])
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPastorPhoto(file)
    setLoading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${selectedChurchId}-${Date.now()}.${fileExt}`
      const filePath = `pastor-photos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('pastor-photos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('pastor-photos').getPublicUrl(filePath)

      setPastorPhotoUrl(publicUrl)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addMemberRow = () => {
    setMembers([...members, { name: '', age: '', gender: '', role: '' }])
  }

  const removeMemberRow = (index: number) => {
    setMembers(members.filter((_, i) => i !== index))
  }

  const updateMember = (index: number, field: keyof MemberFormData, value: string) => {
    const updated = [...members]
    updated[index] = { ...updated[index], [field]: value }
    setMembers(updated)
  }

  const handleSave = async () => {
    if (!selectedChurchId) {
      setError('Please select a church')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // Update church
      const { error: churchError } = await supabase
        .from('churches')
        .update({
          pastor_name: pastorName,
          pastor_phone: pastorPhone,
          pastor_email: pastorEmail,
          pastor_photo_url: pastorPhotoUrl,
          attendance: attendance,
          tithes: tithes,
        })
        .eq('id', selectedChurchId)

      if (churchError) throw churchError

      // Delete existing members
      const { error: deleteError } = await supabase
        .from('members')
        .delete()
        .eq('church_id', selectedChurchId)

      if (deleteError) throw deleteError

      // Insert new members (filter out empty rows)
      const validMembers = members.filter((m) => m.name.trim() !== '')
      if (validMembers.length > 0) {
        const membersToInsert = validMembers.map((m) => ({
          church_id: selectedChurchId,
          name: m.name,
          age: m.age ? parseInt(m.age) : null,
          gender: m.gender || null,
          role: m.role || null,
        }))

        const { error: membersError } = await supabase
          .from('members')
          .insert(membersToInsert)

        if (membersError) throw membersError
      }

      setSuccess('Church data saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Church Form</h1>

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

      <div className="bg-white p-6 rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Church *
        </label>
        <select
          value={selectedChurchId}
          onChange={(e) => setSelectedChurchId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          disabled={loading}
        >
          <option value="">-- Select a church --</option>
          {churches.map((church) => (
            <option key={church.id} value={church.id}>
              {church.name}
            </option>
          ))}
        </select>
      </div>

      {selectedChurchId && (
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <h2 className="text-xl font-semibold">Pastor Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pastor Name *
              </label>
              <input
                type="text"
                value={pastorName}
                onChange={(e) => setPastorName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pastor Phone
              </label>
              <input
                type="tel"
                value={pastorPhone}
                onChange={(e) => setPastorPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pastor Email
              </label>
              <input
                type="email"
                value={pastorEmail}
                onChange={(e) => setPastorEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pastor Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {pastorPhotoUrl && (
                <img
                  src={pastorPhotoUrl}
                  alt="Pastor"
                  className="mt-2 h-20 w-20 object-cover rounded"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attendance
              </label>
              <input
                type="number"
                value={attendance}
                onChange={(e) => setAttendance(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tithes (₹)
              </label>
              <input
                type="number"
                value={tithes}
                onChange={(e) => setTithes(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Members</h2>
              <button
                type="button"
                onClick={addMemberRow}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                + Add Member
              </button>
            </div>

            <div className="space-y-4">
              {members.map((member, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) =>
                        updateMember(index, 'name', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      value={member.age}
                      onChange={(e) =>
                        updateMember(index, 'age', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={member.gender}
                      onChange={(e) =>
                        updateMember(index, 'gender', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <input
                      type="text"
                      value={member.role}
                      onChange={(e) =>
                        updateMember(index, 'role', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Member, Leader"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => removeMemberRow(index)}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      disabled={members.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={saving || !pastorName}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
