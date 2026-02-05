export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'manager' | 'user' | 'staff' | 'client'
          module_permissions: Record<string, 'read' | 'write' | 'none'>
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'manager' | 'user' | 'staff' | 'client'
          module_permissions?: Record<string, 'read' | 'write' | 'none'>
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'manager' | 'user' | 'staff' | 'client'
          module_permissions?: Record<string, 'read' | 'write' | 'none'>
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'manager' | 'user' | 'staff' | 'client'
    }
  }
}

export type ModulePermission = {
  moduleId: string
  accessLevel: 'read' | 'write' | 'none'
}


