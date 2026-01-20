import { User } from "@supabase/supabase-js";

// Database Types - will be auto-generated from Supabase later
export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          price: number;
          status: "draft" | "published";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["products"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      seo_metadata: {
        Row: {
          id: string;
          entity_type: "product" | "category" | "page";
          entity_id: string;
          meta_title: string | null;
          meta_description: string | null;
          og_title: string | null;
          og_description: string | null;
          og_image: string | null;
          canonical_url: string | null;
          robots: string | null;
          structured_data: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["seo_metadata"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["seo_metadata"]["Insert"]>;
      };
    };
  };
};

// App-level types
export type UserRole = "admin" | "editor" | "seo_manager";

export type AppUser = User & {
  role?: UserRole;
  metadata?: {
    role: UserRole;
  };
};

// Service response types
export type ServiceResponse<T> = {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
};

// SEO types
export type SEOMetadata = Database["public"]["Tables"]["seo_metadata"]["Row"];
export type SEOMetadataInsert =
  Database["public"]["Tables"]["seo_metadata"]["Insert"];
export type SEOMetadataUpdate =
  Database["public"]["Tables"]["seo_metadata"]["Update"];

// Product types
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
export type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

export type ProductWithSEO = Product & {
  seo_metadata?: SEOMetadata;
};
