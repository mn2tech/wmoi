export interface Church {
  id: string
  name: string
  location?: string
  pastor_name: string
  pastor_phone?: string
  pastor_email?: string
  pastor_photo_url?: string
  attendance?: number
  tithes?: number
  created_at: string
}

export interface Member {
  id?: string
  church_id: string
  name: string
  age?: number
  gender?: string
  role?: string
  created_at?: string
}

export interface MemberFormData {
  name: string
  age: string
  gender: string
  role: string
}
