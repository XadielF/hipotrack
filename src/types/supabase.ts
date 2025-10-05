export type ProfileRow = {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: string | null
  notification_count: number | null
}

export type LoanProgressRow = {
  id: string
  loan_id: string
  status: string | null
  current_stage_id: string | null
  current_stage_name: string | null
  progress_percentage: number | null
  pending_tasks: number | null
  agent_name: string | null
  lender_name: string | null
  processor_name: string | null
  loan_amount: number | null
  down_payment: number | null
  total_cost: number | null
  monthly_payment: number | null
}

export type TimelineTaskRow = {
  id: string
  name: string
  completed: boolean | null
  deadline: string | null
}

export type TimelineStageRow = {
  id: string
  loan_id: string
  name: string
  status: "completed" | "in-progress" | "pending"
  description: string | null
  tasks: TimelineTaskRow[] | null
  position: number | null
}

export type CostItemRow = {
  id: string
  loan_id: string
  category: "closing" | "tax" | "insurance" | "fee"
  name: string
  amount: number
  description: string | null
  is_paid: boolean | null
}

export type CostSummaryRow = {
  loan_id: string
  loan_amount: number | null
  down_payment: number | null
  total_cost: number | null
  monthly_payment: number | null
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
      }
      loan_progress: {
        Row: LoanProgressRow
      }
      loan_timeline_stages: {
        Row: TimelineStageRow
      }
      loan_cost_items: {
        Row: CostItemRow
      }
    }
    Views: {
      loan_cost_summary: {
        Row: CostSummaryRow
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
