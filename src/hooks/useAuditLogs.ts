import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type AuditLog,
  type AuditLogRisk,
  type AuditQueryParams,
  fetchAuditLogs,
  subscribeToAuditEvents,
} from '@/lib/audit';

interface UseAuditLogsOptions {
  realtime?: boolean;
  realtimeRiskLevels?: AuditLogRisk[];
  onRealtimeEvent?: (event: AuditLog | null) => void;
}

type FilterUpdater =
  | Partial<AuditQueryParams>
  | ((previous: AuditQueryParams) => Partial<AuditQueryParams>);

const DEFAULT_PAGE_SIZE = 25;

export const useAuditLogs = (
  initialFilters: Partial<AuditQueryParams> = {},
  options: UseAuditLogsOptions = {},
) => {
  const [filters, setFilters] = useState<AuditQueryParams>({
    page: initialFilters.page ?? 1,
    pageSize: initialFilters.pageSize ?? DEFAULT_PAGE_SIZE,
    search: initialFilters.search,
    status: initialFilters.status,
    riskLevel: initialFilters.riskLevel,
    userRole: initialFilters.userRole,
    userId: initialFilters.userId,
    dateFrom: initialFilters.dateFrom,
    dateTo: initialFilters.dateTo,
  });
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { realtime = true, realtimeRiskLevels, onRealtimeEvent } = options;

  const realtimeCallback = useRef(onRealtimeEvent);
  useEffect(() => {
    realtimeCallback.current = onRealtimeEvent;
  }, [onRealtimeEvent]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchAuditLogs(filters);
      setLogs(result.data);
      setTotal(result.total);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load audit logs';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!realtime) {
      return;
    }

    const unsubscribe = subscribeToAuditEvents({
      riskLevels: realtimeRiskLevels,
      onInsert: (event) => {
        if (realtimeCallback.current) {
          realtimeCallback.current(event);
        }
        refresh();
      },
    });

    return () => unsubscribe();
  }, [refresh, realtime, realtimeRiskLevels]);

  const updateFilters = useCallback((updater: FilterUpdater) => {
    setFilters((prev) => {
      const patch = typeof updater === 'function' ? updater(prev) : updater;
      const next = { ...prev, ...patch };
      const resetPageKeys: (keyof AuditQueryParams)[] = [
        'search',
        'status',
        'riskLevel',
        'userRole',
        'userId',
        'dateFrom',
        'dateTo',
        'pageSize',
      ];

      const shouldResetPage = resetPageKeys.some((key) => key in patch);

      if (shouldResetPage && patch.page === undefined) {
        next.page = 1;
      }

      return next;
    });
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const pageCount = useMemo(() => {
    if (filters.pageSize === 0) return 0;
    return Math.max(1, Math.ceil(total / filters.pageSize));
  }, [filters.pageSize, total]);

  return {
    logs,
    total,
    isLoading,
    error,
    filters,
    setFilters: updateFilters,
    setPage,
    refresh,
    pageCount,
  };
};

export type UseAuditLogsReturn = ReturnType<typeof useAuditLogs>;
