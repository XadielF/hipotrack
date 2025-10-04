import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Bell,
  MessageSquare,
  FileText,
  Home,
  Settings,
  User,
  ChevronRight,
  AlertCircle,
} from "lucide-react"
import MortgageTimeline from "./MortgageTimeline"
import DocumentManager from "./DocumentManager"
import MessagingSystem from "./MessagingSystem"
import CostBreakdown from "./CostBreakdown"
import {
  fetchAuthenticatedUser,
  fetchLoanProgress,
  fetchTimelineStages,
  fetchCostFigures,
} from "@/lib/dashboard-data"
import type {
  CostFigures,
  DashboardUser,
  LoanProgressSummary,
  TimelineStage,
} from "@/types/dashboard"

const HomePage = () => {
  const [user, setUser] = React.useState<DashboardUser | null>(null)
  const [loanData, setLoanData] = React.useState<LoanProgressSummary | null>(null)
  const [timelineStages, setTimelineStages] = React.useState<TimelineStage[]>([])
  const [costFigures, setCostFigures] = React.useState<CostFigures | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [globalError, setGlobalError] = React.useState<string | null>(null)
  const [userError, setUserError] = React.useState<string | null>(null)
  const [loanError, setLoanError] = React.useState<string | null>(null)
  const [timelineError, setTimelineError] = React.useState<string | null>(null)
  const [costError, setCostError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let isMounted = true

    const loadDashboardData = async () => {
      setLoading(true)
      setGlobalError(null)
      setUserError(null)
      setLoanError(null)
      setTimelineError(null)
      setCostError(null)

      const results = await Promise.allSettled([
        fetchAuthenticatedUser(),
        fetchLoanProgress(),
        fetchTimelineStages(),
        fetchCostFigures(),
      ])

      if (!isMounted) {
        return
      }

      const errors: string[] = []

      const [userResult, loanResult, timelineResult, costResult] = results

      if (userResult.status === "fulfilled") {
        setUser(userResult.value)
        setUserError(null)
      } else {
        const message =
          userResult.reason instanceof Error
            ? userResult.reason.message
            : "Unable to load user information."
        errors.push(message)
        setUserError(message)
      }

      if (loanResult.status === "fulfilled") {
        setLoanData(loanResult.value)
        setLoanError(null)
      } else {
        const message =
          loanResult.reason instanceof Error
            ? loanResult.reason.message
            : "Unable to load loan progress."
        errors.push(message)
        setLoanError(message)
      }

      if (timelineResult.status === "fulfilled") {
        setTimelineStages(timelineResult.value)
        setTimelineError(null)
      } else {
        const message =
          timelineResult.reason instanceof Error
            ? timelineResult.reason.message
            : "Unable to load timeline stages."
        errors.push(message)
        setTimelineError(message)
      }

      if (costResult.status === "fulfilled") {
        setCostFigures(costResult.value)
        setCostError(null)
      } else {
        const message =
          costResult.reason instanceof Error
            ? costResult.reason.message
            : "Unable to load cost breakdown data."
        errors.push(message)
        setCostError(message)
      }

      setGlobalError(errors.length ? errors.join(" ") : null)
      setLoading(false)
    }

    void loadDashboardData()

    return () => {
      isMounted = false
    }
  }, [])

  const notificationCount = user?.notificationCount ?? 0
  const userName = user?.name ?? "Guest"
  const userRole = user?.role ?? ""
  const userAvatar = user?.avatarUrl ?? undefined

  const loanProgress = loanData?.progress ?? 0
  const currentStageName = loanData?.currentStageName ?? loanData?.status ?? "—"

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-blue-600">Hipotrack</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 text-xs text-white bg-red-500 rounded-full">
                  {notificationCount}
                </span>
              )}
            </Button>

            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="hidden text-sm md:block">
                <p className="font-medium">
                  {loading ? "Loading..." : userName}
                </p>
                <p className="text-xs text-slate-500 capitalize">
                  {loading
                    ? ""
                    : userError
                      ? "User info unavailable"
                      : userRole || ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container px-4 py-6 mx-auto">
        {globalError && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{globalError}</span>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-3 lg:col-span-2">
            <div className="sticky top-20">
              <nav className="space-y-1">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Home className="w-5 h-5" />
                    <span>Dashboard</span>
                  </div>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Documents</span>
                  </div>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>Messages</span>
                  </div>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </div>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <div className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </div>
                </Button>
              </nav>
            </div>
          </div>

          <div className="col-span-12 md:col-span-9 lg:col-span-10">
            <Card className="mb-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      {loading ? "Welcome back" : `Welcome back, ${userName}`}
                    </h2>
                    <p className="text-blue-100">
                      {loading
                        ? "Loading your mortgage application..."
                        : loanError
                          ? loanError
                          : `Your mortgage application is ${loanProgress}% complete`}
                    </p>
                    <p className="text-blue-100 mt-1">
                      {loading
                        ? "Retrieving current stage..."
                        : loanError
                          ? "Current stage unavailable."
                          : `Current stage: ${currentStageName}`}
                    </p>
                  </div>
                  <Button className="mt-4 md:mt-0 bg-white text-blue-800 hover:bg-blue-50">
                    View Details <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Mortgage Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <MortgageTimeline
                  stages={timelineStages}
                  currentStageId={loanData?.currentStageId}
                  progress={loanProgress}
                  isLoading={loading && !timelineStages.length && !timelineError}
                  error={timelineError}
                />
              </CardContent>
            </Card>

            <Tabs defaultValue="documents" className="mb-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
                <TabsTrigger value="costs">Cost Breakdown</TabsTrigger>
              </TabsList>

              <TabsContent value="documents" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Document Manager</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DocumentManager />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="messages" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Messaging System</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MessagingSystem />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="costs" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Cost Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CostBreakdown
                      data={costFigures}
                      isLoading={loading && !costFigures && !costError}
                      error={costError}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
