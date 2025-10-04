export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      participants: {
        Row: {
          avatar_url: string | null
          conversation_id: string
          display_name: string
          id: string
          inserted_at: string
          role: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          conversation_id: string
          display_name: string
          id?: string
          inserted_at?: string
          role: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          conversation_id?: string
          display_name?: string
          id?: string
          inserted_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participants_conversation_id_fkey"
            columns: ["conversation_id"]
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participants_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
          sender_role: string
          topic: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
          sender_role: string
          topic?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
          sender_role?: string
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      attachments: {
        Row: {
          content_type: string | null
          created_at: string
          id: string
          message_id: string
          name: string
          size: number | null
          storage_path: string | null
          url: string | null
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          id?: string
          message_id: string
          name: string
          size?: number | null
          storage_path?: string | null
          url?: string | null
        }
        Update: {
          content_type?: string | null
          created_at?: string
          id?: string
          message_id?: string
          name?: string
          size?: number | null
          storage_path?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attachments_message_id_fkey"
            columns: ["message_id"]
            referencedRelation: "messages"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {}
    Functions: {
      is_conversation_member: {
        Args: { conversation: string }
        Returns: boolean
      }
      is_conversation_role: {
        Args: { conversation: string; required_role: string }
        Returns: boolean
      }
      set_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: {}
    CompositeTypes: {}
  }
}
