import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  MessageSquare,
  FileText,
  Home,
  Settings,
  User,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Mock user data - in a real app this would come from authentication
  const user = {
    name: "Carlos Rodriguez",
    role: "homebuyer", // Could be: 'homebuyer', 'agent', 'lender', 'processor'
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
    notifications: 3,
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

            <Link to="/profile" className="flex items-center space-x-2 hover:bg-slate-50 rounded-lg p-2 transition-colors">
              <Avatar>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="hidden text-sm md:block">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
              </div>
            </Link>
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
                  className={`w-full justify-start ${location.pathname === "/" ? "text-blue-600 bg-blue-50" : ""}`}
                  asChild
                >
                  <Link to="/" className="flex items-center space-x-2">
                    <Home className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${location.pathname === "/documents" ? "text-blue-600 bg-blue-50" : ""}`}
                  asChild
                >
                  <Link to="/documents" className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Documents</span>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${location.pathname === "/messages" ? "text-blue-600 bg-blue-50" : ""}`}
                  asChild
                >
                  <Link to="/messages" className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>Messages</span>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${location.pathname === "/profile" ? "text-blue-600 bg-blue-50" : ""}`}
                  asChild
                >
                  <Link to="/profile" className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${location.pathname === "/settings" ? "text-blue-600 bg-blue-50" : ""}`}
                  asChild
                >
                  <Link to="/settings" className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </Link>
                </Button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-12 md:col-span-9 lg:col-span-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
