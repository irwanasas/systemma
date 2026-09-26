
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
                },"announcements": {
                  Row: {
                    "author_id": string,"body": string,"id": string,"published_at": string,"title": string
                  }
                  Insert: {
                    "author_id": string,"body": string,"id"?: string,"published_at"?: string,"title": string
                  }
                  Update: {
                    "author_id"?: string,"body"?: string,"id"?: string,"published_at"?: string,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "announcements_author_id_fkey"
      columns: ["author_id"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
                  ]
                },"app_settings": {
                  Row: {
                    "key": string,"value": NonNullable<Json>
                  }
                  Insert: {
                    "key": string,"value": NonNullable<Json>
                  }
                  Update: {
                    "key"?: string,"value"?: NonNullable<Json>
                  }
                  Relationships: [
                    
                  ]
                },"audit_logs": {
                  Row: {
                    "action": string,"actor_id": string | null,"after": Json | null,"before": Json | null,"created_at": string,"entity": string,"entity_id": string | null,"id": string
                  }
                  Insert: {
                    "action": string,"actor_id"?: string | null,"after"?: Json | null,"before"?: Json | null,"created_at"?: string,"entity": string,"entity_id"?: string | null,"id"?: string
                  }
                  Update: {
                    "action"?: string,"actor_id"?: string | null,"after"?: Json | null,"before"?: Json | null,"created_at"?: string,"entity"?: string,"entity_id"?: string | null,"id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "audit_logs_actor_id_fkey"
      columns: ["actor_id"]
isOneToOne: false
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
                },"document_counters": {
                  Row: {
                    "kind": string,"last_value": number,"year": number
                  }
                  Insert: {
                    "kind": string,"last_value": number,"year": number
                  }
                  Update: {
                    "kind"?: string,"last_value"?: number,"year"?: number
                  }
                  Relationships: [
                    
                  ]
                },"invoices": {
                  Row: {
                    "id": string,"issued_at": string,"number": string,"order_id": string,"settled_at": string | null
                  }
                  Insert: {
                    "id"?: string,"issued_at"?: string,"number": string,"order_id": string,"settled_at"?: string | null
                  }
                  Update: {
                    "id"?: string,"issued_at"?: string,"number"?: string,"order_id"?: string,"settled_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "invoices_order_id_fkey"
      columns: ["order_id"]
isOneToOne: true
      referencedRelation: "orders"
      referencedColumns: ["id"]
    }
                  ]
                },"login_attempts": {
                  Row: {
                    "created_at": string,"id": number,"ip": unknown,"succeeded": boolean,"username": string
                  }
                  Insert: {
                    "created_at"?: string,"id"?: never,"ip"?: unknown,"succeeded": boolean,"username": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: never,"ip"?: unknown,"succeeded"?: boolean,"username"?: string
                  }
                  Relationships: [
                    
                  ]
                },"notifications": {
                  Row: {
                    "created_at": string,"id": string,"kind": string,"payload": NonNullable<Json>,"read_at": string | null,"recipient_id": string
                  }
                  Insert: {
                    "created_at"?: string,"id"?: string,"kind": string,"payload": NonNullable<Json>,"read_at"?: string | null,"recipient_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"kind"?: string,"payload"?: NonNullable<Json>,"read_at"?: string | null,"recipient_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "notifications_recipient_id_fkey"
      columns: ["recipient_id"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
                  ]
                },"order_items": {
                  Row: {
                    "color_name": string,"custom_chest_cm": number | null,"custom_length_cm": number | null,"id": string,"line_total": number,"order_id": string,"product_id": string,"product_name": string,"qty": number,"size_code": string | null,"unit_price": number,"variant_id": string | null
                  }
                  Insert: {
                    "color_name": string,"custom_chest_cm"?: number | null,"custom_length_cm"?: number | null,"id"?: string,"line_total": number,"order_id": string,"product_id": string,"product_name": string,"qty": number,"size_code"?: string | null,"unit_price": number,"variant_id"?: string | null
                  }
                  Update: {
                    "color_name"?: string,"custom_chest_cm"?: number | null,"custom_length_cm"?: number | null,"id"?: string,"line_total"?: number,"order_id"?: string,"product_id"?: string,"product_name"?: string,"qty"?: number,"size_code"?: string | null,"unit_price"?: number,"variant_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "order_items_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "order_items_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "order_items_variant_id_fkey"
      columns: ["variant_id"]
isOneToOne: false
      referencedRelation: "product_variants"
      referencedColumns: ["id"]
    }
                  ]
                },"orders": {
                  Row: {
                    "agent_id": string,"checkout_idempotency_key": string,"created_at": string,"dp_amount": number,"dp_due_at": string,"dp_received_at": string | null,"eta_at": string | null,"id": string,"number": string,"po_batch_id": string,"settled_at": string | null,"settlement_amount": number,"shipped_at": string | null,"status": Database["public"]['Enums']["order_status"],"subtotal": number
                  }
                  Insert: {
                    "agent_id": string,"checkout_idempotency_key": string,"created_at"?: string,"dp_amount": number,"dp_due_at": string,"dp_received_at"?: string | null,"eta_at"?: string | null,"id"?: string,"number": string,"po_batch_id": string,"settled_at"?: string | null,"settlement_amount": number,"shipped_at"?: string | null,"status"?: Database["public"]['Enums']["order_status"],"subtotal": number
                  }
                  Update: {
                    "agent_id"?: string,"checkout_idempotency_key"?: string,"created_at"?: string,"dp_amount"?: number,"dp_due_at"?: string,"dp_received_at"?: string | null,"eta_at"?: string | null,"id"?: string,"number"?: string,"po_batch_id"?: string,"settled_at"?: string | null,"settlement_amount"?: number,"shipped_at"?: string | null,"status"?: Database["public"]['Enums']["order_status"],"subtotal"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "orders_agent_id_fkey"
      columns: ["agent_id"]
isOneToOne: false
      referencedRelation: "agents"
      referencedColumns: ["user_id"]
    },{
      foreignKeyName: "orders_po_batch_id_fkey"
      columns: ["po_batch_id"]
isOneToOne: false
      referencedRelation: "po_batches"
      referencedColumns: ["id"]
    }
                  ]
                },"payments": {
                  Row: {
                    "amount": number,"created_at": string,"id": string,"idempotency_key": string,"method": string,"order_id": string,"proof_path": string | null,"purpose": string,"reject_reason": string | null,"status": string,"verified_at": string | null,"verified_by": string | null
                  }
                  Insert: {
                    "amount": number,"created_at"?: string,"id"?: string,"idempotency_key": string,"method"?: string,"order_id": string,"proof_path"?: string | null,"purpose": string,"reject_reason"?: string | null,"status"?: string,"verified_at"?: string | null,"verified_by"?: string | null
                  }
                  Update: {
                    "amount"?: number,"created_at"?: string,"id"?: string,"idempotency_key"?: string,"method"?: string,"order_id"?: string,"proof_path"?: string | null,"purpose"?: string,"reject_reason"?: string | null,"status"?: string,"verified_at"?: string | null,"verified_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "payments_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "payments_verified_by_fkey"
      columns: ["verified_by"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
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
            "agent_payload":
{ Args: { "p_agent_id": string }; Returns: Json
                           },
"assert_active_role":
{ Args: { "p_actor_id": string,"p_role": Database["public"]['Enums']["app_role"] }; Returns: undefined
                           },
"cancel_order":
{ Args: { "p_actor_id": string,"p_order_id": string }; Returns: undefined
                           },
"cart_clear":
{ Args: { "p_actor_id": string }; Returns: undefined
                           },
"cart_remove_item":
{ Args: { "p_actor_id": string,"p_cart_item_id": string }; Returns: undefined
                           },
"cart_upsert_item":
{ Args: { "p_actor_id": string,"p_cart_item_id"?: string,"p_custom_chest_cm"?: number,"p_custom_color_id"?: string,"p_custom_length_cm"?: number,"p_po_batch_id": string,"p_qty": number,"p_variant_id"?: string }; Returns: string
                           },
"checkout_cart":
{ Args: { "p_actor_id": string,"p_idempotency_key": string }; Returns: {
              "order_id": string,"order_number": string
            }[]
                           },
"cleanup_auth_records":
{ Args: Record<PropertyKey, never>; Returns: undefined
                           },
"create_agent":
{ Args: { "p_business_name"?: string,"p_city"?: string,"p_code": string,"p_full_name": string,"p_password_hash": string,"p_phone"?: string,"p_username": string }; Returns: string
                           },
"dp_amount_for":
{ Args: { "p_subtotal": number }; Returns: number
                           },
"expire_unpaid_orders":
{ Args: Record<PropertyKey, never>; Returns: number
                           },
"mark_settled":
{ Args: { "p_actor_id": string,"p_order_id": string }; Returns: undefined
                           },
"next_document_number":
{ Args: { "p_prefix": string }; Returns: string
                           },
"notify_admins":
{ Args: { "p_kind": string,"p_payload": Json }; Returns: undefined
                           },
"order_transition":
{ Args: { "p_actor_id": string,"p_order_id": string,"p_to_status": Database["public"]['Enums']["order_status"] }; Returns: undefined
                           },
"order_transition_allowed":
{ Args: { "p_from": Database["public"]['Enums']["order_status"],"p_to": Database["public"]['Enums']["order_status"] }; Returns: boolean
                           },
"price_quote":
{ Args: { "p_cart_id": string }; Returns: {
              "batch_label": string,"cart_item_id": string,"color_name": string,"custom_chest_cm": number,"custom_length_cm": number,"is_orderable": boolean,"line_total": number,"po_batch_id": string,"product_id": string,"product_name": string,"qty": number,"size_code": string,"unit_price": number,"variant_id": string
            }[]
                           },
"recap_by_agent_series":
{ Args: { "p_from": string,"p_to": string }; Returns: {
              "agent_code": string,"agent_id": string,"agent_name": string,"batch_label": string,"category_code": string,"category_name": string,"dp_received": number,"order_count": number,"order_value": number,"product_name": string,"qty": number,"settlement_received": number
            }[]
                           },
"review_dp":
{ Args: { "p_actor_id": string,"p_approve": boolean,"p_payment_id": string,"p_reason"?: string }; Returns: undefined
                           },
"setting":
{ Args: { "p_key": string }; Returns: Json
                           },
"submit_dp_proof":
{ Args: { "p_actor_id": string,"p_amount": number,"p_idempotency_key": string,"p_order_id": string,"p_proof_path": string }; Returns: string
                           },
"sync_product_variants":
{ Args: { "p_product_id": string }; Returns: undefined
                           },
"write_audit":
{ Args: { "p_action": string,"p_actor_id": string,"p_after": Json,"p_before": Json,"p_entity": string,"p_entity_id": string }; Returns: undefined
                           }
          }
          Enums: {
            "app_role": "admin"|"agent","order_status": "AWAITING_DP"|"DP_UNDER_REVIEW"|"DP_RECEIVED"|"IN_PRODUCTION"|"AWAITING_SETTLEMENT"|"SETTLED"|"SHIPPED"|"COMPLETED"|"CANCELLED"|"EXPIRED"
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
            "app_role": ["admin", "agent"],"order_status": ["AWAITING_DP", "DP_UNDER_REVIEW", "DP_RECEIVED", "IN_PRODUCTION", "AWAITING_SETTLEMENT", "SETTLED", "SHIPPED", "COMPLETED", "CANCELLED", "EXPIRED"]
          }
        }
} as const

