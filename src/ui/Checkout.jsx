import { useState } from "react";
import { PRODUCTS } from "../data/catalog";
import { useStore, cartTotal, money } from "../store";

export default function Checkout() {
  const open = useStore((s) => s.checkoutOpen);
  if (!open) return null;
  return <CheckoutForm />;
}

function CheckoutForm() {
  const cart = useStore((s) => s.cart);
  const setCheckoutOpen = useStore((s) => s.setCheckoutOpen);
  const clearCart = useStore((s) => s.clearCart);
  const [form, setForm] = useState({ name: "", email: "", address: "" });
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  const total = cartTotal(cart);
  const delivery = total >= 500 ? 0 : 49;
  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) || !form.address.trim()) {
      setError("Please fill in your name, a valid email and a delivery address.");
      return;
    }
    setOrder({ number: `NW-${Math.floor(100000 + Math.random() * 900000)}`, name: form.name.trim(), total: total + delivery });
    clearCart();
  };

  return (
    <div className="overlay overlay-center" onClick={() => setCheckoutOpen(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Checkout" data-ui-scroll>
        <button className="icon-btn modal-close" onClick={() => setCheckoutOpen(false)} aria-label="Close">✕</button>
        {order ? (
          <div className="done">
            <div className="done-check" aria-hidden="true">✓</div>
            <h2>Thank you, {order.name}!</h2>
            <p>Order <strong>{order.number}</strong> · {money(order.total)}</p>
            <p className="muted">This is a portfolio demo store, so no payment was taken and nothing will ship.</p>
            <button className="btn btn-primary" onClick={() => setCheckoutOpen(false)}>Back to the showroom</button>
          </div>
        ) : (
          <form className="checkout" onSubmit={submit} noValidate>
            <h2>Checkout</h2>
            <div className="checkout-grid">
              <div className="checkout-fields">
                <label>Full name<input value={form.name} onChange={update("name")} autoComplete="name" /></label>
                <label>Email<input type="email" value={form.email} onChange={update("email")} autoComplete="email" /></label>
                <label>Delivery address<textarea rows={3} value={form.address} onChange={update("address")} autoComplete="street-address" /></label>
                <p className="muted small">Demo checkout: no payment details needed, nothing is charged.</p>
              </div>
              <div className="checkout-summary">
                <h3>Order summary</h3>
                <ul>
                  {cart.map((l) => (
                    <li key={`${l.productId}-${l.variant}`}>
                      <span>{l.qty} × {PRODUCTS[l.productId].name}</span>
                      <span>{money(PRODUCTS[l.productId].price * l.qty)}</span>
                    </li>
                  ))}
                </ul>
                <dl className="totals">
                  <div><dt>Delivery</dt><dd>{delivery ? money(delivery) : "Free"}</dd></div>
                  <div className="grand"><dt>Total</dt><dd>{money(total + delivery)}</dd></div>
                </dl>
              </div>
            </div>
            {error && <p className="error" role="alert">{error}</p>}
            <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={!cart.length}>Place order</button>
          </form>
        )}
      </div>
    </div>
  );
}
