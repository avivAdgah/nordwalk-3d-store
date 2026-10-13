import { useState } from "react";
import { PRODUCTS } from "../data/catalog";
import { PLACEMENTS } from "../data/layout";
import { nearestDistance, ZONES } from "../data/path";
import { productSizes } from "../scene/Product";
import { useStore, money } from "../store";

/** Product instances in walking order, for previous / next. */
export const ROUTE = Object.values(PLACEMENTS)
  .map((it) => ({ key: it.key, dist: nearestDistance(it.position[0], it.position[2]) }))
  .sort((a, b) => a.dist - b.dist);

export const focusOnRoute = (key) => {
  const stop = ROUTE.find((r) => r.key === key);
  useStore.getState().focus(key, stop ? stop.dist : useStore.getState().targetDist);
};

export default function ProductPanel() {
  const key = useStore((s) => s.selectedKey);
  if (!key) return null;
  // Remount per product so quantity resets.
  return <Panel key={key} itemKey={key} />;
}

function Panel({ itemKey }) {
  const item = PLACEMENTS[itemKey];
  const product = PRODUCTS[item.productId];
  const variant = useStore((s) => s.variants[item.productId] ?? 0);
  const setVariant = useStore((s) => s.setVariant);
  const addToCart = useStore((s) => s.addToCart);
  const deselect = useStore((s) => s.deselect);
  const [qty, setQty] = useState(1);

  const size = productSizes.get(itemKey);
  const cm = (m) => Math.round((m * 100) / 5) * 5;
  const zone = ZONES.find((z) => z.id === product.zone);
  const index = ROUTE.findIndex((r) => r.key === itemKey);
  const prev = ROUTE[index - 1];
  const next = ROUTE[index + 1];

  return (
    <aside className="panel" aria-label={product.name} data-ui-scroll>
      <div className="panel-top">
        <span className="chip">{zone?.name}</span>
        <button className="icon-btn" onClick={deselect} aria-label="Back to the walk">✕</button>
      </div>
      <h2>{product.name}</h2>
      <p className="price">{money(product.price)}</p>
      <p className="desc">{product.description}</p>
      {size && (
        <p className="dims">
          W {cm(size.x)} × D {cm(size.z)} × H {cm(size.y)} cm
        </p>
      )}

      <div className="field">
        <span className="field-label">
          Colour: <strong>{product.variants[variant]?.name}</strong>
        </span>
        <div className="swatches" role="radiogroup" aria-label="Colour">
          {product.variants.map((v, i) => (
            <button
              key={v.name}
              role="radio"
              aria-checked={i === variant}
              aria-label={v.name}
              title={v.name}
              className={`swatch ${i === variant ? "is-on" : ""}`}
              style={{ background: v.swatch }}
              onClick={() => setVariant(item.productId, i)}
            />
          ))}
        </div>
      </div>

      <div className="buy">
        <div className="qty" aria-label="Quantity">
          <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Fewer">−</button>
          <span>{qty}</span>
          <button onClick={() => setQty(qty + 1)} aria-label="More">+</button>
        </div>
        <button className="btn btn-primary btn-grow" onClick={() => addToCart(item.productId, variant, qty)}>
          Add to cart · {money(product.price * qty)}
        </button>
      </div>

      <ul className="perks">
        <li>Free delivery over $500</li>
        <li>365-day returns</li>
        <li>Drag to walk around it</li>
      </ul>

      <div className="panel-nav">
        <button className="btn btn-ghost" disabled={!prev} onClick={() => prev && focusOnRoute(prev.key)}>‹ Previous</button>
        <button className="btn btn-ghost" onClick={deselect}>Back to the walk</button>
        <button className="btn btn-ghost" disabled={!next} onClick={() => next && focusOnRoute(next.key)}>Next ›</button>
      </div>
    </aside>
  );
}
