import { useEffect, useState } from "react";
import { ZONES, zoneAt, PATH_POLYLINE, frameAt, nearestDistance, PATH_LENGTH } from "../data/path";
import { FIRST_PLACEMENT } from "../data/layout";
import { useStore, cartCount } from "../store";
import { input } from "../scene/CameraRig";

export default function Hud() {
  const entered = useStore((s) => s.entered);
  const currentDist = useStore((s) => s.currentDist);
  const selected = useStore((s) => s.selectedKey);
  const cart = useStore((s) => s.cart);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const setListOpen = useStore((s) => s.setListOpen);
  const zone = zoneAt(currentDist);
  const count = cartCount(cart);

  return (
    <div className={`hud ${entered ? "is-on" : ""}`}>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">N</span>NORDWALK
        </div>
        <div className="topbar-zone" aria-live="polite">
          <span>You are in</span>
          <strong>{zone.name}</strong>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-ghost" onClick={() => setListOpen(true)}>All products</button>
          <button className="btn btn-cart" onClick={() => setCartOpen(true)} aria-label={`Cart, ${count} items`}>
            <CartIcon /> Cart <span className="badge">{count}</span>
          </button>
        </div>
      </header>

      {!selected && (
        <>
          <WalkHint dist={currentDist} />
          <nav className="route" aria-label="Departments">
            <HoldButton dir={-1} label="Walk back">‹</HoldButton>
            <ol>
              {ZONES.map((z) => (
                <li key={z.id}>
                  <button className={z.id === zone.id ? "is-current" : ""} onClick={() => useStore.getState().walkTo(z.dist + 1)}>
                    {z.short}
                  </button>
                </li>
              ))}
            </ol>
            <HoldButton dir={1} label="Walk forward">›</HoldButton>
            <div className="route-progress" style={{ width: `${(currentDist / PATH_LENGTH) * 100}%` }} />
          </nav>
          <Minimap dist={currentDist} />
        </>
      )}
    </div>
  );
}

/** Press-and-hold arrow that walks while held (mouse, touch or keyboard). */
function HoldButton({ dir, label, children }) {
  const start = () => (input.forward = dir);
  const stop = () => (input.forward = 0);
  return (
    <button
      className="route-step"
      aria-label={label}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && useStore.getState().walk(dir * 3)}
    >
      {children}
    </button>
  );
}

function WalkHint({ dist }) {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    if (dist > 4) setGone(true);
  }, [dist]);
  if (gone) return null;
  return <div className="hint">Scroll to walk · drag to look around · click a product or price tag</div>;
}

// Minimap: x −8…50, z −40…16 (meters) → SVG units.
const MAP = { minX: -8, minZ: -40, w: 58, h: 56 };
const productDots = Object.values(FIRST_PLACEMENT).map((it) => [it.position[0], it.position[2]]);

function Minimap({ dist }) {
  const { point, tangent } = frameAt(dist);
  const heading = (Math.atan2(tangent.x, -tangent.z) * 180) / Math.PI;
  const onClick = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = MAP.minX + ((e.clientX - r.left) / r.width) * MAP.w;
    const z = MAP.minZ + ((e.clientY - r.top) / r.height) * MAP.h;
    useStore.getState().walkTo(nearestDistance(x, z));
  };
  return (
    <figure className="minimap">
      <svg viewBox={`${MAP.minX} ${MAP.minZ} ${MAP.w} ${MAP.h}`} onClick={onClick} role="img" aria-label="Store map, click to walk there">
        <rect x={-7} y={-39} width={56} height={54} rx={2} className="mm-floor" />
        {[7, 21, 35].map((x, i) => (
          <line key={x} x1={x} x2={x} y1={i === 1 ? -39 : 15} y2={i === 1 ? 7.5 : -28} className="mm-wall" />
        ))}
        <polyline points={PATH_POLYLINE.map((p) => p.join(",")).join(" ")} className="mm-path" />
        {productDots.map(([x, z], i) => (
          <circle key={i} cx={x} cy={z} r={0.7} className="mm-product" />
        ))}
        <g transform={`translate(${point.x} ${point.z}) rotate(${heading})`}>
          <circle r={2.4} className="mm-you-halo" />
          <path d="M0 -2.6 L1.9 1.8 L0 0.8 L-1.9 1.8 Z" className="mm-you" />
        </g>
      </svg>
      <figcaption>Store map · click to jump</figcaption>
    </figure>
  );
}

export function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2" />
      <circle cx="10" cy="20" r="1.3" />
      <circle cx="17" cy="20" r="1.3" />
    </svg>
  );
}
