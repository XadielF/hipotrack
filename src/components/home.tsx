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
  // Mock user data - in a real app this would come from authentication
  const user = {
    name: "Carlos Rodriguez",
    role: "homebuyer", // Could be: 'homebuyer', 'agent', 'lender', 'processor'
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
    notifications: 3,
  };

  // Mock loan data
  const loanData = {
    id: "LOAN-2023-001",
    status: "In Progress",
    currentStage: "Document Review",
    progress: 45, // percentage
    pendingTasks: 2,
    agent: "Maria Lopez",
    lender: "First National Bank",
    processor: "John Smith",
  };

  return (
    <div>
            {/* Welcome Card */}
            <Card className="mb-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      Welcome back, {user.name}
                    </h2>
                    <p className="text-blue-100">
                      Your mortgage application is {loanData.progress}% complete
                    </p>
                    <p className="text-blue-100 mt-1">
                      Current stage: {loanData.currentStage}
                    </p>
                  </div>
                  <Button className="mt-4 md:mt-0 bg-white text-blue-800 hover:bg-blue-50">
                    View Details <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Mortgage Timeline */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Mortgage Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <MortgageTimeline />
              </CardContent>
            </Card>

            {/* Tabs for other sections */}
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
                    <CostBreakdown />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
    </div>
  );
};

export default HomePage;
