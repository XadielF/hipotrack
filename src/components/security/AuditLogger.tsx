import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Activity,
  Shield,
  AlertTriangle,
  Eye,
  Download,
  Search,
  Calendar,
  MapPin,
  User,
  FileText,
  MessageSquare,
  Lock,
  RefreshCw,
  Trash2,
  LogOut,
} from 'lucide-react';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import type { AuditLog, AuditLogRisk, AuditLogStatus } from '@/lib/audit';

type DateRangeOption = 'today' | '7days' | '30days' | 'all';
type StatusFilter = AuditLogStatus | 'all';
type RiskFilter = AuditLogRisk | 'all';

const getDateBounds = (range: DateRangeOption) => {
  const now = new Date();
  const end = now.toISOString();

  switch (range) {
    case 'today': {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      return { from: start.toISOString(), to: end };
    }
    case '7days': {
      const start = new Date();
      start.setDate(start.getDate() - 7);
      return { from: start.toISOString(), to: end };
    }
    case '30days': {
      const start = new Date();
      start.setDate(start.getDate() - 30);
      return { from: start.toISOString(), to: end };
    }
    default:
      return { from: undefined, to: undefined };
  }
};

const formatActionLabel = (action: string) => action.replace(/_/g, ' ').toUpperCase();

const AuditLogger: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRangeOption>('today');
  const [recentHighRisk, setRecentHighRisk] = useState<AuditLog | null>(null);

  const defaultDateFrom = useMemo(() => getDateBounds('today').from, []);
  const handleRealtimeEvent = useCallback((event: AuditLog | null) => {
    if (event && (event.riskLevel === 'high' || event.riskLevel === 'critical')) {
      setRecentHighRisk(event);
    }
  }, []);

  const { logs, total, isLoading, error, setFilters, refresh } = useAuditLogs(
    { pageSize: 25, dateFrom: defaultDateFrom },
    { onRealtimeEvent: handleRealtimeEvent },
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters({ search: searchQuery.trim() || undefined });
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, setFilters]);

  useEffect(() => {
    const { from, to } = getDateBounds(dateRange);
    setFilters({ dateFrom: from, dateTo: to });
  }, [dateRange, setFilters]);

  useEffect(() => {
    if (!recentHighRisk) return;
    const timeout = setTimeout(() => setRecentHighRisk(null), 15000);
    return () => clearTimeout(timeout);
  }, [recentHighRisk]);

  const getStatusBadge = (status: AuditLogStatus) => {
    const variants: Record<AuditLogStatus, string> = {
      success: 'bg-green-100 text-green-800',
      failed: 'bg-yellow-100 text-yellow-800',
      blocked: 'bg-red-100 text-red-800',
    };

    return <Badge className={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const getRiskBadge = (risk: AuditLogRisk) => {
    const variants: Record<AuditLogRisk, string> = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };

    return <Badge className={variants[risk]}>{risk.charAt(0).toUpperCase() + risk.slice(1)}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, string> = {
      homebuyer: 'bg-blue-100 text-blue-800',
      agent: 'bg-green-100 text-green-800',
      lender: 'bg-purple-100 text-purple-800',
      processor: 'bg-orange-100 text-orange-800',
      admin: 'bg-red-100 text-red-800',
      unknown: 'bg-gray-100 text-gray-800',
    };

    return (
      <Badge variant="outline" className={variants[role] ?? 'bg-gray-100 text-gray-800'}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const getActionIcon = (action: string) => {
    const icons: Record<string, JSX.Element> = {
      login_attempt: <Lock className="h-4 w-4" />,
      logout: <LogOut className="h-4 w-4" />,
      session_refresh: <RefreshCw className="h-4 w-4" />,
      document_download: <Download className="h-4 w-4" />,
      document_upload: <FileText className="h-4 w-4" />,
      document_delete: <Trash2 className="h-4 w-4" />,
      profile_update: <User className="h-4 w-4" />,
      message_send: <MessageSquare className="h-4 w-4" />,
      bulk_export: <Download className="h-4 w-4" />,
    };

    return icons[action] ?? <Activity className="h-4 w-4" />;
  };

  const formatTimestamp = (timestamp: string) => new Date(timestamp).toLocaleString();

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Role', 'Action', 'Resource', 'IP Address', 'Status', 'Risk Level', 'Location'].join(','),
      ...logs.map(log => [
        log.timestamp,
        log.userName,
        log.userRole,
        log.action,
        log.resource,
        log.ipAddress,
        log.status,
        log.riskLevel,
        log.location ?? 'Unknown',
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const criticalLogs = logs.filter(log => log.riskLevel === 'critical').length;
  const highRiskLogs = logs.filter(log => log.riskLevel === 'high').length;
  const failedActions = logs.filter(log => log.status === 'failed' || log.status === 'blocked').length;

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as StatusFilter);
    setFilters({ status: value === 'all' ? undefined : (value as AuditLogStatus) });
  };

  const handleRiskChange = (value: string) => {
    setRiskFilter(value as RiskFilter);
    setFilters({ riskLevel: value === 'all' ? undefined : (value as AuditLogRisk) });
  };

  const handleRoleChange = (value: string) => {
    setRoleFilter(value);
    setFilters({ userRole: value === 'all' ? undefined : value });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Audit Log</h1>
          <p className="text-gray-600">Monitor and analyze all system activities for compliance and security</p>
        </div>

        {recentHighRisk && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              High-risk activity detected: {formatActionLabel(recentHighRisk.action)} by {recentHighRisk.userName}{' '}
              at {formatTimestamp(recentHighRisk.timestamp)}.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Security Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-red-600">{criticalLogs}</p>
                  <p className="text-sm text-gray-600">Critical Alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold text-orange-600">{highRiskLogs}</p>
                  <p className="text-sm text-gray-600">High Risk Events</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-blue-600">{logs.length}</p>
                  <p className="text-sm text-gray-600">Events (current page)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold text-purple-600">{failedActions}</p>
                  <p className="text-sm text-gray-600">Failed or Blocked</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by user, action, resource, or IP"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>

              <Select value={riskFilter} onValueChange={handleRiskChange}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>

              <Select value={roleFilter} onValueChange={handleRoleChange}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="User Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="homebuyer">Homebuyer</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="lender">Lender</SelectItem>
                  <SelectItem value="processor">Processor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRangeOption)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={exportLogs} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Audit Trail ({total} events)
            </CardTitle>
            <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-4 border rounded-lg ${
                    log.riskLevel === 'critical'
                      ? 'border-red-200 bg-red-50'
                      : log.riskLevel === 'high'
                        ? 'border-orange-200 bg-orange-50'
                        : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getActionIcon(log.action)}
                      <div>
                        <h3 className="font-medium text-gray-900">{formatActionLabel(log.action)}</h3>
                        <p className="text-sm text-gray-600">
                          {log.resource} {log.resourceId && `(${log.resourceId})`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(log.status)}
                      {getRiskBadge(log.riskLevel)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium">{log.userName}</p>
                        {getRoleBadge(log.userRole)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{formatTimestamp(log.timestamp)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-600">{log.ipAddress}</p>
                        <p className="text-xs text-gray-500">{log.location ?? 'Unknown'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500 truncate">
                        {log.userAgent ? `${log.userAgent.substring(0, 60)}${log.userAgent.length > 60 ? '…' : ''}` : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {log.details && (
                    <>
                      <Separator className="my-3" />
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <p className="text-sm text-orange-700">{log.details}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {!isLoading && logs.length === 0 && (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No audit logs match your current filters</p>
              </div>
            )}

            {isLoading && (
              <div className="text-center py-8 text-gray-500">Loading audit events…</div>
            )}
          </CardContent>
        </Card>

        {/* Compliance Footer */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">Compliance & Retention</h3>
          </div>
          <p className="text-sm text-blue-800">
            All audit logs are retained for 7 years in compliance with GLBA requirements. Logs are encrypted at rest and
            transmitted securely. Access is restricted to authorized personnel only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuditLogger;
