import React from "react"
import type { TimelineStage } from "@/types/dashboard"
import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { Button } from "./ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"
import {
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  ChevronDown,
} from "lucide-react"

type MortgageTimelineProps = {
  stages?: TimelineStage[]
  currentStageId?: string | null
  progress?: number
  isLoading?: boolean
  error?: string | null
}

const MortgageTimeline = ({
  stages,
  currentStageId,
  progress = 0,
  isLoading = false,
  error = null,
}: MortgageTimelineProps) => {
  const [expandedStage, setExpandedStage] = React.useState<string | null>(
    currentStageId ?? null,
  )

  React.useEffect(() => {
    setExpandedStage(currentStageId ?? null)
  }, [currentStageId])

  const timelineStages = stages ?? []

  const toggleStage = (stageId: string) => {
    setExpandedStage(expandedStage === stageId ? null : stageId)
  }

  const getStatusIcon = (status: TimelineStage["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "pending":
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: TimelineStage["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        )
      case "in-progress":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            In Progress
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="text-gray-500">
            Pending
          </Badge>
        )
    }
  }

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Mortgage Timeline
            </h2>
            <p className="text-gray-500">
              Track your mortgage application progress
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Overall Progress</div>
            <div className="flex items-center gap-3">
              <Progress value={progress} className="w-40 h-2" />
              <span className="text-sm font-medium">{progress}%</span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-6 text-center text-sm text-gray-500">
            Loading mortgage timeline...
          </div>
        ) : error ? (
          <div className="py-6 text-center text-sm text-red-500">{error}</div>
        ) : timelineStages.length === 0 ? (
          <div className="py-6 text-center text-sm text-gray-500">
            No timeline stages available.
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-[22px] top-8 bottom-8 w-0.5 bg-gray-200"></div>

            <div className="space-y-6">
              {timelineStages.map((stage) => (
                <div key={stage.id} className="relative">
                  <div
                    className={`flex items-start gap-4 cursor-pointer ${expandedStage === stage.id ? "mb-4" : ""}`}
                    onClick={() => toggleStage(stage.id)}
                  >
                    <div
                      className={`rounded-full p-1 z-10 ${stage.status === "completed" ? "bg-green-100" : stage.status === "in-progress" ? "bg-blue-100" : "bg-gray-100"}`}
                    >
                      {getStatusIcon(stage.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-800">
                            {stage.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {stage.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(stage.status)}
                          {expandedStage === stage.id ? (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {expandedStage === stage.id && (
                    <div className="ml-12 pl-4 border-l border-dashed border-gray-200">
                      <div className="space-y-3">
                        {stage.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center ${task.completed ? "bg-green-500" : "bg-gray-200"}`}
                              >
                                {task.completed && (
                                  <CheckCircle className="h-4 w-4 text-white" />
                                )}
                              </div>
                              <span
                                className={`${task.completed ? "text-gray-600" : "text-gray-800"}`}
                              >
                                {task.name}
                              </span>
                            </div>
                            {task.deadline && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {task.deadline}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Deadline</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        ))}
                      </div>

                      {stage.status !== "completed" && (
                        <div className="mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            View Details
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default MortgageTimeline
