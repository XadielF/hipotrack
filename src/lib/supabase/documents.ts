import type {
  Database,
  DocumentAuditAction,
  DocumentStatus,
  Json,
  StorageBucketId,
  VirusScanStatus,
} from "@/types/supabase";
import { getSupabaseClient } from "./client";

export type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];
export type DocumentInsert = Database["public"]["Tables"]["documents"]["Insert"];
export type DocumentUpdate = Database["public"]["Tables"]["documents"]["Update"];
export type DocumentPermissionRow =
  Database["public"]["Tables"]["document_permissions"]["Row"];
export type DocumentAuditRow =
  Database["public"]["Tables"]["document_audit_events"]["Row"];

export interface FetchDocumentsOptions {
  secureOnly?: boolean;
  stage?: DocumentRow["stage"];
  statuses?: DocumentStatus[];
  includePermissions?: boolean;
  limit?: number;
}

export interface UploadDocumentArgs {
  file: File;
  displayName?: string;
  stage?: DocumentRow["stage"];
  status?: DocumentStatus;
  isSecure?: boolean;
  isRequired?: boolean;
  accessLevel?: DocumentPermissionRow["access_level"];
  metadata?: Json;
  applicantId?: string | null;
  actorId?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  onProgress?: (progress: number) => void;
}

export interface UpdateStatusArgs {
  documentId: string;
  status: DocumentStatus;
  virusScanStatus?: VirusScanStatus;
  reviewNotes?: string | null;
  actorId?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  context?: Json;
}

export interface DeleteDocumentArgs {
  document: DocumentRow;
  reason?: string;
  actorId?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
}

export interface AuditEventArgs {
  documentId: string;
  action: DocumentAuditAction;
  actorId?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  context?: Json;
  requestId?: string | null;
}

export interface VirusScanRefreshArgs {
  documentId: string;
  actorId?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
}

const DEFAULT_BUCKET: StorageBucketId = "documents";
const SECURE_BUCKET: StorageBucketId = "secure-documents";

export const createDocumentAuditEvent = async ({
  documentId,
  action,
  actorEmail,
  actorId,
  actorRole,
  context,
  requestId,
}: AuditEventArgs): Promise<DocumentAuditRow> => {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("document_audit_events")
    .insert({
      document_id: documentId,
      action,
      actor_email: actorEmail ?? null,
      actor_id: actorId ?? null,
      actor_role: actorRole ?? null,
      context: context ?? null,
      created_at: now,
      request_id: requestId ?? null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const fetchDocuments = async ({
  secureOnly,
  stage,
  statuses,
  includePermissions = true,
  limit,
}: FetchDocumentsOptions = {}) => {
  const supabase = getSupabaseClient();
  const selectQuery = includePermissions
    ? "*, document_permissions(*)"
    : "*";

  let query = supabase.from("documents").select(selectQuery).order("uploaded_at", {
    ascending: false,
  });

  if (secureOnly !== undefined) {
    query = query.eq("is_secure", secureOnly);
  }

  if (stage) {
    query = query.eq("stage", stage);
  }

  if (statuses?.length) {
    query = query.in("status", statuses);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data as (DocumentRow & {
    document_permissions?: DocumentPermissionRow[];
  })[];
};

export const uploadDocument = async ({
  file,
  displayName,
  stage,
  status = "uploaded",
  isSecure = false,
  isRequired = true,
  accessLevel = "editor",
  metadata,
  applicantId,
  actorEmail,
  actorId,
  actorRole,
  onProgress,
}: UploadDocumentArgs): Promise<DocumentRow> => {
  const supabase = getSupabaseClient();
  const bucket = isSecure ? SECURE_BUCKET : DEFAULT_BUCKET;
  const storagePath = `${stage ?? "unassigned"}/${Date.now()}-${file.name}`;
  const now = new Date().toISOString();

  onProgress?.(10);
  const { error: storageError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, file, {
      cacheControl: "3600",
      contentType: file.type,
    });

  if (storageError) {
    onProgress?.(0);
    throw storageError;
  }

  onProgress?.(65);

  const { data, error } = await supabase
    .from("documents")
    .insert({
      bucket_id: bucket,
      storage_path: storagePath,
      display_name: displayName ?? file.name,
      file_name: file.name,
      mime_type: file.type || null,
      size_bytes: file.size,
      status,
      stage: stage ?? null,
      version: 1,
      is_required: isRequired,
      is_secure: isSecure,
      uploaded_at: now,
      updated_at: now,
      uploaded_by: actorId ?? null,
      uploaded_by_email: actorEmail ?? null,
      metadata: metadata ?? null,
      virus_scan_status: isSecure ? "pending" : "clean",
      applicant_id: applicantId ?? null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  onProgress?.(80);

  await supabase.from("document_permissions").insert({
    document_id: data.id,
    principal_id: actorId ?? "self",
    principal_type: "user",
    access_level: accessLevel,
    can_view: true,
    can_download: true,
    can_delete: accessLevel === "owner" || accessLevel === "editor",
    can_upload_new_version: accessLevel === "owner" || accessLevel === "editor",
    created_at: now,
    created_by: actorId ?? null,
    metadata: metadata ?? null,
  });

  onProgress?.(95);

  await createDocumentAuditEvent({
    documentId: data.id,
    action: "uploaded",
    actorEmail,
    actorId,
    actorRole,
    context: {
      bucket,
      storage_path: storagePath,
      file_name: file.name,
      size_bytes: file.size,
      mime_type: file.type,
      stage,
      status,
      is_secure: isSecure,
    },
  });

  onProgress?.(100);

  return data;
};

export const updateDocumentStatus = async ({
  documentId,
  status,
  virusScanStatus,
  reviewNotes,
  actorEmail,
  actorId,
  actorRole,
  context,
}: UpdateStatusArgs): Promise<DocumentRow> => {
  const supabase = getSupabaseClient();
  const updates: DocumentUpdate = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (virusScanStatus) {
    updates.virus_scan_status = virusScanStatus;
  }

  if (reviewNotes !== undefined) {
    updates.review_notes = reviewNotes;
  }

  const { data, error } = await supabase
    .from("documents")
    .update(updates)
    .eq("id", documentId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  await createDocumentAuditEvent({
    documentId,
    action: "status_changed",
    actorEmail,
    actorId,
    actorRole,
    context: {
      ...context,
      status,
      virus_scan_status: virusScanStatus ?? null,
      review_notes: reviewNotes ?? null,
    },
  });

  return data;
};

export const deleteDocument = async ({
  document,
  reason,
  actorEmail,
  actorId,
  actorRole,
}: DeleteDocumentArgs) => {
  const supabase = getSupabaseClient();

  const { error: storageError } = await supabase.storage
    .from(document.bucket_id)
    .remove([document.storage_path]);

  if (storageError) {
    throw storageError;
  }

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", document.id);

  if (error) {
    throw error;
  }

  await createDocumentAuditEvent({
    documentId: document.id,
    action: "deleted",
    actorEmail,
    actorId,
    actorRole,
    context: {
      reason: reason ?? null,
      bucket: document.bucket_id,
      storage_path: document.storage_path,
    },
  });
};

export const getDocumentSignedUrl = async (
  document: DocumentRow,
  expiresInSeconds = 60,
) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.storage
    .from(document.bucket_id)
    .createSignedUrl(document.storage_path, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw error ?? new Error("Unable to create signed URL for document.");
  }

  return data.signedUrl;
};

export const refreshVirusScanStatus = async ({
  documentId,
  actorEmail,
  actorId,
  actorRole,
}: VirusScanRefreshArgs): Promise<DocumentRow | null> => {
  const supabase = getSupabaseClient();
  await createDocumentAuditEvent({
    documentId,
    action: "virus_scan_requested",
    actorEmail,
    actorId,
    actorRole,
  });

  const { data, error } = await supabase.rpc(
    "refresh_document_scan_status",
    {
      document_id: documentId,
    },
  );

  if (error) {
    throw error;
  }

  const payload = data as
    | {
        status?: DocumentStatus;
        virus_scan_status?: VirusScanStatus;
        details?: Json;
      }
    | null;

  if (!payload) {
    return null;
  }

  const updates: DocumentUpdate = {
    updated_at: new Date().toISOString(),
  };

  if (payload.status) {
    updates.status = payload.status;
  }

  if (payload.virus_scan_status) {
    updates.virus_scan_status = payload.virus_scan_status;
  }

  if (payload.details) {
    updates.metadata = (payload.details as Json) ?? null;
  }

  if (!payload.status && !payload.virus_scan_status && !payload.details) {
    return null;
  }

  const { data: updated, error: updateError } = await supabase
    .from("documents")
    .update(updates)
    .eq("id", documentId)
    .select()
    .single();

  if (updateError) {
    throw updateError;
  }

  await createDocumentAuditEvent({
    documentId,
    action: "virus_scan_completed",
    actorEmail,
    actorId,
    actorRole,
    context: payload ?? null,
  });

  return updated;
};
