import { createClient } from '@supabase/supabase-js'

// TODO: Replace these with your Supabase project credentials
// Get these from: https://app.supabase.com/project/_/settings/api
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Check environment variables
const hasCredentials = supabaseUrl && supabaseAnonKey

if (!hasCredentials) {
  console.error(
    '❌ CRITICAL: Missing Supabase environment variables!',
    '\n📝 Please create/update .env file with:',
    '\n   VITE_SUPABASE_URL=your-project-url',
    '\n   VITE_SUPABASE_ANON_KEY=your-anon-key',
    '\n📍 Get these from: https://app.supabase.com/project/_/settings/api',
    '\n🔄 Then restart the dev server (npm run dev)',
    '\n',
    '\nCurrent status:',
    '\n  VITE_SUPABASE_URL:', supabaseUrl ? `✅ Set (${supabaseUrl.substring(0, 20)}...)` : '❌ MISSING',
    '\n  VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ MISSING'
  )
} else {
  console.log('✅ Supabase credentials found')
  console.log('📍 URL:', supabaseUrl.substring(0, 40) + '...')
}

// Create client even if credentials are missing (to prevent crashes)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)

if (hasCredentials) {
  console.log('✅ Supabase client initialized')
} else {
  console.error('⚠️ Supabase client created with placeholder values - app will not work!')
}
