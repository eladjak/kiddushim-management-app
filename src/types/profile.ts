
export type RoleType = "admin" | "coordinator" | "youth_volunteer" | "service_girl" | "content_provider";

export interface ProfileType {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: RoleType;
  language: string;
  shabbat_mode: boolean;
  created_at?: string;
  updated_at?: string;
}
