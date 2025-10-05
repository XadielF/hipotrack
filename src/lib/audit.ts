import { getSupabaseClient } from './supabaseClient';

export type AuditLogStatus = 'success' | 'failed' | 'blocked';
export type AuditLogRisk = 'low' | 'medium' | 'high' | 'critical';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string | null;
  ipAddress: string;
  userAgent: string;
  status: AuditLogStatus;
  riskLevel: AuditLogRisk;
  details?: string | null;
  location?: string | null;
}

export interface AuditEventInput {
  id?: string;
  timestamp?: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  status?: AuditLogStatus;
  riskLevel?: AuditLogRisk;
  details?: string;
  location?: string;
}

export interface AuditQueryParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: AuditLogStatus;
  riskLevel?: AuditLogRisk;
  userRole?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AuditQueryResult {
  data: AuditLog[];
  total: number;
}

interface SubscribeOptions {
  onInsert: (event: AuditLog | null) => void;
  riskLevels?: AuditLogRisk[];
  pollMs?: number;
}

const FALLBACK_EVENTS: AuditLog[] = [
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
    location: 'San Francisco, CA',
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
    location: 'New York, NY',
  },
  {
    id: '3',
    timestamp: '2024-01-15T10:20:00Z',
    userId: 'unknown',
    userName: 'Unknown User',
    userRole: 'unknown',
    action: 'login_attempt',
    resource: 'authentication',
    ipAddress: '198.51.100.42',
    userAgent: 'curl/7.68.0',
    status: 'blocked',
    riskLevel: 'critical',
    details: 'Multiple failed login attempts from suspicious IP',
    location: 'Unknown',
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
    location: 'Los Angeles, CA',
  },
  {
    id: '5',
    timestamp: '2024-01-15T10:10:00Z',
    userId: 'user_321',
    userName: 'Lisa Rodriguez',
    userRole: 'processor',
    action: 'bulk_export',
    resource: 'client_data',
    ipAddress: '192.168.1.110',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'success',
    riskLevel: 'high',
    details: 'Exported 50+ client records',
    location: 'Chicago, IL',
  },
];

let inMemoryEvents: AuditLog[] = [...FALLBACK_EVENTS];
let lastSyncedLength = inMemoryEvents.length;

const FALLBACK_STORAGE_KEY = 'hipotrack_audit_events';

const getUserAgent = () =>
  typeof navigator !== 'undefined' ? navigator.userAgent : 'server-side-runtime';

const generateId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const syncFromStorage = () => {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(FALLBACK_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AuditLog[];
      if (Array.isArray(parsed)) {
        inMemoryEvents = parsed;
        lastSyncedLength = inMemoryEvents.length;
      }
    }
  } catch (error) {
    console.warn('[audit] Failed to load audit events from storage', error);
  }
};

const persistToStorage = () => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(inMemoryEvents));
  } catch (error) {
    console.warn('[audit] Failed to persist audit events to storage', error);
  }
};

const normaliseRecord = (record: Record<string, unknown>): AuditLog => ({
  id: String(record.id ?? generateId()),
  timestamp: String(record.timestamp ?? new Date().toISOString()),
  userId: String(record.user_id ?? record.userId ?? 'unknown'),
  userName: String(record.user_name ?? record.userName ?? 'Unknown User'),
  userRole: String(record.user_role ?? record.userRole ?? 'unknown'),
  action: String(record.action ?? 'unknown_action'),
  resource: String(record.resource ?? 'unknown_resource'),
  resourceId: (record.resource_id ?? record.resourceId ?? undefined) as string | undefined,
  ipAddress: String(record.ip_address ?? record.ipAddress ?? 'unknown'),
  userAgent: String(record.user_agent ?? record.userAgent ?? getUserAgent()),
  status: (record.status ?? 'success') as AuditLogStatus,
  riskLevel: (record.risk_level ?? record.riskLevel ?? 'low') as AuditLogRisk,
  details: (record.details ?? null) as string | null,
  location: (record.location ?? null) as string | null,
});

const applyQueryFilters = (events: AuditLog[], filters: AuditQueryParams) => {
  return events
    .filter((event) => {
      if (filters.status && event.status !== filters.status) return false;
      if (filters.riskLevel && event.riskLevel !== filters.riskLevel) return false;
      if (filters.userRole && event.userRole !== filters.userRole) return false;
      if (filters.userId && event.userId !== filters.userId) return false;
      if (filters.dateFrom && new Date(event.timestamp) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(event.timestamp) > new Date(filters.dateTo)) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const fields = [
          event.userName,
          event.action,
          event.resource,
          event.ipAddress,
          event.details ?? '',
          event.location ?? '',
        ]
          .join(' ')
          .toLowerCase();
        if (!fields.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const fetchAuditLogs = async (filters: AuditQueryParams): Promise<AuditQueryResult> => {
  const supabase = getSupabaseClient();

  if (!supabase) {
    syncFromStorage();
    const filtered = applyQueryFilters(inMemoryEvents, filters);
    const start = (filters.page - 1) * filters.pageSize;
    const end = start + filters.pageSize;
    return {
      data: filtered.slice(start, end),
      total: filtered.length,
    };
  }

  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let query = supabase
    .from('audit_events')
    .select('*', { count: 'exact' })
    .order('timestamp', { ascending: false })
    .range(from, to);

  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.riskLevel) {
    query = query.eq('risk_level', filters.riskLevel);
  }
  if (filters.userRole) {
    query = query.eq('user_role', filters.userRole);
  }
  if (filters.userId) {
    query = query.eq('user_id', filters.userId);
  }
  if (filters.dateFrom) {
    query = query.gte('timestamp', filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.lte('timestamp', filters.dateTo);
  }
  if (filters.search) {
    const term = `%${filters.search.toLowerCase()}%`;
    query = query.or(
      `user_name.ilike.${term},action.ilike.${term},resource.ilike.${term},ip_address.ilike.${term},details.ilike.${term},location.ilike.${term}`,
    );
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const normalised = (data ?? []).map((item) => normaliseRecord(item as Record<string, unknown>));

  return {
    data: normalised,
    total: count ?? normalised.length,
  };
};

export const logAuditEvent = async (input: AuditEventInput): Promise<AuditLog> => {
  const timestamp = input.timestamp ?? new Date().toISOString();
  const event: AuditLog = {
    id: input.id ?? generateId(),
    timestamp,
    userId: input.userId ?? 'unknown',
    userName: input.userName ?? 'Unknown User',
    userRole: input.userRole ?? 'unknown',
    action: input.action,
    resource: input.resource,
    resourceId: input.resourceId,
    ipAddress: input.ipAddress ?? 'unknown',
    userAgent: input.userAgent ?? getUserAgent(),
    status: input.status ?? 'success',
    riskLevel: input.riskLevel ?? 'low',
    details: input.details,
    location: input.location,
  };

  const supabase = getSupabaseClient();

  if (supabase) {
    const payload = {
      id: event.id,
      timestamp: event.timestamp,
      user_id: event.userId,
      user_name: event.userName,
      user_role: event.userRole,
      action: event.action,
      resource: event.resource,
      resource_id: event.resourceId,
      ip_address: event.ipAddress,
      user_agent: event.userAgent,
      status: event.status,
      risk_level: event.riskLevel,
      details: event.details,
      location: event.location,
    };

    const { data, error } = await supabase
      .from('audit_events')
      .insert(payload)
      .select()
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (data) {
      return normaliseRecord(data as Record<string, unknown>);
    }
  }

  inMemoryEvents = [event, ...inMemoryEvents].slice(0, 500);
  lastSyncedLength = inMemoryEvents.length;
  persistToStorage();

  return event;
};

export const subscribeToAuditEvents = ({
  onInsert,
  riskLevels,
  pollMs = 5000,
}: SubscribeOptions): (() => void) => {
  const supabase = getSupabaseClient();

  if (!supabase) {
    let lastLength = lastSyncedLength;
    const interval = setInterval(() => {
      syncFromStorage();
      if (inMemoryEvents.length > lastLength) {
        const diff = inMemoryEvents.length - lastLength;
        const newItems = inMemoryEvents.slice(0, diff);
        newItems.forEach((item) => {
          if (!riskLevels || riskLevels.includes(item.riskLevel)) {
            onInsert(item);
          }
        });
        lastLength = inMemoryEvents.length;
      }
    }, pollMs);

    return () => clearInterval(interval);
  }

  const channel = supabase
    .channel('audit_events_changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'audit_events' },
      (payload) => {
        const record = normaliseRecord(payload.new as Record<string, unknown>);
        if (!riskLevels || riskLevels.includes(record.riskLevel)) {
          onInsert(record);
        }
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
