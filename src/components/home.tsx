import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import MortgageTimeline from "./MortgageTimeline";
import DocumentManager from "./DocumentManager";
import MessagingSystem from "./MessagingSystem";
import CostBreakdown from "./CostBreakdown";

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
    <div>
            {/* Welcome Card */}
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
                    <MessagingSystem currentUser={messagingUser} />
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
  )
}

export default HomePage
