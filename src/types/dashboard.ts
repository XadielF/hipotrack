export type DashboardUser = {
  id: string
  name: string
  role: string | null
  email: string | null
  avatarUrl: string | null
  notificationCount: number
}

export type LoanProgressSummary = {
  loanId: string
  status: string | null
  currentStageId: string | null
  currentStageName: string | null
  progress: number
  pendingTasks: number
  agentName: string | null
  lenderName: string | null
  processorName: string | null
  loanAmount: number
  downPayment: number
  totalCost: number
  monthlyPayment: number
}

export type TimelineTask = {
  id: string
  name: string
  completed: boolean
  deadline?: string | null
}

export type TimelineStage = {
  id: string
  name: string
  status: "completed" | "in-progress" | "pending"
  tasks: TimelineTask[]
  description: string
}

export type CostItem = {
  id?: string
  name: string
  amount: number
  description?: string | null
  isPaid?: boolean | null
}

export type CostFigures = {
  loanAmount: number
  downPayment: number
  closingCosts: CostItem[]
  taxes: CostItem[]
  insurance: CostItem[]
  fees: CostItem[]
  totalCost: number
  monthlyPayment: number
}
