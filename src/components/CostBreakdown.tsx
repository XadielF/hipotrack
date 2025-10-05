import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { InfoIcon, DollarSign, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TablesInsert } from "@/types/supabase";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type CostItem = TablesInsert<"cost_items">;

interface CostBreakdownProps {
  loanAmount?: number;
  downPayment?: number;
  closingCosts?: CostItem[];
  taxes?: CostItem[];
  insurance?: CostItem[];
  fees?: CostItem[];
  totalCost?: number;
  monthlyPayment?: number;
}

const CostBreakdown: React.FC<CostBreakdownProps> = ({
  loanAmount = 250000,
  downPayment = 50000,
  closingCosts = [
    {
      name: "Origination Fee",
      amount: 2500,
      description: "Fee charged by the lender for processing the loan",
    },
    {
      name: "Appraisal Fee",
      amount: 500,
      description: "Cost of the home appraisal",
      isPaid: true,
    },
    {
      name: "Title Insurance",
      amount: 1200,
      description:
        "Insurance that protects the lender against problems with the title",
    },
    {
      name: "Recording Fees",
      amount: 125,
      description: "Government fees for legally recording the new deed",
    },
  ],
  taxes = [
    {
      name: "Property Tax (Annual)",
      amount: 3600,
      description: "Annual property taxes",
    },
    {
      name: "Transfer Tax",
      amount: 1500,
      description: "Tax on transferring the property title",
    },
  ],
  insurance = [
    {
      name: "Homeowner's Insurance (Annual)",
      amount: 1200,
      description: "Annual insurance premium",
    },
    {
      name: "Mortgage Insurance",
      amount: 1800,
      description: "Annual private mortgage insurance",
    },
  ],
  fees = [
    {
      name: "Attorney Fees",
      amount: 1500,
      description: "Legal fees for closing",
    },
    {
      name: "Home Inspection",
      amount: 450,
      description: "Cost of home inspection",
      isPaid: true,
    },
    {
      name: "HOA Transfer Fee",
      amount: 250,
      description: "Fee for transferring HOA membership",
    },
  ],
  totalCost = 300000,
  monthlyPayment = 1450,
}) => {
  const [activeTab, setActiveTab] = useState("summary");

  const totalClosingCosts = closingCosts.reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  const totalTaxes = taxes.reduce((sum, item) => sum + item.amount, 0);
  const totalInsurance = insurance.reduce((sum, item) => sum + item.amount, 0);
  const totalFees = fees.reduce((sum, item) => sum + item.amount, 0);

  const upfrontCosts = downPayment + totalClosingCosts + totalFees;
  const upfrontPercentage = (upfrontCosts / totalCost) * 100;

  const renderCostItems = (items: CostItem[]) => (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex justify-between items-center">
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
  );

  return (
    <Card className="w-full bg-white shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
        <CardTitle className="flex items-center text-xl text-blue-800">
          <DollarSign className="mr-2 h-6 w-6" />
          Cost Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
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
                    <div className="text-sm text-muted-foreground">
                      Purchase Price:
                    </div>
                    <div className="text-sm font-medium text-right">
                      ${totalCost.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Loan Amount:
                    </div>
                    <div className="text-sm font-medium text-right">
                      ${loanAmount.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Down Payment:
                    </div>
                    <div className="text-sm font-medium text-right">
                      ${downPayment.toLocaleString()} (
                      {Math.round((downPayment / totalCost) * 100)}%)
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
                        ${upfrontCosts.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={upfrontPercentage} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-muted-foreground">
                      Down Payment:
                    </div>
                    <div className="text-sm font-medium text-right">
                      ${downPayment.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Closing Costs:
                    </div>
                    <div className="text-sm font-medium text-right">
                      ${totalClosingCosts.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Additional Fees:
                    </div>
                    <div className="text-sm font-medium text-right">
                      ${totalFees.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Monthly Payment
                  </h3>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-center">
                      <span className="text-3xl font-bold text-blue-800">
                        ${monthlyPayment}
                      </span>
                      <p className="text-sm text-muted-foreground mt-1">
                        Estimated monthly payment
                      </p>
                    </div>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-muted-foreground">
                        Principal & Interest:
                      </div>
                      <div className="text-sm font-medium text-right">
                        ${(monthlyPayment - 300 - 150).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Property Taxes:
                      </div>
                      <div className="text-sm font-medium text-right">$300</div>
                      <div className="text-sm text-muted-foreground">
                        Insurance:
                      </div>
                      <div className="text-sm font-medium text-right">$150</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">
                      Important Note
                    </h4>
                    <p className="text-sm text-amber-700">
                      These are estimated costs and may change during the
                      mortgage process. Final costs will be confirmed before
                      closing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="closing" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Closing Costs</h3>
              {renderCostItems(closingCosts)}
              <div className="flex justify-between mt-4 pt-2 border-t">
                <span className="font-semibold">Total Closing Costs</span>
                <span className="font-bold">
                  ${totalClosingCosts.toLocaleString()}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Taxes</h3>
              {renderCostItems(taxes)}
              <div className="flex justify-between mt-4 pt-2 border-t">
                <span className="font-semibold">Total Taxes</span>
                <span className="font-bold">
                  ${totalTaxes.toLocaleString()}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Additional Fees</h3>
              {renderCostItems(fees)}
              <div className="flex justify-between mt-4 pt-2 border-t">
                <span className="font-semibold">Total Additional Fees</span>
                <span className="font-bold">${totalFees.toLocaleString()}</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-6">
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-center mb-6">
                <span className="text-4xl font-bold text-blue-800">
                  ${monthlyPayment}
                </span>
                <p className="text-sm text-muted-foreground mt-1">
                  Estimated monthly payment
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">
                      Principal & Interest
                    </span>
                    <span className="text-sm font-medium">
                      ${(monthlyPayment - 300 - 150).toLocaleString()}
                    </span>
                  </div>
                  <Progress value={69} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Property Taxes</span>
                    <span className="text-sm font-medium">$300</span>
                  </div>
                  <Progress value={21} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Insurance</span>
                    <span className="text-sm font-medium">$150</span>
                  </div>
                  <Progress value={10} className="h-2" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Insurance Costs</h3>
              {renderCostItems(insurance)}
              <div className="flex justify-between mt-4 pt-2 border-t">
                <span className="font-semibold">Total Insurance Costs</span>
                <span className="font-bold">
                  ${totalInsurance.toLocaleString()}
                </span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Loan Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Purchase Price
                    </span>
                    <span className="font-medium">
                      ${totalCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Loan Amount</span>
                    <span className="font-medium">
                      ${loanAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Down Payment</span>
                    <span className="font-medium">
                      ${downPayment.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Down Payment Percentage
                    </span>
                    <span className="font-medium">
                      {Math.round((downPayment / totalCost) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Total Costs</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Closing Costs</span>
                    <span className="font-medium">
                      ${totalClosingCosts.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxes</span>
                    <span className="font-medium">
                      ${totalTaxes.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Insurance</span>
                    <span className="font-medium">
                      ${totalInsurance.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Additional Fees
                    </span>
                    <span className="font-medium">
                      ${totalFees.toLocaleString()}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Upfront Costs</span>
                    <span className="font-bold">
                      ${upfrontCosts.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                All Costs Breakdown
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Closing Costs</h4>
                  {renderCostItems(closingCosts)}
                </div>
                <div>
                  <h4 className="font-medium mb-2">Taxes</h4>
                  {renderCostItems(taxes)}
                </div>
                <div>
                  <h4 className="font-medium mb-2">Insurance</h4>
                  {renderCostItems(insurance)}
                </div>
                <div>
                  <h4 className="font-medium mb-2">Additional Fees</h4>
                  {renderCostItems(fees)}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CostBreakdown;
