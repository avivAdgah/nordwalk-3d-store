import { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { DEFAULT_COLORS } from "../data/catalog";

/** Kenney kit units → meters (a kit sofa is 0.98 units wide ≈ a 2 m sofa). */
export const KIT_SCALE = 2.1;

const boxes = new Map();

/** Bounding box of the untransformed model, cached per model. */
function modelBox(model, scene) {
  if (!boxes.has(model)) {
    scene.updateMatrixWorld(true);
    boxes.set(model, new THREE.Box3().setFromObject(scene));
  }
  return boxes.get(model);
}

/**
 * Clones a kit model with its own materials, centred on x/z and standing on y = 0.
 * Returns the object, a material lookup by name, and its size in meters (before `scale`).
 */
export function useKitModel(model, colors, highlight = false) {
  const { scene } = useGLTF(`/models/${model}.glb`);

  const { object, materials, size } = useMemo(() => {
    const object = scene.clone(true);
    const materials = {};
    object.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true;
      o.receiveShadow = true;
      const own = (Array.isArray(o.material) ? o.material : [o.material]).map((m) => {
        const c = m.clone();
        c.roughness = c.name.startsWith("metal") ? 0.45 : 0.82;
        c.metalness = c.name.startsWith("metal") ? 0.35 : 0;
        (materials[c.name] ||= []).push(c);
        return c;
      });
      o.material = Array.isArray(o.material) ? own : own[0];
    });
    const box = modelBox(model, scene);
    const center = box.getCenter(new THREE.Vector3());
    object.position.set(-center.x, -box.min.y, -center.z);
    const size = box.getSize(new THREE.Vector3()).multiplyScalar(KIT_SCALE);
    return { object, materials, size };
  }, [scene, model]);

  const colorKey = colors ? JSON.stringify(colors) : "";
  useLayoutEffect(() => {
    for (const [name, mats] of Object.entries(materials)) {
      const color = colors?.[name] ?? DEFAULT_COLORS[name];
      for (const m of mats) {
        if (color) m.color.set(color);
        if (name === "lamp") {
          m.emissive.set("#FFE2A0");
          m.emissiveIntensity = 0.9;
        } else if (name === "glass") {
          m.transparent = true;
          m.opacity = 0.45;
        } else {
          m.emissive.set(highlight ? "#FFF6E0" : "#000000");
          m.emissiveIntensity = highlight ? 0.22 : 0;
        }
      }
    }
    // colors is compared through colorKey so a new object with the same values doesn't re-run this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materials, colorKey, highlight]);

  return { object, size };
}

/** A decorative (non-clickable) kit model. */
export function KitModel({ model, colors, scale = 1, ...props }) {
  const { object } = useKitModel(model, colors);
  return (
    <group {...props} scale={KIT_SCALE * scale}>
      <primitive object={object} />
    </group>
  );
}

export const preloadModels = (names) => names.forEach((n) => useGLTF.preload(`/models/${n}.glb`));
