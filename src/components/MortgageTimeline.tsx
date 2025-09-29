import React from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

type TimelineStage = {
  id: string;
  name: string;
  status: "completed" | "in-progress" | "pending";
  tasks: {
    id: string;
    name: string;
    completed: boolean;
    deadline?: string;
  }[];
  description: string;
};

type MortgageTimelineProps = {
  stages?: TimelineStage[];
  currentStageId?: string;
  progress?: number;
};

const MortgageTimeline = ({
  stages = defaultStages,
  currentStageId = "approval",
  progress = 35,
}: MortgageTimelineProps) => {
  const [expandedStage, setExpandedStage] = React.useState<string | null>(
    currentStageId,
  );

  const toggleStage = (stageId: string) => {
    setExpandedStage(expandedStage === stageId ? null : stageId);
  };

  const getStatusIcon = (status: TimelineStage["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "pending":
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TimelineStage["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        );
      case "in-progress":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            In Progress
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="text-gray-500">
            Pending
          </Badge>
        );
    }
  };

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

        <div className="relative">
          {/* Timeline connector line */}
          <div className="absolute left-[22px] top-8 bottom-8 w-0.5 bg-gray-200"></div>

          {/* Timeline stages */}
          <div className="space-y-6">
            {stages.map((stage, index) => (
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

                {/* Expanded content */}
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
      </CardContent>
    </Card>
  );
};

// Default mock data
const defaultStages: TimelineStage[] = [
  {
    id: "pre-approval",
    name: "Pre-Approval",
    status: "completed",
    description: "Initial qualification for mortgage financing",
    tasks: [
      { id: "t1", name: "Submit financial documents", completed: true },
      { id: "t2", name: "Credit check", completed: true },
      { id: "t3", name: "Receive pre-approval letter", completed: true },
    ],
  },
  {
    id: "approval",
    name: "Loan Application",
    status: "in-progress",
    description: "Formal mortgage application process",
    tasks: [
      { id: "t4", name: "Complete loan application", completed: true },
      { id: "t5", name: "Submit income verification", completed: true },
      {
        id: "t6",
        name: "Property appraisal",
        completed: false,
        deadline: "Jun 15, 2023",
      },
      { id: "t7", name: "Underwriting review", completed: false },
    ],
  },
  {
    id: "processing",
    name: "Loan Processing",
    status: "pending",
    description: "Review and verification of all documentation",
    tasks: [
      { id: "t8", name: "Document verification", completed: false },
      { id: "t9", name: "Title search", completed: false },
      { id: "t10", name: "Insurance verification", completed: false },
    ],
  },
  {
    id: "closing",
    name: "Closing",
    status: "pending",
    description: "Final review and signing of loan documents",
    tasks: [
      { id: "t11", name: "Final walkthrough", completed: false },
      { id: "t12", name: "Closing disclosure review", completed: false },
      { id: "t13", name: "Sign closing documents", completed: false },
      { id: "t14", name: "Funding and key transfer", completed: false },
    ],
  },
];

export default MortgageTimeline;
