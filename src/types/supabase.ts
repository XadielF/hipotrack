export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type DocumentStatus =
  | "draft"
  | "pending_upload"
  | "uploaded"
  | "pending_review"
  | "approved"
  | "rejected"
  | "archived";

export type DocumentStage =
  | "pre_approval"
  | "appraisal"
  | "underwriting"
  | "closing"
  | "funded"
  | "other";

export type DocumentAccessLevel = "owner" | "editor" | "viewer" | "auditor";

export type VirusScanStatus =
  | "pending"
  | "queued"
  | "scanning"
  | "clean"
  | "infected"
  | "failed";

export type DocumentAuditAction =
  | "created"
  | "uploaded"
  | "viewed"
  | "downloaded"
  | "deleted"
  | "status_changed"
  | "permission_updated"
  | "virus_scan_requested"
  | "virus_scan_completed";

export type StorageBucketId = "documents" | "secure-documents";

export interface Database {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string;
          applicant_id: string | null;
          bucket_id: StorageBucketId;
          storage_path: string;
          display_name: string;
          file_name: string;
          mime_type: string | null;
          size_bytes: number | null;
          status: DocumentStatus;
          stage: DocumentStage | null;
          version: number;
          is_required: boolean;
          is_secure: boolean;
          uploaded_by: string | null;
          uploaded_by_email: string | null;
          uploaded_at: string;
          updated_at: string;
          metadata: Json | null;
          virus_scan_status: VirusScanStatus;
          review_notes: string | null;
          retention_date: string | null;
        };
        Insert: {
          id?: string;
          applicant_id?: string | null;
          bucket_id: StorageBucketId;
          storage_path: string;
          display_name: string;
          file_name: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          status?: DocumentStatus;
          stage?: DocumentStage | null;
          version?: number;
          is_required?: boolean;
          is_secure?: boolean;
          uploaded_by?: string | null;
          uploaded_by_email?: string | null;
          uploaded_at?: string;
          updated_at?: string;
          metadata?: Json | null;
          virus_scan_status?: VirusScanStatus;
          review_notes?: string | null;
          retention_date?: string | null;
        };
        Update: {
          id?: string;
          applicant_id?: string | null;
          bucket_id?: StorageBucketId;
          storage_path?: string;
          display_name?: string;
          file_name?: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          status?: DocumentStatus;
          stage?: DocumentStage | null;
          version?: number;
          is_required?: boolean;
          is_secure?: boolean;
          uploaded_by?: string | null;
          uploaded_by_email?: string | null;
          uploaded_at?: string;
          updated_at?: string;
          metadata?: Json | null;
          virus_scan_status?: VirusScanStatus;
          review_notes?: string | null;
          retention_date?: string | null;
        };
        Relationships: [];
      };
      document_permissions: {
        Row: {
          id: string;
          document_id: string;
          principal_id: string;
          principal_type: "user" | "group" | "role";
          access_level: DocumentAccessLevel;
          can_view: boolean;
          can_download: boolean;
          can_delete: boolean;
          can_upload_new_version: boolean;
          created_at: string;
          created_by: string | null;
          revoked_at: string | null;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          document_id: string;
          principal_id: string;
          principal_type?: "user" | "group" | "role";
          access_level?: DocumentAccessLevel;
          can_view?: boolean;
          can_download?: boolean;
          can_delete?: boolean;
          can_upload_new_version?: boolean;
          created_at?: string;
          created_by?: string | null;
          revoked_at?: string | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          document_id?: string;
          principal_id?: string;
          principal_type?: "user" | "group" | "role";
          access_level?: DocumentAccessLevel;
          can_view?: boolean;
          can_download?: boolean;
          can_delete?: boolean;
          can_upload_new_version?: boolean;
          created_at?: string;
          created_by?: string | null;
          revoked_at?: string | null;
          metadata?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "document_permissions_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          }
        ];
      };
      document_audit_events: {
        Row: {
          id: string;
          document_id: string;
          action: DocumentAuditAction;
          actor_id: string | null;
          actor_email: string | null;
          actor_role: string | null;
          context: Json | null;
          created_at: string;
          request_id: string | null;
        };
        Insert: {
          id?: string;
          document_id: string;
          action: DocumentAuditAction;
          actor_id?: string | null;
          actor_email?: string | null;
          actor_role?: string | null;
          context?: Json | null;
          created_at?: string;
          request_id?: string | null;
        };
        Update: {
          id?: string;
          document_id?: string;
          action?: DocumentAuditAction;
          actor_id?: string | null;
          actor_email?: string | null;
          actor_role?: string | null;
          context?: Json | null;
          created_at?: string;
          request_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "document_audit_events_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {
      refresh_document_scan_status: {
        Args: {
          document_id: string;
        };
        Returns: {
          document_id: string;
          status: DocumentStatus | null;
          virus_scan_status: VirusScanStatus | null;
          details: Json | null;
        };
      };
    };
    Enums: {
      document_status: DocumentStatus;
      document_stage: DocumentStage;
      virus_scan_status: VirusScanStatus;
      document_access_level: DocumentAccessLevel;
      document_audit_action: DocumentAuditAction;
    };
    CompositeTypes: {};
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          id: StorageBucketId;
          name: StorageBucketId;
        };
      };
      objects: {
        Row: {
          id: string;
          bucket_id: StorageBucketId;
          name: string;
          owner: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
          last_accessed_at: string | null;
        };
      };
    };
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
