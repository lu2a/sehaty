pregnancy_records: {
  Row: {
    id: string
    user_id: string
    last_period_date: string
    expected_due_date: string | null
    current_week: number | null
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    user_id: string
    last_period_date: string
    expected_due_date?: string | null
    current_week?: number | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    user_id?: string
    last_period_date?: string
    expected_due_date?: string | null
    current_week?: number | null
    created_at?: string
    updated_at?: string
  }
}
