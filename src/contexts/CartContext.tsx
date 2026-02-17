"use client";

import { createClient } from "@/lib/db/client-browser";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type CartItem = {
  id: string;
  product_id: string;
  title: string;
  slug: string;
  price: number;
  sale_price?: number;
  image?: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  isValidating: boolean;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getCartTotal: () => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = "cart";
const CART_VERSION = 2; // bump this whenever CartItem shape changes
const VERSIONED_KEY = `${CART_KEY}_v${CART_VERSION}`;

function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    // Clear any old version keys to avoid shape mismatches
    for (let v = 1; v < CART_VERSION; v++) {
      localStorage.removeItem(`${CART_KEY}_v${v}`);
    }
    localStorage.removeItem(CART_KEY); // remove the old unversioned key too

    const saved = localStorage.getItem(VERSIONED_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveCartToStorage(items: CartItem[]) {
  try {
    localStorage.setItem(VERSIONED_KEY, JSON.stringify(items));
  } catch {
    // storage quota exceeded or unavailable — fail silently
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isValidating, setIsValidating] = useState(true);

  // On mount: load from storage then validate every product_id against the DB
  useEffect(() => {
    const stored = loadCartFromStorage();

    if (stored.length === 0) {
      setIsValidating(false);
      return;
    }

    const validate = async () => {
      try {
        const supabase = await createClient();
        const ids = stored.map((i) => i.product_id);

        const { data: products, error } = await supabase
          .from("products")
          .select(
            "id, title, slug, price, compare_at_price, on_sale, featured_image"
          )
          .in("id", ids)
          .eq("status", "published");

        if (error || !products) {
          // DB unreachable — keep stored cart as-is rather than wiping it
          setItems(stored);
          return;
        }

        // Build a map of valid products keyed by id
        const productMap = new Map(products.map((p) => [p.id, p]));

        // Rebuild cart: drop items whose product no longer exists,
        // and refresh price/title/slug/image from DB so they're never stale
        const validItems = stored.reduce<CartItem[]>((acc, item) => {
          const product = productMap.get(item.product_id);
          if (!product) return acc; // product deleted or unpublished — drop it

          acc.push({
            ...item,
            title: product.title,
            slug: product.slug,
            price: product.price,
            sale_price:
              product.on_sale && product.compare_at_price
                ? product.price // price IS the sale price in your schema
                : undefined,
            image: product.featured_image ?? item.image,
          });
          return acc;
        }, []);

        setItems(validItems);
        saveCartToStorage(validItems);
      } catch {
        // Network error — keep stored cart rather than wiping it
        setItems(stored);
      } finally {
        setIsValidating(false);
      }
    };

    validate();
  }, []);

  // Persist to storage whenever cart changes (after initial validation)
  useEffect(() => {
    if (!isValidating) {
      saveCartToStorage(items);
    }
  }, [items, isValidating]);

  const addItem = (item: Omit<CartItem, "quantity">) => {
    setItems((current) => {
      const existing = current.find((i) => i.product_id === item.product_id);
      if (existing) {
        return current.map((i) =>
          i.product_id === item.product_id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...current, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((current) => current.filter((i) => i.product_id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((current) =>
      current.map((i) => (i.product_id === productId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(VERSIONED_KEY);
  };

  const getCartCount = () => items.reduce((t, i) => t + i.quantity, 0);

  const getCartTotal = () =>
    items.reduce((t, i) => t + (i.sale_price ?? i.price) * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isValidating,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getCartCount,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
