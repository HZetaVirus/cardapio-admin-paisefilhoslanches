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
      Adicionais: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          last_login: string | null
          password_hash: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          password_hash: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          password_hash?: string
        }
        Relationships: []
      }
      avaliacao_itens: {
        Row: {
          avaliacao: number
          cliente_id: number
          comentario: string | null
          id: number
          item_id: number
        }
        Insert: {
          avaliacao: number
          cliente_id: number
          comentario?: string | null
          id?: number
          item_id: number
        }
        Update: {
          avaliacao?: number
          cliente_id?: number
          comentario?: string | null
          id?: number
          item_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "avaliacao_itens_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacao_itens_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "cardapio"
            referencedColumns: ["id"]
          },
        ]
      }
      cardapio: {
        Row: {
          categoria_id: number
          descricao: string
          id: number
          imagem: string | null
          is_featured: boolean
          nome_item: string
          preco: number
        }
        Insert: {
          categoria_id: number
          descricao: string
          id?: number
          imagem?: string | null
          is_featured?: boolean
          nome_item: string
          preco: number
        }
        Update: {
          categoria_id?: number
          descricao?: string
          id?: number
          imagem?: string | null
          is_featured?: boolean
          nome_item?: string
          preco?: number
        }
        Relationships: [
          {
            foreignKeyName: "cardapio_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias: {
        Row: {
          id: number
          nome_categoria: string
        }
        Insert: {
          id?: number
          nome_categoria: string
        }
        Update: {
          id?: number
          nome_categoria?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          data_ultimo_pedido: string | null
          endereco: string
          id: number
          idMensagem: string | null
          nome_completo: string
          sessionID: string | null
          telefone: string
        }
        Insert: {
          data_ultimo_pedido?: string | null
          endereco: string
          id?: number
          idMensagem?: string | null
          nome_completo: string
          sessionID?: string | null
          telefone: string
        }
        Update: {
          data_ultimo_pedido?: string | null
          endereco?: string
          id?: number
          idMensagem?: string | null
          nome_completo?: string
          sessionID?: string | null
          telefone?: string
        }
        Relationships: []
      }
      configuracao_loja: {
        Row: {
          cardapio_ativo: boolean | null
          descricao: string | null
          endereco: string | null
          feriados_fechamento: Json | null
          horario_funcionamento: string | null
          id: number
          logo: string | null
          logo_bg_color: string | null
          modo_operacao: string | null
          ultima_verificacao_automatica: string | null
        }
        Insert: {
          cardapio_ativo?: boolean | null
          descricao?: string | null
          endereco?: string | null
          feriados_fechamento?: Json | null
          horario_funcionamento?: string | null
          id?: number
          logo?: string | null
          logo_bg_color?: string | null
          modo_operacao?: string | null
          ultima_verificacao_automatica?: string | null
        }
        Update: {
          cardapio_ativo?: boolean | null
          descricao?: string | null
          endereco?: string | null
          feriados_fechamento?: Json | null
          horario_funcionamento?: string | null
          id?: number
          logo?: string | null
          logo_bg_color?: string | null
          modo_operacao?: string | null
          ultima_verificacao_automatica?: string | null
        }
        Relationships: []
      }
      cupons_fidelidade: {
        Row: {
          id: number
          cliente_id: number
          premio_id: number
          premio_nome: string
          premio_descricao: string
          premio_tipo: string
          premio_valor: number | null
          produto_id: number | null
          usado: boolean
          data_ganho: string
          data_uso: string | null
          data_expiracao: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          cliente_id: number
          premio_id: number
          premio_nome: string
          premio_descricao: string
          premio_tipo: string
          premio_valor?: number | null
          produto_id?: number | null
          usado?: boolean
          data_ganho?: string
          data_uso?: string | null
          data_expiracao: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          cliente_id?: number
          premio_id?: number
          premio_nome?: string
          premio_descricao?: string
          premio_tipo?: string
          premio_valor?: number | null
          produto_id?: number | null
          usado?: boolean
          data_ganho?: string
          data_uso?: string | null
          data_expiracao?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cupons_fidelidade_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_cupons_fidelidade_produto_id"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "cardapio"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_pedido: {
        Row: {
          id: number
          item_id: number
          observacao: string | null
          pedido_id: number
          preco_unitario: number
          quantidade: number
        }
        Insert: {
          id?: number
          item_id: number
          observacao?: string | null
          pedido_id: number
          preco_unitario: number
          quantidade: number
        }
        Update: {
          id?: number
          item_id?: number
          observacao?: string | null
          pedido_id?: number
          preco_unitario?: number
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "itens_pedido_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "cardapio"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_pedido_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      n8n_chat_histories_agendamento: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      taxas_entrega: {
        Row: {
          id: number
          bairro: string
          taxa: number
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          bairro: string
          taxa?: number
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          bairro?: string
          taxa?: number
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      pedidos: {
        Row: {
          cliente_id: number
          data_pedido: string
          forma_pagamento: string
          id: number
          observacao: string | null
          status: string
          troco_para: number | null
          valor_total: number
        }
        Insert: {
          cliente_id: number
          data_pedido?: string
          forma_pagamento: string
          id?: number
          observacao?: string | null
          status: string
          troco_para?: number | null
          valor_total: number
        }
        Update: {
          cliente_id?: number
          data_pedido?: string
          forma_pagamento?: string
          id?: number
          observacao?: string | null
          status?: string
          troco_para?: number | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      taxas_entrega: {
        Row: {
          id: number
          bairro: string
          taxa: number
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          bairro: string
          taxa?: number
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          bairro?: string
          taxa?: number
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_admin_user: {
        Args: { input_email: string; input_password: string }
        Returns: string
      }
      verify_admin_password: {
        Args: { input_email: string; input_password: string }
        Returns: {
          is_valid: boolean
          user_id: string
        }[]
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
    Enums: {},
  },
} as const
