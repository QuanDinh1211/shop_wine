"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from "react";
import { CartItem, Wine, Accessory } from "@/lib/types";

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: "ADD_WINE"; payload: Wine }
  | { type: "ADD_ACCESSORY"; payload: Accessory }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] };

const CartContext = createContext<{
  state: CartState;
  addWine: (wine: Wine) => void;
  addAccessory: (accessory: Accessory) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
} | null>(null);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_WINE": {
      const existingItem = state.items.find(
        (item) =>
          item.wine?.id === action.payload.id && item.productType === "wine"
      );
      let newItems: CartItem[];

      if (existingItem) {
        newItems = state.items.map((item) =>
          item.wine?.id === action.payload.id && item.productType === "wine"
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [
          ...state.items,
          { wine: action.payload, quantity: 1, productType: "wine" },
        ];
      }

      const total = newItems.reduce((sum, item) => {
        const price = item.wine?.price || item.accessory?.price || 0;
        return sum + price * item.quantity;
      }, 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return { items: newItems, total, itemCount };
    }

    case "ADD_ACCESSORY": {
      const existingItem = state.items.find(
        (item) =>
          item.accessory?.id === action.payload.id &&
          item.productType === "accessory"
      );
      let newItems: CartItem[];

      if (existingItem) {
        newItems = state.items.map((item) =>
          item.accessory?.id === action.payload.id &&
          item.productType === "accessory"
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [
          ...state.items,
          { accessory: action.payload, quantity: 1, productType: "accessory" },
        ];
      }

      const total = newItems.reduce((sum, item) => {
        const price = item.wine?.price || item.accessory?.price || 0;
        return sum + price * item.quantity;
      }, 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return { items: newItems, total, itemCount };
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item) => {
        const itemId = item.wine?.id || item.accessory?.id;
        return itemId !== action.payload;
      });
      const total = newItems.reduce((sum, item) => {
        const price = item.wine?.price || item.accessory?.price || 0;
        return sum + price * item.quantity;
      }, 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return { items: newItems, total, itemCount };
    }

    case "UPDATE_QUANTITY": {
      const newItems = state.items
        .map((item) => {
          const itemId = item.wine?.id || item.accessory?.id;
          return itemId === action.payload.id
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item;
        })
        .filter((item) => item.quantity > 0);

      const total = newItems.reduce((sum, item) => {
        const price = item.wine?.price || item.accessory?.price || 0;
        return sum + price * item.quantity;
      }, 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return { items: newItems, total, itemCount };
    }

    case "CLEAR_CART":
      return { items: [], total: 0, itemCount: 0 };

    case "LOAD_CART": {
      const total = action.payload.reduce((sum, item) => {
        const price = item.wine?.price || item.accessory?.price || 0;
        return sum + price * item.quantity;
      }, 0);
      const itemCount = action.payload.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      return { items: action.payload, total, itemCount };
    }

    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [loadCart, setLoadCart] = useState<boolean>(true);
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
  });

  useEffect(() => {
    const savedCart = localStorage.getItem("wine-cart");
    if (savedCart) {
      dispatch({ type: "LOAD_CART", payload: JSON.parse(savedCart) });
    }
    setLoadCart(false);
  }, []);

  useEffect(() => {
    if (!loadCart) {
      localStorage.setItem("wine-cart", JSON.stringify(state.items));
    }
  }, [state.items]);

  const addWine = (wine: Wine) => {
    dispatch({ type: "ADD_WINE", payload: wine });
  };

  const addAccessory = (accessory: Accessory) => {
    dispatch({ type: "ADD_ACCESSORY", payload: accessory });
  };

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  return (
    <CartContext.Provider
      value={{
        state,
        addWine,
        addAccessory,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
