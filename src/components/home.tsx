import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Bell,
  MessageSquare,
  FileText,
  Home,
  Settings,
  User,
  ChevronRight,
} from "lucide-react";
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-blue-600">Hipotrack</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {user.notifications > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 text-xs text-white bg-red-500 rounded-full">
                  {user.notifications}
                </span>
              )}
            </Button>

            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="hidden text-sm md:block">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container px-4 py-6 mx-auto">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-3 lg:col-span-2">
            <div className="sticky top-20">
              <nav className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Home className="w-5 h-5" />
                    <span>Dashboard</span>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Documents</span>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>Messages</span>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  <div className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </div>
                </Button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-12 md:col-span-9 lg:col-span-10">
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
        </div>
      </div>
    </div>
  );
};

export default HomePage;
