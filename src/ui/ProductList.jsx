import { PRODUCTS } from "../data/catalog";
import { FIRST_PLACEMENT } from "../data/layout";
import { ZONES } from "../data/path";
import { useStore, money } from "../store";
import { focusOnRoute } from "./ProductPanel";

/** Flat list of every product, grouped by department; picking one walks you to it. */
export default function ProductList() {
  const open = useStore((s) => s.listOpen);
  const setListOpen = useStore((s) => s.setListOpen);
  if (!open) return null;

  return (
    <div className="overlay" onClick={() => setListOpen(false)}>
      <aside className="drawer drawer-wide" onClick={(e) => e.stopPropagation()} aria-label="All products" data-ui-scroll>
        <div className="panel-top">
          <h2>All products</h2>
          <button className="icon-btn" onClick={() => setListOpen(false)} aria-label="Close">✕</button>
        </div>
        <p className="muted">Pick anything and we'll walk you straight to it.</p>
        {ZONES.filter((z) => z.id !== "entrance").map((zone) => {
          const items = Object.entries(PRODUCTS).filter(([, p]) => p.zone === zone.id);
          if (!items.length) return null;
          return (
            <section key={zone.id} className="list-zone">
              <h3>{zone.name}</h3>
              <ul className="list-grid">
                {items.map(([id, p]) => (
                  <li key={id}>
                    <button onClick={() => focusOnRoute(FIRST_PLACEMENT[id].key)}>
                      <span className="list-swatches">
                        {p.variants.slice(0, 4).map((v) => <i key={v.name} style={{ background: v.swatch }} />)}
                      </span>
                      <strong>{p.name}</strong>
                      <span className="muted">{money(p.price)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </aside>
    </div>
  );
}
