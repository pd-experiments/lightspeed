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
      compliance_docs: {
        Row: {
          created_at: string | null
          embeddings: Json | null
          id: string
          text: string | null
          title: string | null
          type: Database["public"]["Enums"]["govtType"] | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          embeddings?: Json | null
          id?: string
          text?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["govtType"] | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          embeddings?: Json | null
          id?: string
          text?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["govtType"] | null
          url?: string | null
        }
        Relationships: []
      }
      frames_records: {
        Row: {
          created_at: string
          embedding: string | null
          frame_number: string | null
          id: string
          storage_path: string | null
          timestamp: string | null
          video_id: string | null
          video_uuid: string | null
        }
        Insert: {
          created_at?: string
          embedding?: string | null
          frame_number?: string | null
          id?: string
          storage_path?: string | null
          timestamp?: string | null
          video_id?: string | null
          video_uuid?: string | null
        }
        Update: {
          created_at?: string
          embedding?: string | null
          frame_number?: string | null
          id?: string
          storage_path?: string | null
          timestamp?: string | null
          video_id?: string | null
          video_uuid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "frames_video_uuid_fkey"
            columns: ["video_uuid"]
            isOneToOne: false
            referencedRelation: "youtube"
            referencedColumns: ["id"]
          },
        ]
      }
      grouped_video_embeddings: {
        Row: {
          created_at: string
          duration: string
          embedding: string | null
          id: string
          soundbytes: string[]
          text: string | null
          timestamp: string
          updated_at: string
          video_uuid: string
        }
        Insert: {
          created_at?: string
          duration?: string
          embedding?: string | null
          id?: string
          soundbytes?: string[]
          text?: string | null
          timestamp: string
          updated_at?: string
          video_uuid?: string
        }
        Update: {
          created_at?: string
          duration?: string
          embedding?: string | null
          id?: string
          soundbytes?: string[]
          text?: string | null
          timestamp?: string
          updated_at?: string
          video_uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "grouped_video_embeddings_video_uuid_fkey"
            columns: ["video_uuid"]
            isOneToOne: false
            referencedRelation: "youtube"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          article_html: string | null
          authors: string[] | null
          created_at: string
          html: string | null
          id: string
          keywords: string[] | null
          meta_keywords: string[] | null
          movies: string[] | null
          publish_date: string | null
          source_url: string | null
          summary: string | null
          tags: string[] | null
          text: string | null
          title: string | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          article_html?: string | null
          authors?: string[] | null
          created_at?: string
          html?: string | null
          id?: string
          keywords?: string[] | null
          meta_keywords?: string[] | null
          movies?: string[] | null
          publish_date?: string | null
          source_url?: string | null
          summary?: string | null
          tags?: string[] | null
          text?: string | null
          title?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          article_html?: string | null
          authors?: string[] | null
          created_at?: string
          html?: string | null
          id?: string
          keywords?: string[] | null
          meta_keywords?: string[] | null
          movies?: string[] | null
          publish_date?: string | null
          source_url?: string | null
          summary?: string | null
          tags?: string[] | null
          text?: string | null
          title?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      outline: {
        Row: {
          compliance_doc: string | null
          compliance_report: Json | null
          created_at: string
          description: string | null
          full_script: Json | null
          id: string
          script_generation_progress: number | null
          status: Database["public"]["Enums"]["outlineStatus"] | null
          title: string | null
          updated_at: string
        }
        Insert: {
          compliance_doc?: string | null
          compliance_report?: Json | null
          created_at?: string
          description?: string | null
          full_script?: Json | null
          id?: string
          script_generation_progress?: number | null
          status?: Database["public"]["Enums"]["outlineStatus"] | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          compliance_doc?: string | null
          compliance_report?: Json | null
          created_at?: string
          description?: string | null
          full_script?: Json | null
          id?: string
          script_generation_progress?: number | null
          status?: Database["public"]["Enums"]["outlineStatus"] | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "outline_compliance_doc_fkey"
            columns: ["compliance_doc"]
            isOneToOne: false
            referencedRelation: "compliance_docs"
            referencedColumns: ["id"]
          },
        ]
      }
      outline_elements: {
        Row: {
          created_at: string
          description: string | null
          id: string
          instructions: string | null
          outline_id: string | null
          position_end_time: string | null
          position_start_time: string | null
          script: Json | null
          sources: string | null
          type: Database["public"]["Enums"]["outlineElementType"] | null
          updated_at: string | null
          video_embeddings: string[] | null
          video_end_time: string | null
          video_id: string | null
          video_start_time: string | null
          video_uuid: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          instructions?: string | null
          outline_id?: string | null
          position_end_time?: string | null
          position_start_time?: string | null
          script?: Json | null
          sources?: string | null
          type?: Database["public"]["Enums"]["outlineElementType"] | null
          updated_at?: string | null
          video_embeddings?: string[] | null
          video_end_time?: string | null
          video_id?: string | null
          video_start_time?: string | null
          video_uuid?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          instructions?: string | null
          outline_id?: string | null
          position_end_time?: string | null
          position_start_time?: string | null
          script?: Json | null
          sources?: string | null
          type?: Database["public"]["Enums"]["outlineElementType"] | null
          updated_at?: string | null
          video_embeddings?: string[] | null
          video_end_time?: string | null
          video_id?: string | null
          video_start_time?: string | null
          video_uuid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outline_elements_outline_id_fkey"
            columns: ["outline_id"]
            isOneToOne: false
            referencedRelation: "outline"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outline_elements_video_uuid_fkey"
            columns: ["video_uuid"]
            isOneToOne: false
            referencedRelation: "youtube"
            referencedColumns: ["id"]
          },
        ]
      }
      todos: {
        Row: {
          created_at: string
          id: string
          status: Database["public"]["Enums"]["todoStatusType"]
          text: string
          user: Database["public"]["Enums"]["simpleUserType"]
        }
        Insert: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["todoStatusType"]
          text: string
          user: Database["public"]["Enums"]["simpleUserType"]
        }
        Update: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["todoStatusType"]
          text?: string
          user?: Database["public"]["Enums"]["simpleUserType"]
        }
        Relationships: []
      }
      video_embeddings: {
        Row: {
          duration: string
          embedding: string | null
          id: string
          text: string | null
          timestamp: string | null
          video_id: string
          video_uuid: string | null
        }
        Insert: {
          duration?: string
          embedding?: string | null
          id?: string
          text?: string | null
          timestamp?: string | null
          video_id: string
          video_uuid?: string | null
        }
        Update: {
          duration?: string
          embedding?: string | null
          id?: string
          text?: string | null
          timestamp?: string | null
          video_id?: string
          video_uuid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_embeddings_video_uuid_fkey"
            columns: ["video_uuid"]
            isOneToOne: false
            referencedRelation: "youtube"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube: {
        Row: {
          created_at: string
          description: string | null
          id: string
          published_at: string | null
          title: string | null
          transcript: Json | null
          video_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          published_at?: string | null
          title?: string | null
          transcript?: Json | null
          video_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          published_at?: string | null
          title?: string | null
          transcript?: Json | null
          video_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      fetch_random_clips: {
        Args: Record<PropertyKey, never>
        Returns: {
          video_uuid: string
          video_id: string
          title: string
          description: string
          start_timestamp: string
          end_timestamp: string
          text: string
        }[]
      }
      fetch_random_clips_grouped_ve: {
        Args: Record<PropertyKey, never>
        Returns: {
          video_uuid: string
          video_id: string
          title: string
          description: string
          start_timestamp: string
          end_timestamp: string
          text: string
        }[]
      }
      fetch_youtube_videos_with_embeddings_records: {
        Args: Record<PropertyKey, never>
        Returns: {
          video_id: string
        }[]
      }
      get_grouped_video_embeddings: {
        Args: Record<PropertyKey, never>
        Returns: {
          video_uuid: string
          soundbytes: Json[]
        }[]
      }
      get_latest_unique_youtube_videos: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          description: string | null
          id: string
          published_at: string | null
          title: string | null
          transcript: Json | null
          video_id: string | null
        }[]
      }
      halfvec_avg: {
        Args: {
          "": number[]
        }
        Returns: unknown
      }
      halfvec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      halfvec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      hnsw_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnswhandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflathandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      json_matches_schema: {
        Args: {
          schema: Json
          instance: Json
        }
        Returns: boolean
      }
      jsonb_matches_schema: {
        Args: {
          schema: Json
          instance: Json
        }
        Returns: boolean
      }
      jsonschema_is_valid: {
        Args: {
          schema: Json
        }
        Returns: boolean
      }
      jsonschema_validation_errors: {
        Args: {
          schema: Json
          instance: Json
        }
        Returns: string[]
      }
      l2_norm:
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      l2_normalize:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      match_documents: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
          video_uuid_specific: string
        }
        Returns: {
          video_uuid: string
          timestamp: string
          text: string
          similarity: number
        }[]
      }
      match_documents_grouped: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
        }
        Returns: {
          video_uuid: string
          video_id: string
          title: string
          description: string
          published_at: string
          start_timestamp: string
          end_timestamp: string
          text: string
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      sparsevec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      vector_avg: {
        Args: {
          "": number[]
        }
        Returns: string
      }
      vector_dims:
        | {
            Args: {
              "": string
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      vector_norm: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
    }
    Enums: {
      govtType: "FEDERAL" | "STATE" | "LOCAL"
      outlineElementType: "VIDEO" | "TRANSITION"
      outlineStatus:
        | "INITIALIZED"
        | "EDITING"
        | "GENERATING"
        | "SCRIPT_FINALIZED"
        | "COMPLIANCE_CHECK"
        | "PERSONALIZATION"
      simpleUserType: "PRANAV" | "DINESH"
      todoStatusType: "TODO" | "IN_PROGRESS" | "DONE"
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
