import { PRODUCTS } from "../data/catalog";
import { useStore, cartTotal, money } from "../store";

export default function CartDrawer() {
  const open = useStore((s) => s.cartOpen);
  const cart = useStore((s) => s.cart);
  const setQty = useStore((s) => s.setQty);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const setCheckoutOpen = useStore((s) => s.setCheckoutOpen);
  if (!open) return null;

  const total = cartTotal(cart);
  const delivery = total >= 500 || total === 0 ? 0 : 49;

  return (
    <div className="overlay" onClick={() => setCartOpen(false)}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()} aria-label="Shopping cart" data-ui-scroll>
        <div className="panel-top">
          <h2>Your cart</h2>
          <button className="icon-btn" onClick={() => setCartOpen(false)} aria-label="Close cart">✕</button>
        </div>
        {cart.length === 0 ? (
          <div className="empty">
            <p>Your cart is empty.</p>
            <p className="muted">Walk the showroom and click any price tag to add something.</p>
            <button className="btn btn-primary" onClick={() => setCartOpen(false)}>Keep walking</button>
          </div>
        ) : (
          <>
            <ul className="lines">
              {cart.map((l) => {
                const p = PRODUCTS[l.productId];
                const v = p.variants[l.variant];
                return (
                  <li key={`${l.productId}-${l.variant}`}>
                    <span className="line-swatch" style={{ background: v?.swatch }} />
                    <div className="line-info">
                      <strong>{p.name}</strong>
                      <span className="muted">{v?.name}</span>
                    </div>
                    <div className="qty qty-sm">
                      <button onClick={() => setQty(l.productId, l.variant, l.qty - 1)} aria-label="Fewer">−</button>
                      <span>{l.qty}</span>
                      <button onClick={() => setQty(l.productId, l.variant, l.qty + 1)} aria-label="More">+</button>
                    </div>
                    <span className="line-price">{money(p.price * l.qty)}</span>
                  </li>
                );
              })}
            </ul>
            <dl className="totals">
              <div><dt>Subtotal</dt><dd>{money(total)}</dd></div>
              <div><dt>Delivery</dt><dd>{delivery ? money(delivery) : "Free"}</dd></div>
              <div className="grand"><dt>Total</dt><dd>{money(total + delivery)}</dd></div>
            </dl>
            {delivery > 0 && <p className="muted small">Add {money(500 - total)} more for free delivery.</p>}
            <button className="btn btn-primary btn-lg btn-block" onClick={() => setCheckoutOpen(true)}>Go to checkout</button>
          </>
        )}
      </aside>
    </div>
  );
}
