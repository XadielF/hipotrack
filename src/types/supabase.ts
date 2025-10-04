export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type DocumentStatus = "pending" | "approved" | "rejected";
export type SecureDocumentStatus =
  | "pending"
  | "uploaded"
  | "scanning"
  | "approved"
  | "rejected";
export type EncryptionStatus = "encrypted" | "processing" | "failed";
export type AccessLevel = "public" | "team" | "restricted";
export type VirusScanStatus = "pending" | "clean" | "infected" | "failed";
export type AuditLogStatus = "success" | "failed" | "blocked";
export type AuditLogRiskLevel = "low" | "medium" | "high" | "critical";

export type MessageAttachment = {
  name: string;
  type: string;
  url: string;
};

export type MessageSender = {
  name: string;
  avatar?: string | null;
  role: string;
};

export type Address = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
};

export type Employment = {
  company: string;
  position: string;
  startDate: string;
  annualIncome: string;
};

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          details: string | null;
          id: string;
          ipAddress: string;
          location: string | null;
          resource: string;
          resourceId: string | null;
          riskLevel: AuditLogRiskLevel;
          status: AuditLogStatus;
          timestamp: string;
          userAgent: string;
          userId: string;
          userName: string;
          userRole: string;
        };
        Insert: {
          action: string;
          details?: string | null;
          id?: string;
          ipAddress: string;
          location?: string | null;
          resource: string;
          resourceId?: string | null;
          riskLevel: AuditLogRiskLevel;
          status: AuditLogStatus;
          timestamp: string;
          userAgent: string;
          userId: string;
          userName: string;
          userRole: string;
        };
        Update: {
          action?: string;
          details?: string | null;
          id?: string;
          ipAddress?: string;
          location?: string | null;
          resource?: string;
          resourceId?: string | null;
          riskLevel?: AuditLogRiskLevel;
          status?: AuditLogStatus;
          timestamp?: string;
          userAgent?: string;
          userId?: string;
          userName?: string;
          userRole?: string;
        };
        Relationships: [];
      };
      cost_items: {
        Row: {
          amount: number;
          description: string | null;
          id: string;
          isPaid: boolean;
          name: string;
          type: "closing" | "tax" | "insurance" | "fee" | "other";
        };
        Insert: {
          amount: number;
          description?: string | null;
          id?: string;
          isPaid?: boolean;
          name: string;
          type?: "closing" | "tax" | "insurance" | "fee" | "other";
        };
        Update: {
          amount?: number;
          description?: string | null;
          id?: string;
          isPaid?: boolean;
          name?: string;
          type?: "closing" | "tax" | "insurance" | "fee" | "other";
        };
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          name: string;
          stage: string;
          status: DocumentStatus;
          uploadedAt: string;
          uploadedBy: string;
          version: number;
        };
        Insert: {
          id?: string;
          name: string;
          stage: string;
          status?: DocumentStatus;
          uploadedAt?: string;
          uploadedBy: string;
          version?: number;
        };
        Update: {
          id?: string;
          name?: string;
          stage?: string;
          status?: DocumentStatus;
          uploadedAt?: string;
          uploadedBy?: string;
          version?: number;
        };
        Relationships: [];
      };
      document_requirements: {
        Row: {
          id: string;
          name: string;
          required: boolean;
          size: string | null;
          status: 'pending' | 'uploaded' | 'approved' | 'rejected';
          type: string;
          uploadDate: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          required?: boolean;
          size?: string | null;
          status?: 'pending' | 'uploaded' | 'approved' | 'rejected';
          type: string;
          uploadDate?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          required?: boolean;
          size?: string | null;
          status?: 'pending' | 'uploaded' | 'approved' | 'rejected';
          type?: string;
          uploadDate?: string | null;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          attachments: MessageAttachment[] | null;
          content: string;
          id: string;
          participants: string[] | null;
          sender: MessageSender;
          timestamp: string;
          topic: string | null;
        };
        Insert: {
          attachments?: MessageAttachment[] | null;
          content: string;
          id?: string;
          participants?: string[] | null;
          sender: MessageSender;
          timestamp: string;
          topic?: string | null;
        };
        Update: {
          attachments?: MessageAttachment[] | null;
          content?: string;
          id?: string;
          participants?: string[] | null;
          sender?: MessageSender;
          timestamp?: string;
          topic?: string | null;
        };
        Relationships: [];
      };
      notification_settings: {
        Row: {
          documentUpdates: boolean;
          email: boolean;
          id: string;
          messageAlerts: boolean;
          milestoneReminders: boolean;
          push: boolean;
          sms: boolean;
          weeklyDigest: boolean;
        };
        Insert: {
          documentUpdates?: boolean;
          email?: boolean;
          id?: string;
          messageAlerts?: boolean;
          milestoneReminders?: boolean;
          push?: boolean;
          sms?: boolean;
          weeklyDigest?: boolean;
        };
        Update: {
          documentUpdates?: boolean;
          email?: boolean;
          id?: string;
          messageAlerts?: boolean;
          milestoneReminders?: boolean;
          push?: boolean;
          sms?: boolean;
          weeklyDigest?: boolean;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          address: Address;
          avatar: string | null;
          email: string;
          employment: Employment;
          firstName: string;
          id: string;
          joinDate: string;
          lastName: string;
          phone: string;
          role: string;
        };
        Insert: {
          address: Address;
          avatar?: string | null;
          email: string;
          employment: Employment;
          firstName: string;
          id?: string;
          joinDate?: string;
          lastName: string;
          phone: string;
          role?: string;
        };
        Update: {
          address?: Address;
          avatar?: string | null;
          email?: string;
          employment?: Employment;
          firstName?: string;
          id?: string;
          joinDate?: string;
          lastName?: string;
          phone?: string;
          role?: string;
        };
        Relationships: [];
      };
      privacy_settings: {
        Row: {
          analyticsTracking: boolean;
          dataSharing: boolean;
          id: string;
          marketingEmails: boolean;
          profileVisibility: 'public' | 'team' | 'private';
        };
        Insert: {
          analyticsTracking?: boolean;
          dataSharing?: boolean;
          id?: string;
          marketingEmails?: boolean;
          profileVisibility?: 'public' | 'team' | 'private';
        };
        Update: {
          analyticsTracking?: boolean;
          dataSharing?: boolean;
          id?: string;
          marketingEmails?: boolean;
          profileVisibility?: 'public' | 'team' | 'private';
        };
        Relationships: [];
      };
      secure_documents: {
        Row: {
          accessCount: number;
          accessLevel: AccessLevel;
          encryptionStatus: EncryptionStatus;
          id: string;
          lastAccessed: string | null;
          name: string;
          retentionDate: string | null;
          size: string | null;
          status: SecureDocumentStatus;
          type: string;
          uploadDate: string | null;
          virusScanStatus: VirusScanStatus;
        };
        Insert: {
          accessCount?: number;
          accessLevel: AccessLevel;
          encryptionStatus: EncryptionStatus;
          id?: string;
          lastAccessed?: string | null;
          name: string;
          retentionDate?: string | null;
          size?: string | null;
          status?: SecureDocumentStatus;
          type: string;
          uploadDate?: string | null;
          virusScanStatus?: VirusScanStatus;
        };
        Update: {
          accessCount?: number;
          accessLevel?: AccessLevel;
          encryptionStatus?: EncryptionStatus;
          id?: string;
          lastAccessed?: string | null;
          name?: string;
          retentionDate?: string | null;
          size?: string | null;
          status?: SecureDocumentStatus;
          type?: string;
          uploadDate?: string | null;
          virusScanStatus?: VirusScanStatus;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};

export type Tables<TableName extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][TableName]["Row"];

export type TablesInsert<
  TableName extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][TableName]["Insert"];

export type TablesUpdate<
  TableName extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][TableName]["Update"];

export type Enums<EnumName extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][EnumName];
