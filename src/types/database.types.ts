// ==========================================
// 1. GLOBAL ENUMS
// ==========================================
export type RoleType = 'SUPERADMIN' | 'CLIENT';

// ==========================================
// 2. CORE TABLES (AUTHENTICATION & ROLES)
// ==========================================

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  created_at: string;
}

export interface Role {
  id: string;
  role_name: RoleType;
  created_at: string;
}

export interface UserRole {
  user_id: string;
  role_id: string;
  assigned_at: string;
}

export interface UserToken {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  is_revoked: boolean;
  expires_at: string;
  created_at: string;
}

export interface SessionDuration {
  id: string;
  name: string;
  duration_seconds: number | null;
  created_at: string;
}

// ==========================================
// 3. APPLICATION TABLES (MATH TRACING ENGINE)
// ==========================================

export interface Session {
  id: string;
  user_id: string;
  operation_type: string;
  left_number_config: Record<string, any>;
  right_number_config: Record<string, any>;
  duration_id: string | null;
  created_at: string;
}

export interface SessionAttempt {
  id: string;
  session_id: string;
  left_number: number;
  right_number: number;
  user_answer: number | null;
  correct_answer: number;
  is_correct: boolean;
  is_timeout: boolean;
  is_skipped: boolean;
  response_time_ms: number;
  created_at: string;
}

// ==========================================
// SUPABASE DATABASE DEFINITION
// ==========================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'created_at'> & { created_at?: string };
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
        Relationships: [];
      };
      roles: {
        Row: Role;
        Insert: Omit<Role, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Role, 'id' | 'created_at'>>;
        Relationships: [];
      };
      user_roles: {
        Row: UserRole;
        Insert: Omit<UserRole, 'assigned_at'> & { assigned_at?: string };
        Update: Partial<Omit<UserRole, 'user_id' | 'role_id' | 'assigned_at'>>;
        Relationships: [
          {
            foreignKeyName: 'user_roles_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_roles_role_id_fkey';
            columns: ['role_id'];
            referencedRelation: 'roles';
            referencedColumns: ['id'];
          }
        ];
      };
      session_durations: {
        Row: SessionDuration;
        Insert: Omit<SessionDuration, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<SessionDuration, 'id' | 'created_at'>>;
        Relationships: [];
      };
      user_tokens: {
        Row: UserToken;
        Insert: Omit<UserToken, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<UserToken, 'id' | 'created_at'>>;
        Relationships: [
          {
            foreignKeyName: 'user_tokens_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      sessions: {
        Row: Session;
        Insert: Omit<Session, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Session, 'id' | 'created_at'>>;
        Relationships: [
          {
            foreignKeyName: 'sessions_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'sessions_duration_id_fkey';
            columns: ['duration_id'];
            referencedRelation: 'session_durations';
            referencedColumns: ['id'];
          }
        ];
      };
      session_attempts: {
        Row: SessionAttempt;
        Insert: Omit<SessionAttempt, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<SessionAttempt, 'id' | 'created_at'>>;
        Relationships: [
          {
            foreignKeyName: 'session_attempts_session_id_fkey';
            columns: ['session_id'];
            referencedRelation: 'sessions';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      RoleType: RoleType;
    };
    CompositeTypes: Record<string, never>;
  };
}
