import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAuth } from './AuthProvider';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import type { AuditLog } from '@/lib/audit';
import {
  Clock,
  LogOut,
  RefreshCw,
  AlertTriangle,
  User,
  Activity,
  Lock,
} from 'lucide-react';

const formatActionLabel = (action: string) => action.replace(/_/g, ' ').toUpperCase();

const SecurityDashboard: React.FC = () => {
  const { user, logout, sessionTimeRemaining, refreshSession, hasPermission } = useAuth();
  const [latestHighRisk, setLatestHighRisk] = useState<AuditLog | null>(null);

  const handleRealtimeEvent = useCallback((event: AuditLog | null) => {
    if (event && (event.riskLevel === 'high' || event.riskLevel === 'critical')) {
      setLatestHighRisk(event);
    }
  }, []);

  const {
    logs: activityLogs,
    isLoading: activityLoading,
    setFilters,
    refresh: refreshActivity,
  } = useAuditLogs({ pageSize: 5 }, { onRealtimeEvent: handleRealtimeEvent });

  useEffect(() => {
    if (user) {
      setFilters({ userId: user.id });
    }
  }, [user, setFilters]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp: string) => new Date(timestamp).toLocaleString();

  const getRoleColor = (role: string) => {
    const colors = {
      homebuyer: 'bg-blue-100 text-blue-800',
      agent: 'bg-green-100 text-green-800',
      lender: 'bg-purple-100 text-purple-800',
      processor: 'bg-orange-100 text-orange-800',
      admin: 'bg-red-100 text-red-800',
    } as const;
    return colors[role as keyof typeof colors] ?? 'bg-gray-100 text-gray-800';
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
                <Button variant="outline" size="sm" onClick={refreshSession} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Extend
                </Button>
                <Button variant="destructive" size="sm" onClick={logout} className="flex-1">
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
                  <Badge variant={user.mfaEnabled ? 'default' : 'destructive'}>
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
                    <div className="text-xs text-gray-500">+{user.permissions.length - 3} more</div>
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
                {latestHighRisk ? (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-700">High-Risk Activity</span>
                    </div>
                    <p className="text-xs text-red-700">
                      {formatActionLabel(latestHighRisk.action)} detected from IP {latestHighRisk.ipAddress}.
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      {formatTimestamp(latestHighRisk.timestamp)} • {latestHighRisk.userName}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">No critical alerts</span>
                    </div>
                    <p className="text-xs text-yellow-700">
                      We will notify you here as soon as a high-risk event is detected.
                    </p>
                  </div>
                )}

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Password Hygiene</span>
                  </div>
                  <p className="text-xs text-blue-700">
                    Keep your account secure by rotating your password regularly and using MFA.
                  </p>
                  <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                    Update Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Log */}
        <Card className="lg:col-span-3 mt-6">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={refreshActivity} disabled={activityLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${activityLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Input placeholder="Filter by resource" disabled className="hidden lg:block w-48" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        log.status === 'success' ? 'bg-green-500' : log.status === 'blocked' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium">{formatActionLabel(log.action)}</p>
                      <p className="text-xs text-gray-500">
                        IP: {log.ipAddress} • {formatTimestamp(log.timestamp)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={log.status === 'success' ? 'default' : 'destructive'} className="text-xs">
                    {log.status}
                  </Badge>
                </div>
              ))}
            </div>

            {!activityLoading && activityLogs.length === 0 && (
              <div className="text-center py-6 text-gray-500">No recent activity found for your account.</div>
            )}

            {activityLoading && (
              <div className="text-center py-6 text-gray-500">Loading activity…</div>
            )}

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
  );
};

export default SecurityDashboard;
