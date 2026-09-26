
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "agents": {
                  Row: {
                    "business_name": string | null,"city": string | null,"code": string,"user_id": string
                  }
                  Insert: {
                    "business_name"?: string | null,"city"?: string | null,"code": string,"user_id": string
                  }
                  Update: {
                    "business_name"?: string | null,"city"?: string | null,"code"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "agents_user_id_fkey"
      columns: ["user_id"]
isOneToOne: true
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
                  ]
                },"cart_items": {
                  Row: {
                    "cart_id": string,"created_at": string,"custom_chest_cm": number | null,"custom_color_id": string | null,"custom_length_cm": number | null,"id": string,"po_batch_id": string,"product_id": string,"qty": number,"variant_id": string | null
                  }
                  Insert: {
                    "cart_id": string,"created_at"?: string,"custom_chest_cm"?: number | null,"custom_color_id"?: string | null,"custom_length_cm"?: number | null,"id"?: string,"po_batch_id": string,"product_id": string,"qty": number,"variant_id"?: string | null
                  }
                  Update: {
                    "cart_id"?: string,"created_at"?: string,"custom_chest_cm"?: number | null,"custom_color_id"?: string | null,"custom_length_cm"?: number | null,"id"?: string,"po_batch_id"?: string,"product_id"?: string,"qty"?: number,"variant_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "cart_items_cart_id_fkey"
      columns: ["cart_id"]
isOneToOne: false
      referencedRelation: "carts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "cart_items_custom_color_id_fkey"
      columns: ["custom_color_id"]
isOneToOne: false
      referencedRelation: "product_colors"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "cart_items_po_batch_id_fkey"
      columns: ["po_batch_id"]
isOneToOne: false
      referencedRelation: "po_batches"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "cart_items_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "cart_items_variant_id_fkey"
      columns: ["variant_id"]
isOneToOne: false
      referencedRelation: "product_variants"
      referencedColumns: ["id"]
    }
                  ]
                },"carts": {
                  Row: {
                    "agent_id": string,"id": string,"updated_at": string
                  }
                  Insert: {
                    "agent_id": string,"id"?: string,"updated_at"?: string
                  }
                  Update: {
                    "agent_id"?: string,"id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "carts_agent_id_fkey"
      columns: ["agent_id"]
isOneToOne: true
      referencedRelation: "agents"
      referencedColumns: ["user_id"]
    }
                  ]
                },"categories": {
                  Row: {
                    "code": string,"id": string,"name": string
                  }
                  Insert: {
                    "code": string,"id"?: string,"name": string
                  }
                  Update: {
                    "code"?: string,"id"?: string,"name"?: string
                  }
                  Relationships: [
                    
                  ]
                },"login_attempts": {
                  Row: {
                    "created_at": string,"ip": unknown,"succeeded": boolean,"username": string
                  }
                  Insert: {
                    "created_at"?: string,"ip"?: unknown,"succeeded": boolean,"username": string
                  }
                  Update: {
                    "created_at"?: string,"ip"?: unknown,"succeeded"?: boolean,"username"?: string
                  }
                  Relationships: [
                    
                  ]
                },"po_batches": {
                  Row: {
                    "batch_no": number,"closes_at": string | null,"eta_days": number,"id": string,"label": string,"opens_at": string | null,"product_id": string,"status": string
                  }
                  Insert: {
                    "batch_no": number,"closes_at"?: string | null,"eta_days"?: number,"id"?: string,"label": string,"opens_at"?: string | null,"product_id": string,"status"?: string
                  }
                  Update: {
                    "batch_no"?: number,"closes_at"?: string | null,"eta_days"?: number,"id"?: string,"label"?: string,"opens_at"?: string | null,"product_id"?: string,"status"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "po_batches_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"product_colors": {
                  Row: {
                    "hex": string | null,"id": string,"name": string,"product_id": string,"sort": number
                  }
                  Insert: {
                    "hex"?: string | null,"id"?: string,"name": string,"product_id": string,"sort"?: number
                  }
                  Update: {
                    "hex"?: string | null,"id"?: string,"name"?: string,"product_id"?: string,"sort"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_colors_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"product_images": {
                  Row: {
                    "color_id": string | null,"id": string,"path": string,"product_id": string,"sort": number
                  }
                  Insert: {
                    "color_id"?: string | null,"id"?: string,"path": string,"product_id": string,"sort"?: number
                  }
                  Update: {
                    "color_id"?: string | null,"id"?: string,"path"?: string,"product_id"?: string,"sort"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_images_color_id_fkey"
      columns: ["color_id"]
isOneToOne: false
      referencedRelation: "product_colors"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "product_images_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"product_variants": {
                  Row: {
                    "color_id": string,"id": string,"is_active": boolean,"product_id": string,"size_code": string,"sku": string
                  }
                  Insert: {
                    "color_id": string,"id"?: string,"is_active"?: boolean,"product_id": string,"size_code": string,"sku": string
                  }
                  Update: {
                    "color_id"?: string,"id"?: string,"is_active"?: boolean,"product_id"?: string,"size_code"?: string,"sku"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_variants_color_id_fkey"
      columns: ["color_id"]
isOneToOne: false
      referencedRelation: "product_colors"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "product_variants_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "product_variants_size_code_fkey"
      columns: ["size_code"]
isOneToOne: false
      referencedRelation: "sizes"
      referencedColumns: ["code"]
    }
                  ]
                },"products": {
                  Row: {
                    "category_id": string,"created_at": string,"custom_size_enabled": boolean,"custom_unit_price": number | null,"description": string | null,"id": string,"name": string,"slug": string,"status": string
                  }
                  Insert: {
                    "category_id": string,"created_at"?: string,"custom_size_enabled"?: boolean,"custom_unit_price"?: number | null,"description"?: string | null,"id"?: string,"name": string,"slug": string,"status"?: string
                  }
                  Update: {
                    "category_id"?: string,"created_at"?: string,"custom_size_enabled"?: boolean,"custom_unit_price"?: number | null,"description"?: string | null,"id"?: string,"name"?: string,"slug"?: string,"status"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "products_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    }
                  ]
                },"sessions": {
                  Row: {
                    "created_at": string,"expires_at": string,"id": string,"last_seen_at": string | null,"token_hash": string,"user_agent": string | null,"user_id": string
                  }
                  Insert: {
                    "created_at"?: string,"expires_at": string,"id"?: string,"last_seen_at"?: string | null,"token_hash": string,"user_agent"?: string | null,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"expires_at"?: string,"id"?: string,"last_seen_at"?: string | null,"token_hash"?: string,"user_agent"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "sessions_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
                  ]
                },"size_prices": {
                  Row: {
                    "product_id": string,"size_code": string,"unit_price": number
                  }
                  Insert: {
                    "product_id": string,"size_code": string,"unit_price": number
                  }
                  Update: {
                    "product_id"?: string,"size_code"?: string,"unit_price"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "size_prices_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "size_prices_size_code_fkey"
      columns: ["size_code"]
isOneToOne: false
      referencedRelation: "sizes"
      referencedColumns: ["code"]
    }
                  ]
                },"sizes": {
                  Row: {
                    "code": string,"sort": number
                  }
                  Insert: {
                    "code": string,"sort": number
                  }
                  Update: {
                    "code"?: string,"sort"?: number
                  }
                  Relationships: [
                    
                  ]
                },"users": {
                  Row: {
                    "created_at": string,"full_name": string,"id": string,"is_active": boolean,"must_change_password": boolean,"password_hash": string,"phone": string | null,"role": Database["public"]['Enums']["app_role"],"username": string
                  }
                  Insert: {
                    "created_at"?: string,"full_name": string,"id"?: string,"is_active"?: boolean,"must_change_password"?: boolean,"password_hash": string,"phone"?: string | null,"role": Database["public"]['Enums']["app_role"],"username": string
                  }
                  Update: {
                    "created_at"?: string,"full_name"?: string,"id"?: string,"is_active"?: boolean,"must_change_password"?: boolean,"password_hash"?: string,"phone"?: string | null,"role"?: Database["public"]['Enums']["app_role"],"username"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "create_agent":
{ Args: { "p_business_name"?: string,"p_city"?: string,"p_code": string,"p_full_name": string,"p_password_hash": string,"p_phone"?: string,"p_username": string }; Returns: string
                           },
"price_quote":
{ Args: { "p_cart_id": string }; Returns: {
              "batch_label": string,"cart_item_id": string,"color_name": string,"custom_chest_cm": number,"custom_length_cm": number,"is_orderable": boolean,"line_total": number,"po_batch_id": string,"product_id": string,"product_name": string,"qty": number,"size_code": string,"unit_price": number,"variant_id": string
            }[]
                           },
"sync_product_variants":
{ Args: { "p_product_id": string }; Returns: undefined
                           }
          }
          Enums: {
            "app_role": "admin"|"agent"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "app_role": ["admin", "agent"]
          }
        }
} as const

