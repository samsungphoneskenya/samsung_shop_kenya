import { SupabaseClient } from "@supabase/supabase-js";
import { Database, Product, ProductWithSEO } from "@/types";
import {
  ProductInsert,
  ProductUpdate,
  ProductQuery,
  productInsertSchema,
  productUpdateSchema,
  productQuerySchema,
} from "@/lib/validators/product.schema";
import {
  NotFoundError,
  ValidationError,
  handleError,
} from "@/lib/utils/errors";
import { revalidatePath, revalidateTag } from "next/cache";

export class ProductService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Get all products with optional filtering
   */
  async getProducts(query: Partial<ProductQuery> = {}) {
    try {
      // Validate query params
      const validated = productQuerySchema.parse(query);

      let queryBuilder = this.supabase
        .from("products")
        .select("*, seo_metadata(*)", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(validated.offset, validated.offset + validated.limit - 1);

      // Apply filters
      if (validated.status) {
        queryBuilder = queryBuilder.eq("status", validated.status);
      }

      if (validated.search) {
        queryBuilder = queryBuilder.ilike("title", `%${validated.search}%`);
      }

      const { data, error, count } = await queryBuilder;

      if (error) throw error;

      return {
        data: data as ProductWithSEO[],
        count: count || 0,
        hasMore: validated.offset + validated.limit < (count || 0),
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: string): Promise<ProductWithSEO> {
    try {
      const { data, error } = await this.supabase
        .from("products")
        .select("*, seo_metadata(*)")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError("Product not found");

      return data as ProductWithSEO;
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * Get a single product by slug (for public pages)
   */
  async getProductBySlug(slug: string): Promise<ProductWithSEO> {
    try {
      const { data, error } = await this.supabase
        .from("products")
        .select("*, seo_metadata(*)")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError("Product not found");

      return data as ProductWithSEO;
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * Create a new product
   */
  async createProduct(input: ProductInsert): Promise<Product> {
    try {
      // Validate input
      const validated = productInsertSchema.parse(input);

      // Check if slug already exists
      const { data: existing } = await this.supabase
        .from("products")
        .select("id")
        .eq("slug", validated.slug)
        .single();

      if (existing) {
        throw new ValidationError("A product with this slug already exists");
      }

      // Create product - validated by zod. Supabase types mismatch custom Database schema.
      const { data, error } = await this.supabase
        .from("products")
        // @ts-expect-error - Insert expects 'never' due to custom Database schema typing
        .insert(validated)
        .select()
        .single();

      if (error) throw error;

      // Revalidate product list
      revalidateTag("products", "max");
      revalidatePath("/dashboard/products");

      return data as Product;
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * Update a product
   */
  async updateProduct(id: string, input: ProductUpdate): Promise<Product> {
    try {
      // Validate input
      const validated = productUpdateSchema.parse(input);

      // If updating slug, check it's not taken
      if (validated.slug) {
        const { data: existing } = await this.supabase
          .from("products")
          .select("id")
          .eq("slug", validated.slug)
          .neq("id", id)
          .single();

        if (existing) {
          throw new ValidationError("A product with this slug already exists");
        }
      }

      // Update product - validated by zod. Supabase types mismatch custom Database schema.
      const { data, error } = await this.supabase
        .from("products")
        // @ts-expect-error - Update expects 'never' due to custom Database schema typing
        .update(validated)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError("Product not found");

      const product = data as Product;

      // Revalidate caches
      revalidateTag("products", "max");
      revalidateTag(`product-${id}`, "max");
      revalidatePath("/dashboard/products");
      if (product.slug) {
        revalidatePath(`/products/${product.slug}`);
      }

      return product;
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Revalidate caches
      revalidateTag("products", "max");
      revalidateTag(`product-${id}`, "max");
      revalidatePath("/dashboard/products");
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * Publish/unpublish a product
   */
  async toggleProductStatus(id: string): Promise<Product> {
    try {
      // Get current status
      const product = await this.getProductById(id);

      const newStatus = product.status === "published" ? "draft" : "published";

      return await this.updateProduct(id, { status: newStatus });
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * Bulk update products
   */
  async bulkUpdateProducts(
    ids: string[],
    update: ProductUpdate
  ): Promise<Product[]> {
    try {
      const validated = productUpdateSchema.parse(update);

      const { data, error } = await this.supabase
        .from("products")
        // @ts-expect-error - Update expects 'never' due to custom Database schema typing
        .update(validated)
        .in("id", ids)
        .select();

      if (error) throw error;

      // Revalidate caches
      revalidateTag("products", "max");
      ids.forEach((id) => revalidateTag(`product-${id}`, "max"));
      revalidatePath("/dashboard/products");

      return (data ?? []) as Product[];
    } catch (error) {
      throw handleError(error);
    }
  }
}
