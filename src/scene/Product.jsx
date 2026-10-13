import { useEffect, useMemo } from "react";
import { PRODUCTS } from "../data/catalog";
import { useStore } from "../store";
import { useKitModel, KIT_SCALE } from "./Model";
import { tagTexture, BRAND } from "./textures";

/** Sizes (meters, after scale) of placed product instances, read by the camera rig to frame them. */
export const productSizes = new Map();

function useProductPointer(key) {
  const setHovered = useStore((s) => s.setHovered);
  const select = useStore((s) => s.select);
  return {
    onPointerOver: (e) => {
      e.stopPropagation();
      setHovered(key);
      document.body.dataset.hover = "product"; // switches the grab cursor to a pointer (styles.css)
    },
    onPointerOut: () => {
      setHovered(null);
      delete document.body.dataset.hover;
    },
    onClick: (e) => {
      e.stopPropagation();
      if (e.delta > 8) return; // ignore drags
      select(key);
    },
  };
}

export function ProductItem({ item }) {
  const product = PRODUCTS[item.productId];
  const variantIndex = useStore((s) => s.variants[item.productId] ?? 0);
  const active = useStore((s) => s.hoveredKey === item.key || s.selectedKey === item.key);
  const selected = useStore((s) => s.selectedKey === item.key);
  // While a product is in focus its panel shows the details, so tags would only block the view.
  const focusing = useStore((s) => s.selectedKey !== null);
  const colors = product.variants[variantIndex]?.colors;
  const { object, size } = useKitModel(product.model, colors, active);
  const pointer = useProductPointer(item.key);

  useEffect(() => {
    productSizes.set(item.key, size.clone().multiplyScalar(item.scale));
  }, [item.key, item.scale, size]);

  const ring = Math.max(size.x, size.z) * item.scale * 0.62 + 0.25;

  return (
    <>
      <group position={item.position} rotation-y={item.yaw} {...pointer}>
        <group scale={KIT_SCALE * item.scale}>
          <primitive object={object} />
        </group>
      </group>
      {selected && (
        <mesh position={[item.position[0], 0.05, item.position[2]]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[ring, ring + 0.08, 64]} />
          <meshBasicMaterial color={BRAND.yellow} toneMapped={false} />
        </mesh>
      )}
      {item.tag && !focusing && <PriceTag item={item} product={product} active={active} pointer={pointer} />}
    </>
  );
}

function PriceTag({ item, product, active, pointer }) {
  const map = useMemo(() => tagTexture(product.name, product.price, active), [product, active]);
  return (
    <group position={item.tag.position} rotation-y={item.tag.yaw} {...pointer}>
      <mesh position={[0, 0.42, -0.02]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.84, 8]} />
        <meshStandardMaterial color={BRAND.ink} roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.02, -0.02]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.14, 24]} />
        <meshStandardMaterial color={BRAND.ink} />
      </mesh>
      <mesh position={[0, 0.98, 0]} rotation-x={-0.35}>
        <planeGeometry args={[0.66, 0.41]} />
        <meshBasicMaterial map={map} toneMapped={false} transparent />
      </mesh>
    </group>
  );
}
