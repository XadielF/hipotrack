import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createDocumentAuditEvent,
  deleteDocument,
  fetchDocuments,
  getDocumentSignedUrl,
  refreshVirusScanStatus,
  updateDocumentStatus,
  uploadDocument,
} from "@/lib/supabase/documents";
import type { DocumentRow } from "@/lib/supabase/documents";
import type {
  DocumentAuditAction,
  DocumentStatus,
  Json,
  VirusScanStatus,
} from "@/types/supabase";

export interface UseDocumentsOptions {
  secureOnly?: boolean;
  stage?: DocumentRow["stage"];
  statuses?: DocumentStatus[];
}

export interface DocumentActionContext {
  actorId?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
}

export const useDocuments = (options: UseDocumentsOptions = {}) => {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchOptions = useMemo(() => ({ ...options }), [options]);

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchDocuments({
        secureOnly: fetchOptions.secureOnly,
        stage: fetchOptions.stage,
        statuses: fetchOptions.statuses,
        includePermissions: false,
      });
      setDocuments(data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load documents.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchOptions.secureOnly, fetchOptions.stage, fetchOptions.statuses]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const handleUpload = useCallback(
    async (
      file: File,
      uploadOptions: {
        displayName?: string;
        stage?: DocumentRow["stage"];
        status?: DocumentStatus;
        isSecure?: boolean;
        isRequired?: boolean;
        metadata?: Json;
        applicantId?: string | null;
      } = {},
      context: DocumentActionContext = {},
    ) => {
      setUploadProgress(5);
      try {
        const document = await uploadDocument({
          file,
          displayName: uploadOptions.displayName,
          stage: uploadOptions.stage,
          status: uploadOptions.status,
          isSecure: uploadOptions.isSecure ?? fetchOptions.secureOnly ?? false,
          isRequired: uploadOptions.isRequired,
          metadata: uploadOptions.metadata,
          applicantId: uploadOptions.applicantId,
          actorEmail: context.actorEmail ?? null,
          actorId: context.actorId ?? null,
          actorRole: context.actorRole ?? null,
          onProgress: setUploadProgress,
        });

        setDocuments((prev) => [document, ...prev]);
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 800);
        return document;
      } catch (err) {
        setUploadProgress(0);
        const message = err instanceof Error ? err.message : "Unable to upload document.";
        setError(message);
        throw err;
      }
    },
    [fetchOptions.secureOnly],
  );

  const handleStatusUpdate = useCallback(
    async (
      documentId: string,
      status: DocumentStatus,
      options: {
        virusScanStatus?: VirusScanStatus;
        reviewNotes?: string | null;
        context?: Json;
      } = {},
      actorContext: DocumentActionContext = {},
    ) => {
      const updated = await updateDocumentStatus({
        documentId,
        status,
        virusScanStatus: options.virusScanStatus,
        reviewNotes: options.reviewNotes,
        context: options.context,
        actorEmail: actorContext.actorEmail ?? null,
        actorId: actorContext.actorId ?? null,
        actorRole: actorContext.actorRole ?? null,
      });

      setDocuments((prev) =>
        prev.map((doc) => (doc.id === documentId ? { ...doc, ...updated } : doc)),
      );

      return updated;
    },
    [],
  );

  const handleDelete = useCallback(
    async (
      document: DocumentRow,
      actorContext: DocumentActionContext = {},
      reason?: string,
    ) => {
      await deleteDocument({
        document,
        actorEmail: actorContext.actorEmail ?? null,
        actorId: actorContext.actorId ?? null,
        actorRole: actorContext.actorRole ?? null,
        reason,
      });

      setDocuments((prev) => prev.filter((doc) => doc.id !== document.id));
    },
    [],
  );

  const createAudit = useCallback(
    async (
      documentId: string,
      action: DocumentAuditAction,
      context: Json | undefined,
      actorContext: DocumentActionContext = {},
    ) => {
      await createDocumentAuditEvent({
        documentId,
        action,
        context: context ?? null,
        actorEmail: actorContext.actorEmail ?? null,
        actorId: actorContext.actorId ?? null,
        actorRole: actorContext.actorRole ?? null,
      });
    },
    [],
  );

  const withSignedUrl = useCallback(
    async (
      document: DocumentRow,
      action: DocumentAuditAction,
      actorContext: DocumentActionContext = {},
      auditContext?: Json,
    ) => {
      const url = await getDocumentSignedUrl(document);
      await createDocumentAuditEvent({
        documentId: document.id,
        action,
        context: auditContext ?? null,
        actorEmail: actorContext.actorEmail ?? null,
        actorId: actorContext.actorId ?? null,
        actorRole: actorContext.actorRole ?? null,
      });
      return url;
    },
    [],
  );

  const triggerVirusScan = useCallback(
    async (documentId: string, actorContext: DocumentActionContext = {}) => {
      const updated = await refreshVirusScanStatus({
        documentId,
        actorEmail: actorContext.actorEmail ?? null,
        actorId: actorContext.actorId ?? null,
        actorRole: actorContext.actorRole ?? null,
      });

      if (updated) {
        setDocuments((prev) =>
          prev.map((doc) => (doc.id === documentId ? { ...doc, ...updated } : doc)),
        );
      }

      return updated;
    },
    [],
  );

  return {
    documents,
    isLoading,
    error,
    uploadProgress,
    reload: loadDocuments,
    uploadDocument: handleUpload,
    updateStatus: handleStatusUpdate,
    deleteDocument: handleDelete,
    createAudit,
    getSignedUrlForAction: withSignedUrl,
    refreshVirusScanStatus: triggerVirusScan,
  };
};

export type UseDocumentsReturn = ReturnType<typeof useDocuments>;
