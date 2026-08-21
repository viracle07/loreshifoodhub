"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/app/context/AuthContext";

const CartContext = createContext(null);

const CART_STORAGE_PREFIX =
  "loreshi-foodhub-cart";

export function CartProvider({ children }) {
  const { user, loading: authLoading } =
    useAuth();

  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] =
    useState(false);

  /*
   * Each authenticated user gets
   * their own localStorage cart.
   */
  const storageKey = user?.uid
    ? `${CART_STORAGE_PREFIX}-${user.uid}`
    : null;

  /*
   * Load the cart whenever the authenticated
   * user changes.
   */
  useEffect(() => {
    if (authLoading) {
      return;
    }

    setHydrated(false);

    if (!user?.uid) {
      setItems([]);
      setHydrated(true);
      return;
    }

    try {
      const storedCart =
        window.localStorage.getItem(
          `${CART_STORAGE_PREFIX}-${user.uid}`
        );

      if (storedCart) {
        const parsedCart =
          JSON.parse(storedCart);

        if (Array.isArray(parsedCart)) {
          setItems(parsedCart);
        } else {
          setItems([]);
        }
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error(
        "Unable to load user cart:",
        error
      );

      setItems([]);
    } finally {
      setHydrated(true);
    }
  }, [user?.uid, authLoading]);

  /*
   * Save the current user's cart.
   */
  useEffect(() => {
    if (
      !hydrated ||
      !storageKey ||
      authLoading
    ) {
      return;
    }

    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify(items)
      );
    } catch (error) {
      console.error(
        "Unable to save user cart:",
        error
      );
    }
  }, [
    items,
    hydrated,
    storageKey,
    authLoading,
  ]);

  function addToCart({
    product,
    variant,
    quantity = 1,
  }) {
    if (!user?.uid) {
      return false;
    }

    if (!product || !variant) {
      return false;
    }

    const safeQuantity = Math.max(
      1,
      Number(quantity) || 1
    );

    const cartItemId = `${product.id}__${variant.id}`;

    setItems((currentItems) => {
      const existingItem =
        currentItems.find(
          (item) =>
            item.cartItemId === cartItemId
        );

      if (existingItem) {
        return currentItems.map((item) =>
          item.cartItemId === cartItemId
            ? {
                ...item,
                quantity:
                  item.quantity +
                  safeQuantity,
              }
            : item
        );
      }

      return [
        ...currentItems,
        {
          cartItemId,
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
          productImage:
            product.images?.[0]?.url || "",
          categoryName:
            product.categoryName || "",
          variantId: variant.id,
          variantLabel:
            variant.label || "",
          packageSize:
            variant.packageSize ?? null,
          packageUnit:
            variant.packageUnit || "",
          price: Number(variant.price) || 0,
          quantity: safeQuantity,
        },
      ];
    });

    return true;
  }

 const updateQuantity = useCallback(
  (cartItemId, quantity) => {
    const safeQuantity = Math.max(
      1,
      Number(quantity) || 1
    );

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.cartItemId === cartItemId
          ? {
              ...item,
              quantity: safeQuantity,
            }
          : item
      )
    );
  },
  []
);

const increaseQuantity = useCallback(
  (cartItemId) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.cartItemId === cartItemId
          ? {
              ...item,
              quantity:
                item.quantity + 1,
            }
          : item
      )
    );
  },
  []
);

const decreaseQuantity = useCallback(
  (cartItemId) => {
    setItems((currentItems) =>
      currentItems
        .map((item) =>
          item.cartItemId === cartItemId
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) => item.quantity > 0
        )
    );
  },
  []
);

const removeFromCart = useCallback(
  (cartItemId) => {
    setItems((currentItems) =>
      currentItems.filter(
        (item) =>
          item.cartItemId !== cartItemId
      )
    );
  },
  []
);

 const clearCart = useCallback(() => {
  setItems([]);
}, []);

  const itemCount = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + item.quantity,
        0
      ),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total +
          item.price * item.quantity,
        0
      ),
    [items]
  );

  const value = {
    items,
    hydrated,
    itemCount,
    subtotal,
    addToCart,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}