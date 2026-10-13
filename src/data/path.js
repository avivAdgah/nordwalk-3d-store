import * as THREE from "three";

/**
 * The showroom walk: four parallel corridors joined by U-turns, like a
 * one-way furniture-store route. Units are meters; the floor is y = 0.
 *
 *   x=0 (Living, walking -z) → x=14 (Dining, +z) → x=28 (Bedroom, -z) → x=42 (Workspace, +z → Checkout)
 */
const CONTROL = [
  [0, 10], [0, -26], [1.5, -33], [7, -36], [12.5, -33], [14, -26],
  [14, 4], [15.5, 11], [21, 14], [26.5, 11], [28, 4],
  [28, -26], [29.5, -33], [35, -36], [40.5, -33], [42, -26],
  [42, 9],
];

export const curve = new THREE.CatmullRomCurve3(
  CONTROL.map(([x, z]) => new THREE.Vector3(x, 0, z)),
  false,
  "centripetal",
);
export const PATH_LENGTH = curve.getLength();

const SAMPLES = 1600;
const samples = curve.getSpacedPoints(SAMPLES);

export const clampDist = (d) => Math.min(Math.max(d, 0), PATH_LENGTH);

/** Point and unit tangent at a distance (meters) along the path. */
export function frameAt(dist, point = new THREE.Vector3(), tangent = new THREE.Vector3()) {
  const t = clampDist(dist) / PATH_LENGTH;
  curve.getPointAt(t, point);
  curve.getTangentAt(t, tangent);
  return { point, tangent };
}

/** Distance along the path of the path point closest to (x, z). */
export function nearestDistance(x, z) {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i <= SAMPLES; i++) {
    const p = samples[i];
    const d = (p.x - x) ** 2 + (p.z - z) ** 2;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return (best / SAMPLES) * PATH_LENGTH;
}

/** Closest path point to (x, z). */
export function nearestPoint(x, z) {
  return frameAt(nearestDistance(x, z)).point.clone();
}

/** Departments in walking order; `dist` is where each one starts on the path. */
export const ZONES = [
  { id: "entrance", name: "Welcome", short: "Welcome", at: [0, 10], color: "#E9DFCC" },
  { id: "living", name: "Living Room", short: "Living", at: [0, 4], color: "#DCE3D3" },
  { id: "dining", name: "Dining & Kitchen", short: "Dining", at: [14, -26], color: "#F1DCC8" },
  { id: "bedroom", name: "Bedroom", short: "Bedroom", at: [28, 4], color: "#DCE0EA" },
  { id: "office", name: "Workspace", short: "Workspace", at: [42, -26], color: "#E7E2D6" },
  { id: "checkout", name: "Market Hall & Checkout", short: "Checkout", at: [42, -1], color: "#F2E6C9" },
].map((z) => ({ ...z, dist: nearestDistance(z.at[0], z.at[1]) }));

export function zoneAt(dist) {
  let zone = ZONES[0];
  for (const z of ZONES) if (dist + 0.01 >= z.dist) zone = z;
  return zone;
}

/** Path polyline in (x, z) for the minimap. */
export const PATH_POLYLINE = curve.getSpacedPoints(240).map((p) => [p.x, p.z]);
