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
      outline: {
        Row: {
          created_at: string
          description: string | null
          id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      outline_elements: {
        Row: {
          created_at: string
          id: string
          outline_id: string | null
          position_end_time: string | null
          position_start_time: string | null
          updated_at: string | null
          video_embeddings: string[] | null
          video_end_time: string
          video_id: string
          video_start_time: string
          video_uuid: string
        }
        Insert: {
          created_at?: string
          id?: string
          outline_id?: string | null
          position_end_time?: string | null
          position_start_time?: string | null
          updated_at?: string | null
          video_embeddings?: string[] | null
          video_end_time: string
          video_id: string
          video_start_time: string
          video_uuid?: string
        }
        Update: {
          created_at?: string
          id?: string
          outline_id?: string | null
          position_end_time?: string | null
          position_start_time?: string | null
          updated_at?: string | null
          video_embeddings?: string[] | null
          video_end_time?: string
          video_id?: string
          video_start_time?: string
          video_uuid?: string
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
      video_embeddings: {
        Row: {
          embedding: string | null
          id: string
          text: string | null
          timestamp: string | null
          video_id: string
          video_uuid: string | null
        }
        Insert: {
          embedding?: string | null
          id?: string
          text?: string | null
          timestamp?: string | null
          video_id: string
          video_uuid?: string | null
        }
        Update: {
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
      [_ in never]: never
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
