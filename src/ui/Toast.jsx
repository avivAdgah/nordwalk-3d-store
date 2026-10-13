import { useEffect } from "react";
import { PRODUCTS } from "../data/catalog";
import { useStore } from "../store";

export default function Toast() {
  const toast = useStore((s) => s.toast);
  const clearToast = useStore((s) => s.clearToast);
  const setCartOpen = useStore((s) => s.setCartOpen);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clearToast, 3200);
    return () => clearTimeout(t);
  }, [toast, clearToast]);

  if (!toast) return null;
  const p = PRODUCTS[toast.productId];
  return (
    <div className="toast" role="status" key={toast.id}>
      <span className="toast-swatch" style={{ background: p.variants[toast.variant]?.swatch }} />
      <span>
        <strong>Added to cart</strong>
        {p.name} · {p.variants[toast.variant]?.name}
      </span>
      <button className="btn btn-sm" onClick={() => setCartOpen(true)}>View cart</button>
    </div>
  );
}
