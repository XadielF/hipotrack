import { getSupabaseClient } from "@/lib/supabaseClient"
import type {
  CostItem,
  CostFigures,
  DashboardUser,
  LoanProgressSummary,
  TimelineStage,
  TimelineTask,
} from "@/types/dashboard"
import type {
  CostItemRow,
  CostSummaryRow,
  LoanProgressRow,
  TimelineStageRow,
  TimelineTaskRow,
} from "@/types/supabase"

function mapTimelineTasks(tasks: TimelineTaskRow[] | null): TimelineTask[] {
  if (!Array.isArray(tasks)) {
    return []
  }

  return tasks.map((task) => ({
    id: task.id,
    name: task.name,
    completed: Boolean(task.completed),
    deadline: task.deadline ?? undefined,
  }))
}

function mapTimelineStage(row: TimelineStageRow): TimelineStage {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    description: row.description ?? "",
    tasks: mapTimelineTasks(row.tasks),
  }
}

function mapCostItem(row: CostItemRow): CostItem {
  return {
    id: row.id,
    name: row.name,
    amount: row.amount,
    description: row.description ?? undefined,
    isPaid: row.is_paid ?? undefined,
  }
}

function resolveLoanProgress(row: LoanProgressRow | null): LoanProgressSummary | null {
  if (!row) {
    return null
  }

  return {
    loanId: row.loan_id,
    status: row.status,
    currentStageId: row.current_stage_id,
    currentStageName: row.current_stage_name,
    progress: row.progress_percentage ?? 0,
    pendingTasks: row.pending_tasks ?? 0,
    agentName: row.agent_name,
    lenderName: row.lender_name,
    processorName: row.processor_name,
    loanAmount: row.loan_amount ?? 0,
    downPayment: row.down_payment ?? 0,
    totalCost: row.total_cost ?? 0,
    monthlyPayment: row.monthly_payment ?? 0,
  }
}

function resolveCostFigures(
  summary: CostSummaryRow | null,
  items: CostItemRow[] | null,
): CostFigures | null {
  if (!summary && (!items || items.length === 0)) {
    return null
  }

  const grouped = {
    closing: [] as CostItem[],
    tax: [] as CostItem[],
    insurance: [] as CostItem[],
    fee: [] as CostItem[],
  }

  if (items) {
    items.forEach((item) => {
      const key = item.category
      if (grouped[key]) {
        grouped[key].push(mapCostItem(item))
      }
    })
  }

  return {
    loanAmount: summary?.loan_amount ?? 0,
    downPayment: summary?.down_payment ?? 0,
    totalCost: summary?.total_cost ?? 0,
    monthlyPayment: summary?.monthly_payment ?? 0,
    closingCosts: grouped.closing,
    taxes: grouped.tax,
    insurance: grouped.insurance,
    fees: grouped.fee,
  }
}

export async function fetchAuthenticatedUser(): Promise<DashboardUser | null> {
  const supabase = getSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!user) {
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, role, notification_count")
    .eq("id", user.id)
    .maybeSingle()

  if (profileError) {
    throw profileError
  }

  return {
    id: user.id,
    email: user.email ?? null,
    name: profile?.full_name ?? user.email ?? "",
    role: profile?.role ?? null,
    avatarUrl: profile?.avatar_url ?? null,
    notificationCount: profile?.notification_count ?? 0,
  }
}

export async function fetchLoanProgress(
  loanId?: string,
): Promise<LoanProgressSummary | null> {
  const supabase = getSupabaseClient()
  if (loanId) {
    const { data, error } = await supabase
      .from("loan_progress")
      .select("*")
      .eq("loan_id", loanId)
      .maybeSingle()

    if (error) {
      throw error
    }

    return resolveLoanProgress(data)
  }

  const { data, error } = await supabase
    .from("loan_progress")
    .select("*")
    .limit(1)

  if (error) {
    throw error
  }

  const row = Array.isArray(data) ? data[0] : null
  return resolveLoanProgress(row ?? null)
}

export async function fetchTimelineStages(
  loanId?: string,
): Promise<TimelineStage[]> {
  const supabase = getSupabaseClient()
  let query = supabase.from("loan_timeline_stages").select("*")

  if (loanId) {
    query = query.eq("loan_id", loanId)
  }

  const { data, error } = await query.order("position", { ascending: true })

  if (error) {
    throw error
  }

  if (!data) {
    return []
  }

  return data.map(mapTimelineStage)
}

export async function fetchCostFigures(
  loanId?: string,
): Promise<CostFigures | null> {
  const supabase = getSupabaseClient()
  let summaryQuery = supabase.from("loan_cost_summary").select("*")
  let itemsQuery = supabase.from("loan_cost_items").select("*")

  if (loanId) {
    summaryQuery = summaryQuery.eq("loan_id", loanId)
    itemsQuery = itemsQuery.eq("loan_id", loanId)
  }

  const [{ data: summaryData, error: summaryError }, { data: itemsData, error: itemsError }] =
    await Promise.all([summaryQuery.limit(1), itemsQuery])

  if (summaryError) {
    throw summaryError
  }

  if (itemsError) {
    throw itemsError
  }

  const summaryRow = Array.isArray(summaryData) ? summaryData[0] : summaryData ?? null
  return resolveCostFigures(summaryRow ?? null, itemsData ?? null)
}
