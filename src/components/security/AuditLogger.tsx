import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import type { Tables } from '@/types/supabase';
import { 
  Activity, 
  Shield, 
  AlertTriangle, 
  Eye, 
  Download, 
  Search,
  Filter,
  Calendar,
  MapPin,
  User,
  FileText,
  MessageSquare,
  Lock,
  RefreshCw
} from 'lucide-react';

type AuditLog = Tables<'audit_logs'>;

const AuditLogger: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: '1',
      timestamp: '2024-01-15T10:30:00Z',
      userId: 'user_123',
      userName: 'John Doe',
      userRole: 'homebuyer',
      action: 'document_download',
      resource: 'W-2 Tax Form',
      resourceId: 'doc_456',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success',
      riskLevel: 'low',
      details: null,
      location: 'San Francisco, CA'
    },
    {
      id: '2',
      timestamp: '2024-01-15T10:25:00Z',
      userId: 'user_789',
      userName: 'Sarah Johnson',
      userRole: 'lender',
      action: 'profile_update',
      resource: 'user_profile',
      resourceId: 'user_123',
      ipAddress: '203.0.113.45',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      status: 'success',
      riskLevel: 'medium',
      details: null,
      location: 'New York, NY'
    },
    {
      id: '3',
      timestamp: '2024-01-15T10:20:00Z',
      userId: 'unknown',
      userName: 'Unknown User',
      userRole: 'unknown',
      action: 'login_attempt',
      resource: 'authentication',
      resourceId: null,
      ipAddress: '198.51.100.42',
      userAgent: 'curl/7.68.0',
      status: 'blocked',
      riskLevel: 'critical',
      details: 'Multiple failed login attempts from suspicious IP',
      location: 'Unknown'
    },
    {
      id: '4',
      timestamp: '2024-01-15T10:15:00Z',
      userId: 'user_456',
      userName: 'Mike Chen',
      userRole: 'agent',
      action: 'message_send',
      resource: 'messaging_system',
      resourceId: 'msg_789',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      status: 'success',
      riskLevel: 'low',
      details: null,
      location: 'Los Angeles, CA'
    },
    {
      id: '5',
      timestamp: '2024-01-15T10:10:00Z',
      userId: 'user_321',
      userName: 'Lisa Rodriguez',
      userRole: 'processor',
      action: 'bulk_export',
      resource: 'client_data',
      resourceId: null,
      ipAddress: '192.168.1.110',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success',
      riskLevel: 'high',
      details: 'Exported 50+ client records',
      location: 'Chicago, IL'
    }
  ]);

  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>(auditLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('today');

  useEffect(() => {
    let filtered = auditLogs;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(log => 
        log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.ipAddress.includes(searchQuery)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    // Risk filter
    if (riskFilter !== 'all') {
      filtered = filtered.filter(log => log.riskLevel === riskFilter);
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(log => log.userRole === roleFilter);
    }

    setFilteredLogs(filtered);
  }, [auditLogs, searchQuery, statusFilter, riskFilter, roleFilter]);

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'bg-green-100 text-green-800',
      failed: 'bg-yellow-100 text-yellow-800',
      blocked: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getRiskBadge = (risk: string) => {
    const variants = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={variants[risk as keyof typeof variants]}>
        {risk.charAt(0).toUpperCase() + risk.slice(1)}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      homebuyer: 'bg-blue-100 text-blue-800',
      agent: 'bg-green-100 text-green-800',
      lender: 'bg-purple-100 text-purple-800',
      processor: 'bg-orange-100 text-orange-800',
      admin: 'bg-red-100 text-red-800',
      unknown: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge variant="outline" className={variants[role as keyof typeof variants]}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const getActionIcon = (action: string) => {
    const icons = {
      login_attempt: <Lock className="h-4 w-4" />,
      document_download: <Download className="h-4 w-4" />,
      document_upload: <FileText className="h-4 w-4" />,
      profile_update: <User className="h-4 w-4" />,
      message_send: <MessageSquare className="h-4 w-4" />,
      bulk_export: <Download className="h-4 w-4" />
    };
    
    return icons[action as keyof typeof icons] || <Activity className="h-4 w-4" />;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Role', 'Action', 'Resource', 'IP Address', 'Status', 'Risk Level', 'Location'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.userName,
        log.userRole,
        log.action,
        log.resource,
        log.ipAddress,
        log.status,
        log.riskLevel,
        log.location || 'Unknown'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const criticalLogs = auditLogs.filter(log => log.riskLevel === 'critical').length;
  const highRiskLogs = auditLogs.filter(log => log.riskLevel === 'high').length;
  const failedActions = auditLogs.filter(log => log.status === 'failed' || log.status === 'blocked').length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Audit Log</h1>
          <p className="text-gray-600">Monitor and analyze all system activities for compliance and security</p>
        </div>

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
                  <p className="text-2xl font-bold text-blue-600">{auditLogs.length}</p>
                  <p className="text-sm text-gray-600">Total Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold text-purple-600">{failedActions}</p>
                  <p className="text-sm text-gray-600">Failed Actions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Critical Alerts */}
        {criticalLogs > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {criticalLogs} critical security event(s) detected. Immediate attention required.
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>

              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
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
              Audit Trail ({filteredLogs.length} events)
            </CardTitle>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-4 border rounded-lg ${
                    log.riskLevel === 'critical' ? 'border-red-200 bg-red-50' :
                    log.riskLevel === 'high' ? 'border-orange-200 bg-orange-50' :
                    'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getActionIcon(log.action)}
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {log.action.replace('_', ' ').toUpperCase()}
                        </h3>
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
                      <span className="text-gray-600">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-600">{log.ipAddress}</p>
                        <p className="text-xs text-gray-500">{log.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500 truncate">
                        {log.userAgent.substring(0, 30)}...
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

            {filteredLogs.length === 0 && (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No audit logs match your current filters</p>
              </div>
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
            All audit logs are retained for 7 years in compliance with GLBA requirements. 
            Logs are encrypted at rest and transmitted securely. Access is restricted to authorized personnel only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuditLogger;