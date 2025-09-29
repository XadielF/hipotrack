import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAuth } from './AuthProvider';
import { 
  Shield, 
  Clock, 
  LogOut, 
  RefreshCw, 
  AlertTriangle,
  User,
  Activity,
  Lock
} from 'lucide-react';

const SecurityDashboard: React.FC = () => {
  const { user, logout, sessionTimeRemaining, refreshSession, hasPermission } = useAuth();
  const [activityLogs, setActivityLogs] = useState([
    {
      id: '1',
      action: 'Document Upload',
      timestamp: '2024-01-15T10:30:00Z',
      ip: '192.168.1.100',
      status: 'success'
    },
    {
      id: '2',
      action: 'Profile Update',
      timestamp: '2024-01-15T09:15:00Z',
      ip: '192.168.1.100',
      status: 'success'
    },
    {
      id: '3',
      action: 'Failed Login Attempt',
      timestamp: '2024-01-14T22:45:00Z',
      ip: '203.0.113.45',
      status: 'failed'
    }
  ]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getRoleColor = (role: string) => {
    const colors = {
      homebuyer: 'bg-blue-100 text-blue-800',
      agent: 'bg-green-100 text-green-800',
      lender: 'bg-purple-100 text-purple-800',
      processor: 'bg-orange-100 text-orange-800',
      admin: 'bg-red-100 text-red-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    return status === 'success' ? 'text-green-600' : 'text-red-600';
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Dashboard</h1>
          <p className="text-gray-600">Monitor your account security and activity</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Session Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Session Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatTime(sessionTimeRemaining)}
                </div>
                <p className="text-sm text-gray-500">Time remaining</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Session Health</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Active
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Last Activity</span>
                  <span className="text-gray-600">Just now</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshSession}
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Extend
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={logout}
                  className="flex-1"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* User Profile Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Role</span>
                  <Badge className={getRoleColor(user.role)}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">MFA Status</span>
                  <Badge variant={user.mfaEnabled ? "default" : "destructive"}>
                    {user.mfaEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Last Login</span>
                  <span className="text-xs text-gray-600">
                    {user.lastLogin ? formatTimestamp(user.lastLogin) : 'Never'}
                  </span>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-2">Permissions</h4>
                <div className="space-y-1">
                  {user.permissions.slice(0, 3).map((permission) => (
                    <div key={permission} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-xs text-gray-600">
                        {permission.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  ))}
                  {user.permissions.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{user.permissions.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Security Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      Suspicious Login
                    </span>
                  </div>
                  <p className="text-xs text-yellow-700">
                    Failed login attempt from unknown IP address
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Yesterday at 10:45 PM
                  </p>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Password Expiry
                    </span>
                  </div>
                  <p className="text-xs text-blue-700">
                    Your password expires in 30 days
                  </p>
                  <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                    Update Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        log.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium">{log.action}</p>
                        <p className="text-xs text-gray-500">
                          IP: {log.ip} • {formatTimestamp(log.timestamp)}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={log.status === 'success' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {log.status}
                    </Badge>
                  </div>
                ))}
              </div>

              {hasPermission('view_audit_logs') && (
                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm">
                    View Full Audit Log
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;