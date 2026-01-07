export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
messages: {
  Row: {
    id: string
    consultation_id: string
    sender_id: string
    content: string
    is_read: boolean
    reactions: { [key: string]: string[] } | null // المفتاح هو الايموجي، والقيمة مصفوفة بمن ضغطوا عليه
    created_at: string
  }
  Insert: {
    id?: string
    consultation_id: string
    sender_id: string
    content: string
    is_read?: boolean
    reactions?: { [key: string]: string[] } | null
    created_at?: string
  }
  Update: {
    id?: string
    consultation_id?: string
    sender_id?: string
    content?: string
    is_read?: boolean
    reactions?: { [key: string]: string[] } | null
    created_at?: string
  }
}
      profiles: {
        Row: {
          id: string
          role: 'admin' | 'dept_head' | 'doctor' | 'client' | 'visitor'
          full_name: string | null
          email: string | null
          phone: string | null
          avatar_url: string | null
          is_suspended: boolean
          created_at: string
        }
        Insert: {
          id: string
          role?: 'admin' | 'dept_head' | 'doctor' | 'client' | 'visitor'
          full_name?: string | null
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          is_suspended?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'dept_head' | 'doctor' | 'client' | 'visitor'
          full_name?: string | null
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          is_suspended?: boolean
          created_at?: string
        }
      }
      clinics: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      doctors: {
        Row: {
          id: string
          clinic_id: string | null
          doctor_number: string | null
          national_id: string | null
          specialty: string | null
          bio: string | null
          consultation_rate: number | null
          is_active: boolean
          verified_at: string | null
          created_at: string
        }
        Insert: {
          id: string
          clinic_id?: string | null
          doctor_number?: string | null
          national_id?: string | null
          specialty?: string | null
          bio?: string | null
          consultation_rate?: number | null
          is_active?: boolean
          verified_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string | null
          doctor_number?: string | null
          national_id?: string | null
          specialty?: string | null
          bio?: string | null
          consultation_rate?: number | null
          is_active?: boolean
          verified_at?: string | null
          created_at?: string
        }
      }
      medical_files: {
        Row: {
          id: string
          user_id: string
          full_name: string
          relation: 'self' | 'son' | 'daughter' | 'wife' | 'husband' | 'father' | 'mother' | 'brother' | 'sister' | 'other'
          birth_date: string | null
          gender: 'male' | 'female' | null
          blood_type: string | null
          chronic_diseases: Json
          allergies: Json
          surgeries: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          relation?: 'self' | 'son' | 'daughter' | 'wife' | 'husband' | 'father' | 'mother' | 'brother' | 'sister' | 'other'
          birth_date?: string | null
          gender?: 'male' | 'female' | null
          blood_type?: string | null
          chronic_diseases?: Json
          allergies?: Json
          surgeries?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          relation?: 'self' | 'son' | 'daughter' | 'wife' | 'husband' | 'father' | 'mother' | 'brother' | 'sister' | 'other'
          birth_date?: string | null
          gender?: 'male' | 'female' | null
          blood_type?: string | null
          chronic_diseases?: Json
          allergies?: Json
          surgeries?: Json
          created_at?: string
          updated_at?: string
        }
      }
      consultations: {
        Row: {
          id: string
          user_id: string
          medical_file_id: string
          doctor_id: string | null
          clinic_id: string | null
          content: string
          voice_url: string | null
          images_urls: string[] | null
          ai_preliminary_analysis: string | null
          urgency: 'low' | 'medium' | 'high' | 'critical'
          doctor_reply: string | null
          diagnosis: string | null
          status: 'pending' | 'active' | 'referred' | 'passed' | 'closed' | 'reported'
          is_locked: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          medical_file_id: string
          doctor_id?: string | null
          clinic_id?: string | null
          content: string
          voice_url?: string | null
          images_urls?: string[] | null
          ai_preliminary_analysis?: string | null
          urgency?: 'low' | 'medium' | 'high' | 'critical'
          doctor_reply?: string | null
          diagnosis?: string | null
          status?: 'pending' | 'active' | 'referred' | 'passed' | 'closed' | 'reported'
          is_locked?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          medical_file_id?: string
          doctor_id?: string | null
          clinic_id?: string | null
          content?: string
          voice_url?: string | null
          images_urls?: string[] | null
          ai_preliminary_analysis?: string | null
          urgency?: 'low' | 'medium' | 'high' | 'critical'
          doctor_reply?: string | null
          diagnosis?: string | null
          status?: 'pending' | 'active' | 'referred' | 'passed' | 'closed' | 'reported'
          is_locked?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}