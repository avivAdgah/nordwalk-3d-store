import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PATH_LENGTH, clampDist } from "./data/path";
import { PRODUCTS } from "./data/catalog";

export const START_DIST = 0.5;

export const useStore = create(
  persist(
    (set, get) => ({
      // ---- Walking ----
      /** Where the walker is heading (meters along the path); the camera eases toward it. */
      targetDist: START_DIST,
      /** Where the camera actually is, published (throttled) by the camera rig for the HUD. */
      currentDist: START_DIST,
      entered: false,
      walk: (delta) => {
        if (get().selectedKey) return;
        set({ targetDist: clampDist(get().targetDist + delta) });
      },
      walkTo: (dist) => set({ targetDist: clampDist(dist), selectedKey: null }),
      /** Incremented to make the camera jump to targetDist instead of walking there (shared links). */
      teleportTick: 0,
      teleport: () => set({ teleportTick: get().teleportTick + 1 }),
      setCurrentDist: (d) => set({ currentDist: d }),
      enter: () => set({ entered: true }),

      // ---- Product focus ----
      /** Key of the placed product instance the camera is focused on. */
      selectedKey: null,
      hoveredKey: null,
      select: (key) => set({ selectedKey: key, hoveredKey: null }),
      /** Select a product and move the walker to the path point beside it (list view, next/prev). */
      focus: (key, dist) => set({ selectedKey: key, hoveredKey: null, targetDist: clampDist(dist), listOpen: false }),
      deselect: () => set({ selectedKey: null }),
      setHovered: (key) => set({ hoveredKey: key }),

      /** Chosen colour variant index per product id. */
      variants: {},
      setVariant: (productId, index) => set({ variants: { ...get().variants, [productId]: index } }),

      // ---- Cart ----
      cart: [], // [{ productId, variant, qty }]
      cartOpen: false,
      checkoutOpen: false,
      listOpen: false,
      toast: null,
      addToCart: (productId, variant = 0, qty = 1) => {
        const cart = [...get().cart];
        const line = cart.find((l) => l.productId === productId && l.variant === variant);
        if (line) line.qty += qty;
        else cart.push({ productId, variant, qty });
        set({ cart, toast: { id: Date.now(), productId, variant } });
      },
      setQty: (productId, variant, qty) =>
        set({
          cart: get()
            .cart.map((l) => (l.productId === productId && l.variant === variant ? { ...l, qty } : l))
            .filter((l) => l.qty > 0),
        }),
      clearCart: () => set({ cart: [] }),
      setCartOpen: (cartOpen) => set({ cartOpen, checkoutOpen: false }),
      setCheckoutOpen: (checkoutOpen) => set({ checkoutOpen, cartOpen: false }),
      setListOpen: (listOpen) => set({ listOpen }),
      clearToast: () => set({ toast: null }),
    }),
    {
      name: "nordwalk-cart",
      partialize: (s) => ({ cart: s.cart, variants: s.variants }),
    },
  ),
);

export const cartCount = (cart) => cart.reduce((n, l) => n + l.qty, 0);
export const cartTotal = (cart) => cart.reduce((n, l) => n + (PRODUCTS[l.productId]?.price || 0) * l.qty, 0);
export const money = (n) => `$${n.toLocaleString("en-US")}`;
export { PATH_LENGTH };
