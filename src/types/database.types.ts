export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          level: number | null
          meta_description: string | null
          meta_title: string | null
          name: string
          parent_id: string | null
          slug: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          level?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          parent_id?: string | null
          slug: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          level?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          parent_id?: string | null
          slug?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories_with_counts"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          discount_amount: number | null
          id: string
          order_id: string
          product_id: string | null
          product_image: string | null
          product_sku: string | null
          product_slug: string
          product_title: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          order_id: string
          product_id?: string | null
          product_image?: string | null
          product_sku?: string | null
          product_slug: string
          product_title: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          order_id?: string
          product_id?: string | null
          product_image?: string | null
          product_sku?: string | null
          product_slug?: string
          product_title?: string
          quantity?: number
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          order_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          order_id: string
          status: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          carrier: string | null
          coupon_code: string | null
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_notes: string | null
          customer_phone: string
          delivered_at: string | null
          delivery_lat: number | null
          delivery_lng: number | null
          delivery_location: string
          delivery_notes: string | null
          delivery_place_id: string | null
          discount_amount: number | null
          estimated_delivery: string | null
          id: string
          order_number: string
          payment_method: string
          payment_reference: string | null
          payment_status: string | null
          shipping_fee: number | null
          staff_notes: string | null
          status: string
          subtotal: number
          tax_amount: number | null
          total: number
          tracking_number: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          carrier?: string | null
          coupon_code?: string | null
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_notes?: string | null
          customer_phone: string
          delivered_at?: string | null
          delivery_lat?: number | null
          delivery_lng?: number | null
          delivery_location: string
          delivery_notes?: string | null
          delivery_place_id?: string | null
          discount_amount?: number | null
          estimated_delivery?: string | null
          id?: string
          order_number: string
          payment_method: string
          payment_reference?: string | null
          payment_status?: string | null
          shipping_fee?: number | null
          staff_notes?: string | null
          status?: string
          subtotal: number
          tax_amount?: number | null
          total: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          carrier?: string | null
          coupon_code?: string | null
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_notes?: string | null
          customer_phone?: string
          delivered_at?: string | null
          delivery_lat?: number | null
          delivery_lng?: number | null
          delivery_location?: string
          delivery_notes?: string | null
          delivery_place_id?: string | null
          discount_amount?: number | null
          estimated_delivery?: string | null
          id?: string
          order_number?: string
          payment_method?: string
          payment_reference?: string | null
          payment_status?: string | null
          shipping_fee?: number | null
          staff_notes?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          total?: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          content: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          sections: Json | null
          slug: string
          status: string | null
          template: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          sections?: Json | null
          slug: string
          status?: string | null
          template?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          sections?: Json | null
          slug?: string
          status?: string | null
          template?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          comment: string
          created_at: string | null
          helpful_count: number | null
          id: string
          images: string[] | null
          is_verified_purchase: boolean | null
          moderated_by: string | null
          moderation_notes: string | null
          not_helpful_count: number | null
          product_id: string
          rating: number
          reviewer_email: string | null
          reviewer_name: string
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          comment: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          images?: string[] | null
          is_verified_purchase?: boolean | null
          moderated_by?: string | null
          moderation_notes?: string | null
          not_helpful_count?: number | null
          product_id: string
          rating: number
          reviewer_email?: string | null
          reviewer_name: string
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          images?: string[] | null
          is_verified_purchase?: boolean | null
          moderated_by?: string | null
          moderation_notes?: string | null
          not_helpful_count?: number | null
          product_id?: string
          rating?: number
          reviewer_email?: string | null
          reviewer_name?: string
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_specifications: {
        Row: {
          created_at: string | null
          group_order: number | null
          id: string
          is_highlight: boolean | null
          product_id: string
          spec_group: string
          spec_icon: string | null
          spec_key: string
          spec_order: number | null
          spec_value: string
        }
        Insert: {
          created_at?: string | null
          group_order?: number | null
          id?: string
          is_highlight?: boolean | null
          product_id: string
          spec_group: string
          spec_icon?: string | null
          spec_key: string
          spec_order?: number | null
          spec_value: string
        }
        Update: {
          created_at?: string | null
          group_order?: number | null
          id?: string
          is_highlight?: boolean | null
          product_id?: string
          spec_group?: string
          spec_icon?: string | null
          spec_key?: string
          spec_order?: number | null
          spec_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_specifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_specifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          allow_backorder: boolean | null
          category_id: string | null
          compare_at_price: number | null
          cost_price: number | null
          created_at: string | null
          description: string | null
          dimensions: Json | null
          featured_image: string | null
          gallery_images: string[] | null
          id: string
          is_bestseller: boolean | null
          is_featured: boolean | null
          is_new_arrival: boolean | null
          low_stock_threshold: number | null
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string | null
          on_sale: boolean | null
          price: number
          published_at: string | null
          quantity: number | null
          requires_shipping: boolean | null
          shipping_class: string | null
          short_description: string | null
          sku: string | null
          slug: string
          status: string | null
          title: string
          track_inventory: boolean | null
          updated_at: string | null
          video_url: string | null
          visibility: string | null
          weight: number | null
        }
        Insert: {
          allow_backorder?: boolean | null
          category_id?: string | null
          compare_at_price?: number | null
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          dimensions?: Json | null
          featured_image?: string | null
          gallery_images?: string[] | null
          id?: string
          is_bestseller?: boolean | null
          is_featured?: boolean | null
          is_new_arrival?: boolean | null
          low_stock_threshold?: number | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          on_sale?: boolean | null
          price: number
          published_at?: string | null
          quantity?: number | null
          requires_shipping?: boolean | null
          shipping_class?: string | null
          short_description?: string | null
          sku?: string | null
          slug: string
          status?: string | null
          title: string
          track_inventory?: boolean | null
          updated_at?: string | null
          video_url?: string | null
          visibility?: string | null
          weight?: number | null
        }
        Update: {
          allow_backorder?: boolean | null
          category_id?: string | null
          compare_at_price?: number | null
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          dimensions?: Json | null
          featured_image?: string | null
          gallery_images?: string[] | null
          id?: string
          is_bestseller?: boolean | null
          is_featured?: boolean | null
          is_new_arrival?: boolean | null
          low_stock_threshold?: number | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          on_sale?: boolean | null
          price?: number
          published_at?: string | null
          quantity?: number | null
          requires_shipping?: boolean | null
          shipping_class?: string | null
          short_description?: string | null
          sku?: string | null
          slug?: string
          status?: string | null
          title?: string
          track_inventory?: boolean | null
          updated_at?: string | null
          video_url?: string | null
          visibility?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories_with_counts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          last_login: string | null
          login_count: number | null
          notes: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_login?: string | null
          login_count?: number | null
          notes?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_login?: string | null
          login_count?: number | null
          notes?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      review_votes: {
        Row: {
          created_at: string | null
          id: string
          ip_address: unknown
          is_helpful: boolean
          review_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: unknown
          is_helpful: boolean
          review_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: unknown
          is_helpful?: boolean
          review_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "product_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_logs: {
        Row: {
          action: string
          changes: Json | null
          created_at: string | null
          entity_id: string | null
          entity_name: string | null
          entity_type: string | null
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          ip_address: unknown
          last_activity: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          last_activity?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          last_activity?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      categories_with_counts: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string | null
          image_url: string | null
          level: number | null
          meta_description: string | null
          meta_title: string | null
          name: string | null
          parent_id: string | null
          parent_name: string | null
          parent_slug: string | null
          product_count: number | null
          slug: string | null
          status: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories_with_counts"
            referencedColumns: ["id"]
          },
        ]
      }
      orders_with_details: {
        Row: {
          carrier: string | null
          coupon_code: string | null
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          customer_notes: string | null
          customer_phone: string | null
          delivered_at: string | null
          delivery_lat: number | null
          delivery_lng: number | null
          delivery_location: string | null
          delivery_notes: string | null
          delivery_place_id: string | null
          discount_amount: number | null
          estimated_delivery: string | null
          id: string | null
          item_count: number | null
          order_number: string | null
          payment_method: string | null
          payment_reference: string | null
          payment_status: string | null
          shipping_fee: number | null
          staff_notes: string | null
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          total: number | null
          tracking_number: string | null
          updated_at: string | null
          user_email: string | null
          user_full_name: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products_with_details: {
        Row: {
          allow_backorder: boolean | null
          avg_rating: number | null
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          compare_at_price: number | null
          cost_price: number | null
          created_at: string | null
          description: string | null
          dimensions: Json | null
          discount_percentage: number | null
          featured_image: string | null
          gallery_images: string[] | null
          id: string | null
          is_bestseller: boolean | null
          is_featured: boolean | null
          is_new_arrival: boolean | null
          low_stock_threshold: number | null
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string | null
          on_sale: boolean | null
          price: number | null
          published_at: string | null
          quantity: number | null
          requires_shipping: boolean | null
          review_count: number | null
          shipping_class: string | null
          short_description: string | null
          sku: string | null
          slug: string | null
          status: string | null
          stock_status: string | null
          title: string | null
          track_inventory: boolean | null
          updated_at: string | null
          video_url: string | null
          visibility: string | null
          weight: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories_with_counts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      decrement_product_quantity: {
        Args: { product_id: string; quantity_to_remove: number }
        Returns: undefined
      }
      generate_order_number: { Args: never; Returns: string }
      get_category_path: { Args: { category_id: string }; Returns: string }
      get_product_avg_rating: {
        Args: { p_product_id: string }
        Returns: number
      }
      get_product_image_url: {
        Args: { bucket: string; path: string }
        Returns: string
      }
      get_product_review_count: {
        Args: { p_product_id: string }
        Returns: number
      }
      get_subcategories: {
        Args: { parent_category_id: string }
        Returns: {
          id: string
          level: number
          name: string
          slug: string
        }[]
      }
      increment_product_quantity: {
        Args: { product_id: string; quantity_to_add: number }
        Returns: undefined
      }
      log_user_activity: {
        Args: {
          p_action: string
          p_changes?: Json
          p_entity_id?: string
          p_entity_name?: string
          p_entity_type?: string
          p_user_id: string
        }
        Returns: undefined
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

