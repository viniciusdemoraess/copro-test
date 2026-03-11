export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      about_content: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          image_url: string | null
          section_key: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string | null
          section_key: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string | null
          section_key?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "about_content_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          description: string
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          description: string
          entity_id?: string | null
          entity_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      association_forms: {
        Row: {
          admin_notes: string | null
          birth_date: string | null
          cep: string | null
          city: string | null
          complement: string | null
          cpf: string | null
          created_at: string | null
          email: string
          email_confirmation: string | null
          full_name: string
          id: string
          marital_status: string | null
          nationality: string | null
          neighborhood: string | null
          number: string | null
          phones: Json | null
          profession: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          rg: string | null
          rg_orgao: string | null
          secondary_emails: Json | null
          state: string | null
          status: string | null
          street: string | null
          terms_accepted: boolean
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          admin_notes?: string | null
          birth_date?: string | null
          cep?: string | null
          city?: string | null
          complement?: string | null
          cpf?: string | null
          created_at?: string | null
          email: string
          email_confirmation?: string | null
          full_name: string
          id?: string
          marital_status?: string | null
          nationality?: string | null
          neighborhood?: string | null
          number?: string | null
          phones?: Json | null
          profession?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          rg?: string | null
          rg_orgao?: string | null
          secondary_emails?: Json | null
          state?: string | null
          status?: string | null
          street?: string | null
          terms_accepted?: boolean
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          admin_notes?: string | null
          birth_date?: string | null
          cep?: string | null
          city?: string | null
          complement?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string
          email_confirmation?: string | null
          full_name?: string
          id?: string
          marital_status?: string | null
          nationality?: string | null
          neighborhood?: string | null
          number?: string | null
          phones?: Json | null
          profession?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          rg?: string | null
          rg_orgao?: string | null
          secondary_emails?: Json | null
          state?: string | null
          status?: string | null
          street?: string | null
          terms_accepted?: boolean
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "association_forms_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidato_history: {
        Row: {
          action_type: string
          candidato_id: string | null
          created_at: string | null
          id: string
          new_value: string | null
          notes: string | null
          old_value: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          candidato_id?: string | null
          created_at?: string | null
          id?: string
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          candidato_id?: string | null
          created_at?: string | null
          id?: string
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidato_history_candidato_id_fkey"
            columns: ["candidato_id"]
            isOneToOne: false
            referencedRelation: "association_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidato_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      carousel_slides: {
        Row: {
          active: boolean | null
          created_at: string | null
          created_by: string | null
          id: string
          image_url: string
          link_url: string | null
          order_position: number
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url: string
          link_url?: string | null
          order_position: number
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string
          link_url?: string | null
          order_position?: number
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carousel_slides_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          recipient_email: string
          sent_at: string | null
          status: string | null
          subject: string
          template_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email: string
          sent_at?: string | null
          status?: string | null
          subject: string
          template_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email?: string
          sent_at?: string | null
          status?: string | null
          subject?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          available_variables: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          html_body: string
          id: string
          is_active: boolean | null
          name: string
          subject: string
          text_body: string | null
          type: Database["public"]["Enums"]["email_template_type"]
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          available_variables?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          html_body: string
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          text_body?: string | null
          type: Database["public"]["Enums"]["email_template_type"]
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          available_variables?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          html_body?: string
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          text_body?: string | null
          type?: Database["public"]["Enums"]["email_template_type"]
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_templates_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_video: {
        Row: {
          active: boolean | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_type: string
          video_url: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_type: string
          video_url: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_type?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "featured_video_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      info_cards: {
        Row: {
          active: boolean | null
          background_color: string | null
          category: string
          created_at: string | null
          created_by: string | null
          description: string
          icon_color: string | null
          icon_name: string | null
          id: string
          image_url: string | null
          link_text: string | null
          link_url: string | null
          order_position: number
          title: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          background_color?: string | null
          category: string
          created_at?: string | null
          created_by?: string | null
          description: string
          icon_color?: string | null
          icon_name?: string | null
          id?: string
          image_url?: string | null
          link_text?: string | null
          link_url?: string | null
          order_position: number
          title: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          background_color?: string | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          icon_color?: string | null
          icon_name?: string | null
          id?: string
          image_url?: string | null
          link_text?: string | null
          link_url?: string | null
          order_position?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "info_cards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          active: boolean | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          image_url: string
          order_position: number
          slug: string
          summary: string
          title: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url: string
          order_position?: number
          slug: string
          summary: string
          title: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string
          order_position?: number
          slug?: string
          summary?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      podcasts: {
        Row: {
          active: boolean | null
          created_at: string | null
          created_by: string | null
          description: string | null
          duration: string | null
          id: string
          order_position: number
          published_at: string | null
          thumbnail_url: string
          title: string
          updated_at: string | null
          view_count: number | null
          youtube_url: string
          youtube_video_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          order_position: number
          published_at?: string | null
          thumbnail_url: string
          title: string
          updated_at?: string | null
          view_count?: number | null
          youtube_url: string
          youtube_video_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          order_position?: number
          published_at?: string | null
          thumbnail_url?: string
          title?: string
          updated_at?: string | null
          view_count?: number | null
          youtube_url?: string
          youtube_video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "podcasts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      popup_video: {
        Row: {
          active: boolean | null
          created_at: string | null
          created_by: string | null
          delay_seconds: number | null
          id: string
          show_once_per_session: boolean | null
          title: string
          updated_at: string | null
          video_type: string
          video_url: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string | null
          delay_seconds?: number | null
          id?: string
          show_once_per_session?: boolean | null
          title: string
          updated_at?: string | null
          video_type: string
          video_url: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string | null
          delay_seconds?: number | null
          id?: string
          show_once_per_session?: boolean | null
          title?: string
          updated_at?: string | null
          video_type?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "popup_video_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          created_by: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          created_by?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          last_login?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_category: string
          setting_description: string | null
          setting_key: string
          setting_value: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_category?: string
          setting_description?: string | null
          setting_key: string
          setting_value?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_category?: string
          setting_description?: string | null
          setting_key?: string
          setting_value?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      stats_indicators: {
        Row: {
          active: boolean | null
          created_at: string | null
          created_by: string | null
          icon: string
          id: string
          label: string | null
          order_position: number
          prefix: string | null
          suffix: string | null
          updated_at: string | null
          value: number
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string | null
          icon: string
          id?: string
          label?: string | null
          order_position: number
          prefix?: string | null
          suffix?: string | null
          updated_at?: string | null
          value: number
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string | null
          icon?: string
          id?: string
          label?: string | null
          order_position?: number
          prefix?: string | null
          suffix?: string | null
          updated_at?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "stats_indicators_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      reorder_carousel_slides: {
        Args: { new_position: number; slide_id: string }
        Returns: undefined
      }
      reorder_info_cards: {
        Args: { card_id: string; new_position: number }
        Returns: undefined
      }
      reorder_podcasts: {
        Args: { new_position: number; podcast_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "editor"
      email_template_type: "user_confirmation" | "admin_notification" | "custom"
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
      app_role: ["admin", "editor"],
      email_template_type: [
        "user_confirmation",
        "admin_notification",
        "custom",
      ],
    },
  },
} as const
