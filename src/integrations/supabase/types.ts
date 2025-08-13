export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          changes: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      equipment: {
        Row: {
          created_at: string
          description: string | null
          id: string
          location: string | null
          name: string
          quantity: number | null
          status: Database["public"]["Enums"]["equipment_status"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name: string
          quantity?: number | null
          status?: Database["public"]["Enums"]["equipment_status"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          quantity?: number | null
          status?: Database["public"]["Enums"]["equipment_status"] | null
          updated_at?: string
        }
        Relationships: []
      }
      equipment_changes: {
        Row: {
          approved_by: string | null
          change_type: Database["public"]["Enums"]["equipment_change_type"]
          changes: Json
          created_at: string
          equipment_id: string | null
          id: string
          notes: string | null
          requested_by: string
          status: Database["public"]["Enums"]["change_status"]
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          change_type: Database["public"]["Enums"]["equipment_change_type"]
          changes: Json
          created_at?: string
          equipment_id?: string | null
          id?: string
          notes?: string | null
          requested_by: string
          status?: Database["public"]["Enums"]["change_status"]
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          change_type?: Database["public"]["Enums"]["equipment_change_type"]
          changes?: Json
          created_at?: string
          equipment_id?: string | null
          id?: string
          notes?: string | null
          requested_by?: string
          status?: Database["public"]["Enums"]["change_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_changes_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      event_assignments: {
        Row: {
          created_at: string
          event_id: string
          id: string
          role: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          role: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          role?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_assignments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_equipment: {
        Row: {
          created_at: string
          created_by: string
          equipment_id: string | null
          event_id: string | null
          id: string
          notes: string | null
          quantity: number
        }
        Insert: {
          created_at?: string
          created_by: string
          equipment_id?: string | null
          event_id?: string | null
          id?: string
          notes?: string | null
          quantity?: number
        }
        Update: {
          created_at?: string
          created_by?: string
          equipment_id?: string | null
          event_id?: string | null
          id?: string
          notes?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_equipment_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_equipment_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_equipment_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          cleanup_time: string
          created_at: string
          created_by: string
          date: string
          equipment: string[] | null
          id: string
          location_address: string
          location_coordinates: Json | null
          location_name: string
          main_time: string
          parasha: string | null
          required_service_girls: number | null
          required_youth_volunteers: number | null
          setup_time: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          cleanup_time: string
          created_at?: string
          created_by: string
          date: string
          equipment?: string[] | null
          id?: string
          location_address: string
          location_coordinates?: Json | null
          location_name: string
          main_time: string
          parasha?: string | null
          required_service_girls?: number | null
          required_youth_volunteers?: number | null
          setup_time: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          cleanup_time?: string
          created_at?: string
          created_by?: string
          date?: string
          equipment?: string[] | null
          id?: string
          location_address?: string
          location_coordinates?: Json | null
          location_name?: string
          main_time?: string
          parasha?: string | null
          required_service_girls?: number | null
          required_youth_volunteers?: number | null
          setup_time?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          anonymous: boolean | null
          content: string | null
          created_at: string
          event_id: string | null
          id: string
          rating: number | null
          submitted_by: string | null
        }
        Insert: {
          anonymous?: boolean | null
          content?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          rating?: number | null
          submitted_by?: string | null
        }
        Update: {
          anonymous?: boolean | null
          content?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          rating?: number | null
          submitted_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read_by: string[] | null
          recipient_ids: string[]
          sender_id: string
          type: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read_by?: string[] | null
          recipient_ids: string[]
          sender_id: string
          type: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read_by?: string[] | null
          recipient_ids?: string[]
          sender_id?: string
          type?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean | null
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean | null
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          encoding_support: boolean | null
          id: string
          language: string | null
          last_active: string | null
          name: string
          notification_settings: Json | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          settings: Json | null
          shabbat_mode: boolean | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          encoding_support?: boolean | null
          id: string
          language?: string | null
          last_active?: string | null
          name: string
          notification_settings?: Json | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          settings?: Json | null
          shabbat_mode?: boolean | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          encoding_support?: boolean | null
          id?: string
          language?: string | null
          last_active?: string | null
          name?: string
          notification_settings?: Json | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          settings?: Json | null
          shabbat_mode?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          content: Json
          created_at: string
          event_id: string
          id: string
          reporter_id: string
          type: string
          updated_at: string
        }
        Insert: {
          content: Json
          created_at?: string
          event_id: string
          id?: string
          reporter_id: string
          type: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          event_id?: string
          id?: string
          reporter_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      change_status: "pending" | "approved" | "rejected"
      equipment_change_type: "create" | "update" | "delete"
      equipment_status: "available" | "in_use" | "maintenance" | "lost"
      user_role:
        | "admin"
        | "coordinator"
        | "service_girl"
        | "youth_volunteer"
        | "content_provider"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      change_status: ["pending", "approved", "rejected"],
      equipment_change_type: ["create", "update", "delete"],
      equipment_status: ["available", "in_use", "maintenance", "lost"],
      user_role: [
        "admin",
        "coordinator",
        "service_girl",
        "youth_volunteer",
        "content_provider",
      ],
    },
  },
} as const
