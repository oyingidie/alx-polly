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
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string
          created_at?: string
        }
        Relationships: []
      }
      poll_categories: {
        Row: {
          poll_id: string
          category_id: string
        }
        Insert: {
          poll_id: string
          category_id: string
        }
        Update: {
          poll_id?: string
          category_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_categories_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          }
        ]
      }
      poll_options: {
        Row: {
          id: string
          poll_id: string
          text: string
          vote_count: number
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          text: string
          vote_count?: number
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          poll_id?: string
          text?: string
          vote_count?: number
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          }
        ]
      }
      polls: {
        Row: {
          id: string
          title: string
          description: string | null
          status: Database["public"]["Enums"]["poll_status"]
          created_by: string
          expires_at: string | null
          allow_multiple_votes: boolean
          is_anonymous: boolean
          total_votes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: Database["public"]["Enums"]["poll_status"]
          created_by: string
          expires_at?: string | null
          allow_multiple_votes?: boolean
          is_anonymous?: boolean
          total_votes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: Database["public"]["Enums"]["poll_status"]
          created_by?: string
          expires_at?: string | null
          allow_multiple_votes?: boolean
          is_anonymous?: boolean
          total_votes?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "polls_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      votes: {
        Row: {
          id: string
          poll_id: string
          option_id: string
          user_id: string | null
          ip_address: string | null
          user_agent: string | null
          status: Database["public"]["Enums"]["vote_status"]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          option_id: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          status?: Database["public"]["Enums"]["vote_status"]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          poll_id?: string
          option_id?: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          status?: Database["public"]["Enums"]["vote_status"]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      close_expired_polls: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_poll_with_options: {
        Args: {
          p_title: string
          p_description?: string
          p_expires_at?: string
          p_allow_multiple_votes?: boolean
          p_is_anonymous?: boolean
          p_options?: string[]
        }
        Returns: string
      }
    }
    Enums: {
      poll_status: "active" | "closed" | "draft"
      vote_status: "active" | "deleted"
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
    : never = never
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
    : never = never
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
    : never = never
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
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

// Convenience types for our app
export type Poll = Tables<'polls'>
export type PollInsert = TablesInsert<'polls'>
export type PollUpdate = TablesUpdate<'polls'>

export type PollOption = Tables<'poll_options'>
export type PollOptionInsert = TablesInsert<'poll_options'>
export type PollOptionUpdate = TablesUpdate<'poll_options'>

export type Vote = Tables<'votes'>
export type VoteInsert = TablesInsert<'votes'>
export type VoteUpdate = TablesUpdate<'votes'>

export type User = Tables<'users'>
export type UserInsert = TablesInsert<'users'>
export type UserUpdate = TablesUpdate<'users'>

export type Category = Tables<'categories'>
export type CategoryInsert = TablesInsert<'categories'>
export type CategoryUpdate = TablesUpdate<'categories'>

export type PollStatus = Enums<'poll_status'>
export type VoteStatus = Enums<'vote_status'>

// Extended types with relationships
export type PollWithOptions = Poll & {
  options: PollOption[]
  user?: User
  categories?: Category[]
}

export type PollWithDetails = Poll & {
  options: PollOption[]
  user: User
  categories: Category[]
  user_vote?: Vote
  total_votes: number
}

export type VoteWithDetails = Vote & {
  option: PollOption
  poll: Poll
  user?: User
}
