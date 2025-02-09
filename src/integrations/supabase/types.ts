export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
          required_service_girls?: number | null
          required_youth_volunteers?: number | null
          setup_time?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
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
          created_at: string
          email: string | null
          id: string
          language: string | null
          name: string
          notification_settings: Json | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          shabbat_mode: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          language?: string | null
          name: string
          notification_settings?: Json | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          shabbat_mode?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          language?: string | null
          name?: string
          notification_settings?: Json | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
