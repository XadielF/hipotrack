import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  MessageSquare,
  FileText,
  Home,
  Settings,
  User,
  X,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  // Mock user data - in a real app this would come from authentication
  const user = {
    name: "Carlos Rodriguez",
    role: "homebuyer", // Could be: 'homebuyer', 'agent', 'lender', 'processor'
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
    notifications: 3,
  };

  // Mock notifications data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Document Approved',
      message: 'Your income verification document has been approved.',
      type: 'success',
      timestamp: '2 minutes ago',
      isRead: false,
    },
    {
      id: '2',
      title: 'New Message',
      message: 'You have a new message from your loan officer.',
      type: 'info',
      timestamp: '1 hour ago',
      isRead: false,
    },
    {
      id: '3',
      title: 'Deadline Reminder',
      message: 'Property appraisal is scheduled for tomorrow at 2:00 PM.',
      type: 'warning',
      timestamp: '3 hours ago',
      isRead: false,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    // Mark all notifications as read when bell is clicked
    if (!showNotifications) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-blue-600">Hipotrack</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative" ref={notificationRef}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={handleNotificationClick}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 text-xs text-white bg-red-500 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
              
              {/* Notification Dropdown */}
              {showNotifications && (
                <Card className="absolute right-0 top-12 w-80 max-h-96 overflow-hidden shadow-lg border z-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Notifications</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNotifications(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        <div className="space-y-1">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 border-b hover:bg-slate-50 cursor-pointer transition-colors ${
                                !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                {getNotificationIcon(notification.type)}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {notification.title}
                                    </p>
                                    <Badge variant="outline" className="text-xs">
                                      {notification.timestamp}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {notification.message}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p>No notifications</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

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
