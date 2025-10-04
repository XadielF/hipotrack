import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { InfoIcon, DollarSign, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { CostFigures, CostItem } from "@/types/dashboard"

interface CostBreakdownProps {
  data?: CostFigures | null
  isLoading?: boolean
  error?: string | null
}

const CostBreakdown: React.FC<CostBreakdownProps> = ({
  data,
  isLoading = false,
  error = null,
}) => {
  const [activeTab, setActiveTab] = useState("summary")

  const closingCosts = data?.closingCosts ?? []
  const taxes = data?.taxes ?? []
  const insurance = data?.insurance ?? []
  const fees = data?.fees ?? []

  const totalClosingCosts = closingCosts.reduce((sum, item) => sum + item.amount, 0)
  const totalTaxes = taxes.reduce((sum, item) => sum + item.amount, 0)
  const totalInsurance = insurance.reduce((sum, item) => sum + item.amount, 0)
  const totalFees = fees.reduce((sum, item) => sum + item.amount, 0)

  const upfrontCosts =
    (data?.downPayment ?? 0) + totalClosingCosts + totalFees
  const upfrontPercentage = data?.totalCost
    ? (upfrontCosts / data.totalCost) * 100
    : 0
  const downPaymentPercentage = data?.totalCost
    ? Math.round((data.downPayment / data.totalCost) * 100)
    : 0

  const renderCostItems = (items: CostItem[]) => (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id ?? item.name} className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="font-medium">{item.name}</span>
            {item.isPaid && (
              <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
                Paid
              </Badge>
            )}
            {item.description && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <span className="font-semibold">${item.amount.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
          Loading cost breakdown...
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-6 text-sm text-red-500">
          <AlertCircle className="mr-2 h-4 w-4" />
          {error}
        </div>
      )
    }

    if (!data) {
      return (
        <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
          No cost breakdown data available.
        </div>
      )
    }

    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="closing">Closing Costs</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Payment</TabsTrigger>
          <TabsTrigger value="all">All Costs</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Loan Overview</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-muted-foreground">Purchase Price:</div>
                  <div className="text-sm font-medium text-right">
                    ${data.totalCost.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Loan Amount:</div>
                  <div className="text-sm font-medium text-right">
                    ${data.loanAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Down Payment:</div>
                  <div className="text-sm font-medium text-right">
                    ${data.downPayment.toLocaleString()} ({
                      downPaymentPercentage
                    }%)
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Upfront Costs</h3>
                <div className="mb-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-muted-foreground">
                      Progress
                    </span>
                    <span className="text-sm font-medium">
                      {Math.round(upfrontPercentage)}%
                    </span>
                  </div>
                  <Progress value={upfrontPercentage} className="h-2" />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Down Payment</span>
                    <span>${data.downPayment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Closing Costs</span>
                    <span>${totalClosingCosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fees</span>
                    <span>${totalFees.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Monthly Payment</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">Estimated Monthly Payment</span>
                    <span className="text-2xl font-bold text-blue-800">
                      ${data.monthlyPayment.toLocaleString()}
                    </span>
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-2 text-sm text-blue-700">
                    <div className="flex justify-between">
                      <span>Principal & Interest</span>
                      <span>
                        ${
                          (data.monthlyPayment - totalTaxes / 12 - totalInsurance / 12).toLocaleString()
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxes</span>
                      <span>${Math.round(totalTaxes / 12).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Insurance</span>
                      <span>${Math.round(totalInsurance / 12).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Tax & Insurance Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Annual Taxes</span>
                    <span>${totalTaxes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Annual Insurance</span>
                    <span>${totalInsurance.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="closing" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Closing Costs</h3>
            {renderCostItems(closingCosts)}
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Monthly Mortgage Payment</span>
              <span>${data.monthlyPayment.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Monthly Taxes</span>
              <span>${Math.round(totalTaxes / 12).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Monthly Insurance</span>
              <span>${Math.round(totalInsurance / 12).toLocaleString()}</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">All Costs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-semibold mb-2">Closing Costs</h4>
                {renderCostItems(closingCosts)}
              </div>
              <div>
                <h4 className="text-md font-semibold mb-2">Fees</h4>
                {renderCostItems(fees)}
              </div>
              <div>
                <h4 className="text-md font-semibold mb-2">Taxes</h4>
                {renderCostItems(taxes)}
              </div>
              <div>
                <h4 className="text-md font-semibold mb-2">Insurance</h4>
                {renderCostItems(insurance)}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    )
  }

  return (
    <Card className="w-full bg-white shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
        <CardTitle className="flex items-center text-xl text-blue-800">
          <DollarSign className="mr-2 h-6 w-6" />
          Cost Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">{renderContent()}</CardContent>
    </Card>
  )
}

export default CostBreakdown
