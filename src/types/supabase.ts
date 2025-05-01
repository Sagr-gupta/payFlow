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
          name: string
          role: 'user' | 'admin' | 'accounts'
          company: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role: 'user' | 'admin' | 'accounts'
          company: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'user' | 'admin' | 'accounts'
          company?: string
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          serial_number: number
          date: string
          vendor_name: string
          total_outstanding: number
          advance_tds: number
          payment_amount: number
          balance_amount: number
          item_description: string
          bill_number: string
          bill_date: string
          requested_by: string
          approved_by: string | null
          company_name: string
          status: 'pending' | 'approved' | 'rejected' | 'processed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          serial_number?: number
          date: string
          vendor_name: string
          total_outstanding: number
          advance_tds: number
          payment_amount: number
          balance_amount: number
          item_description: string
          bill_number: string
          bill_date: string
          requested_by: string
          approved_by?: string | null
          company_name: string
          status?: 'pending' | 'approved' | 'rejected' | 'processed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          serial_number?: number
          date?: string
          vendor_name?: string
          total_outstanding?: number
          advance_tds?: number
          payment_amount?: number
          balance_amount?: number
          item_description?: string
          bill_number?: string
          bill_date?: string
          requested_by?: string
          approved_by?: string | null
          company_name?: string
          status?: 'pending' | 'approved' | 'rejected' | 'processed'
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
      [_ in never]: never
    }
  }
}