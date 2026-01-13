import { supabase } from './supabaseClient'
import { User } from '@supabase/supabase-js'

export interface ChurchUser {
  id: string
  auth_user_id: string
  email: string
  name?: string
  role?: string
  church_id?: string | null
  created_at: string
  updated_at: string
}

/**
 * Get church user record for the current authenticated user
 * This ensures only church app users can access the app
 */
export async function getChurchUser(authUser: User | null): Promise<ChurchUser | null> {
  if (!authUser) {
    console.log('⚠️ No auth user provided')
    return null
  }

  try {
    console.log('🔍 Querying church_users table for user:', authUser.id.substring(0, 8) + '...')
    
    const { data, error } = await supabase
      .from('church_users')
      .select('*')
      .eq('auth_user_id', authUser.id)
      .maybeSingle() // Use maybeSingle instead of single to handle no results gracefully

    // Check for AbortError before logging
    if (error) {
      const errorMessage = error.message || ''
      const errorName = (error as any)?.name || ''
      
      // Ignore AbortError - it's from hot reload or request cancellation
      if (errorMessage.includes('aborted') || errorName === 'AbortError' || errorMessage.includes('AbortError')) {
        console.warn('⚠️ Request aborted in getChurchUser (likely from hot reload) - ignoring')
        return null
      }
      
      console.log('📋 Query result - error:', error.code, errorMessage)
      
      // If table doesn't exist, log but don't throw
      if (error.code === 'PGRST116' || errorMessage.includes('does not exist') || errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
        console.error('❌ church_users table does not exist! Run migration: supabase/migrations/002_church_users_table.sql')
      } else if (error.code === 'PGRST301' || errorMessage.includes('JWT')) {
        console.error('❌ Authentication error - check your Supabase credentials')
      } else {
        console.error('❌ Error fetching church user:', error.code, errorMessage)
      }
      return null
    }
    
    console.log('📋 Query result - data:', data ? 'Found' : 'Not found')

    if (data) {
      console.log('✅ Found church user:', data.email, 'Role:', data.role, 'Church ID:', data.church_id || 'None (Admin)')
    } else {
      console.log('ℹ️ User not found in church_users table')
      console.log('💡 To fix: Run ADD_USER_TO_CHURCH_USERS.sql in Supabase SQL Editor')
    }

    return data
  } catch (error: any) {
    // Ignore AbortError - it's usually from hot reload or request cancellation
    if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
      console.warn('⚠️ Request aborted in getChurchUser (likely from hot reload)')
      return null
    }
    
    console.error('❌ Exception in getChurchUser:', error?.message || error)
    console.error('Exception details:', {
      message: error?.message,
      name: error?.name,
      code: error?.code,
      stack: error?.stack,
    })
    return null
  }
}

/**
 * Create a church user record
 * Call this after creating a user in Supabase Auth
 */
export async function createChurchUser(
  authUserId: string,
  email: string,
  name?: string,
  role: string = 'user'
): Promise<ChurchUser | null> {
  try {
    console.log('📝 Creating church user:', { authUserId: authUserId.substring(0, 8) + '...', email, name, role })
    
    const { data, error } = await supabase
      .from('church_users')
      .insert({
        auth_user_id: authUserId,
        email: email,
        name: name || email,
        role: role,
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating church user:', error)
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      
      // Check for common errors
      if (error.code === '23505') {
        console.error('💡 User already exists in church_users table')
      } else if (error.code === 'PGRST116') {
        console.error('💡 church_users table does not exist! Run migration: supabase/migrations/002_church_users_table.sql')
      } else if (error.code === '42501' || error.message.includes('permission denied')) {
        console.error('💡 Permission denied - check RLS policies')
      }
      
      return null
    }

    console.log('✅ Church user created successfully:', data.email)
    return data
  } catch (error: any) {
    console.error('❌ Exception in createChurchUser:', error)
    console.error('Exception details:', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
    })
    return null
  }
}

/**
 * Check if user is a church app user
 */
export async function isChurchUser(authUser: User | null): Promise<boolean> {
  if (!authUser) return false
  const churchUser = await getChurchUser(authUser)
  return churchUser !== null
}

/**
 * Check if user is an admin (can see all churches)
 */
export async function isAdmin(authUser: User | null): Promise<boolean> {
  if (!authUser) return false
  const churchUser = await getChurchUser(authUser)
  return churchUser?.role === 'admin' && !churchUser?.church_id
}

/**
 * Check if user is a pastor (linked to a specific church)
 */
export async function isPastor(authUser: User | null): Promise<boolean> {
  if (!authUser) return false
  const churchUser = await getChurchUser(authUser)
  return churchUser?.role === 'pastor' && !!churchUser?.church_id
}

/**
 * Get the church ID for a pastor user
 */
export async function getPastorChurchId(authUser: User | null): Promise<string | null> {
  if (!authUser) return null
  const churchUser = await getChurchUser(authUser)
  return churchUser?.church_id || null
}
