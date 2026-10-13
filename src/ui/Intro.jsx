import { useEffect } from "react";
import { useProgress } from "@react-three/drei";
import { useStore } from "../store";
import { ZONES } from "../data/path";
import { FIRST_PLACEMENT } from "../data/layout";
import { focusOnRoute } from "./ProductPanel";

/** Shareable links: ?zone=bedroom starts in a department, ?product=cove-sofa opens a product. */
function applyDeepLink() {
  const params = new URLSearchParams(window.location.search);
  const product = params.get("product");
  const zone = ZONES.find((z) => z.id === params.get("zone"));
  const store = useStore.getState();
  if (product && FIRST_PLACEMENT[product]) {
    store.enter();
    focusOnRoute(FIRST_PLACEMENT[product].key);
    store.teleport();
  } else if (zone) {
    store.enter();
    store.walkTo(zone.dist + 1);
    store.teleport();
  }
}

export default function Intro({ ready }) {
  const { progress, active } = useProgress();
  const entered = useStore((s) => s.entered);
  const enter = useStore((s) => s.enter);
  const loaded = ready && !active && progress >= 100;

  useEffect(() => {
    if (loaded) applyDeepLink();
  }, [loaded]);

  if (entered) return null;
  return (
    <div className="intro">
      <div className="intro-card">
        <div className="brand brand-lg">
          <span className="brand-mark">N</span>NORDWALK
        </div>
        <h1>
          Walk the showroom.
          <br />
          <span>Shop the rooms.</span>
        </h1>
        <p>A 3D furniture store you explore on foot. Follow the yellow arrows through five departments, step up to anything you like and take it home.</p>
        <ul className="controls">
          <li><kbd>Scroll</kbd> or <kbd>↑</kbd><kbd>↓</kbd> walk the path</li>
          <li><kbd>Drag</kbd> look around</li>
          <li><kbd>Click</kbd> a product or price tag to step closer</li>
        </ul>
        <button className="btn btn-primary btn-lg" disabled={!loaded} onClick={enter}>
          {loaded ? "Enter the showroom →" : `Setting up the store… ${Math.round(progress)}%`}
        </button>
        <div className="intro-bar" aria-hidden="true">
          <span style={{ width: `${loaded ? 100 : progress}%` }} />
        </div>
      </div>
    </div>
  );
}
