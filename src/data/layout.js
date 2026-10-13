import { nearestPoint, frameAt, ZONES } from "./path";

/**
 * Showroom layout. Each "room set" sits beside the path; items are placed in
 * room-local coordinates where +z points toward the path (the front) and x runs
 * along it. A room's floor patch spans z −2.4 … +1.6 and its back wall is at z −2.6.
 *
 * Item fields: p = product id (clickable) or m = prop model, at = [x, z], y = height,
 * rot = extra yaw in degrees, s = scale multiplier, colors = material overrides,
 * box = [w, h, d] for a plain plinth.
 */
const ROOMS = [
  // ---------- Living room (x = 0, walking −z) ----------
  {
    center: [-3.7, -1], wall: "#C9D3BF", floor: "#EADCC6", items: [
      { m: "rugRectangle", at: [0, -0.2], s: 1.15, colors: { carpet: "#E9E2D3", carpetDarker: "#D8CDBB" } },
      { p: "cove-sofa", at: [0, -1.25] },
      { p: "grove-coffee", at: [0, 0.35] },
      { p: "halo-floor", at: [-2.05, -1.45] },
      { m: "pottedPlant", at: [2.05, -1.6], s: 1.5 },
      { m: "pillow", at: [-0.55, -1.15], y: 0.5, rot: 8, s: 0.75, colors: { carpet: "#9DB08F" } },
      { m: "pillow", at: [0.6, -1.15], y: 0.5, rot: -10, s: 0.75, colors: { carpet: "#C47A57" } },
      { m: "books", at: [0.3, 0.4], y: 0.49 },
    ],
  },
  {
    center: [3.7, -3], wall: "#EFE6D8", floor: "#E6D6BD", items: [
      { p: "ripple-rug", at: [-0.3, 0] },
      { p: "cove-corner", at: [0.3, -0.9], rot: 90 },
      { m: "speaker", at: [-2.3, -1.9] },
      { m: "bookcaseOpenLow", at: [-1.3, -2.05] },
      { m: "plantSmall2", at: [-1.3, -2.05], y: 0.85, s: 1.6 },
      { m: "lampRoundFloor", at: [2.3, -1.9] },
    ],
  },
  {
    center: [-3.7, -15], wall: "#D9C8B4", floor: "#EADCC6", items: [
      { m: "rugRounded", at: [0, -0.5], s: 1.1, colors: { carpet: "#E4DCCB", carpetDarker: "#CFC3AE" } },
      { p: "frame-tvbench", at: [0, -2.05] },
      { m: "televisionModern", at: [0, -2.05], y: 0.66 },
      { p: "stack-bookcase", at: [2.3, -2.05] },
      { m: "bookcaseOpen", at: [-2.3, -2.05] },
      { p: "drift-chair", at: [-0.9, 0.1], rot: 35 },
      { m: "pottedPlant", at: [-1.6, -2.1], s: 1.3 },
    ],
  },
  {
    center: [3.7, -17], wall: "#B9C7C4", floor: "#E6D6BD", items: [
      { m: "rugRound", at: [0, -0.4], s: 1.2, colors: { carpet: "#EFE9DD", carpetDarker: "#DDD3C2" } },
      { m: "loungeChairRelax", at: [-0.6, -0.8], rot: 20, colors: { carpet: "#C47A57" } },
      { m: "loungeChairRelax", at: [0.9, -0.8], rot: -20, colors: { carpet: "#9DB08F" } },
      { m: "tableCoffee", at: [0.15, 0.3], s: 0.75 },
      { m: "lampRoundFloor", at: [2.3, -1.9] },
      { m: "bookcaseOpen", at: [-1.6, -2.05] },
      { m: "bookcaseOpen", at: [-2.5, -2.05] },
    ],
  },

  // ---------- Dining & kitchen (x = 14, walking +z) ----------
  {
    center: [10.3, -18], wall: "#E7C9AE", floor: "#EADCC6", items: [
      { m: "rugRectangle", at: [0, -0.7], s: 1.2, colors: { carpet: "#E9E2D3", carpetDarker: "#D8CDBB" } },
      { p: "harvest-table", at: [0, -0.8] },
      { p: "nook-chair", at: [-0.55, 0.1], rot: 180 },
      { m: "chairCushion", at: [0.55, 0.1], rot: 180 },
      { m: "chairCushion", at: [-0.55, -1.7] },
      { m: "chairCushion", at: [0.55, -1.7] },
      { m: "plantSmall1", at: [0, -0.8], y: 0.69, s: 1.6 },
      { m: "pottedPlant", at: [2.2, -2.0], s: 1.5 },
    ],
  },
  {
    center: [17.7, -16], wall: "#F3EFE7", floor: "#DFD7CA", items: [
      { m: "kitchenCabinet", at: [-2.25, -2.0] },
      { m: "kitchenSink", at: [-1.35, -2.0] },
      { m: "kitchenCabinetDrawer", at: [-0.45, -2.0] },
      { m: "kitchenStove", at: [0.45, -2.0] },
      { m: "kitchenCabinet", at: [1.35, -2.0] },
      { m: "kitchenFridgeLarge", at: [2.65, -2.05] },
      { m: "kitchenCabinetUpper", at: [-2.25, -2.15], y: 1.45 },
      { m: "kitchenCabinetUpper", at: [-1.35, -2.15], y: 1.45 },
      { m: "kitchenCabinetUpper", at: [1.35, -2.15], y: 1.45 },
      { m: "kitchenCoffeeMachine", at: [-0.45, -2.05], y: 0.95 },
      { m: "kitchenBar", at: [-0.45, -0.25] },
      { m: "kitchenBar", at: [0.45, -0.25] },
      { m: "kitchenBarEnd", at: [1.0, -0.25] },
      { p: "perch-stool", at: [-0.45, 0.55], rot: 180 },
      { m: "stoolBar", at: [0.45, 0.55], rot: 180 },
    ],
  },
  {
    center: [10.3, -4], wall: "#C9D3BF", floor: "#E6D6BD", items: [
      { m: "rugRound", at: [0, -0.7], s: 1.2, colors: { carpet: "#EFE9DD", carpetDarker: "#DDD3C2" } },
      { p: "moon-table", at: [0, -0.7] },
      { m: "chairModernFrameCushion", at: [-0.95, -0.7], rot: 90, colors: { carpetBlue: "#C47A57" } },
      { m: "chairModernFrameCushion", at: [0.95, -0.7], rot: -90, colors: { carpetBlue: "#C47A57" } },
      { m: "plantSmall3", at: [0, -0.7], y: 0.77, s: 1.6 },
      { m: "bookcaseOpenLow", at: [-2.1, -2.05] },
      { m: "radio", at: [-2.1, -2.05], y: 0.84 },
    ],
  },
  {
    center: [17.7, -2], wall: "#D8C3A8", floor: "#EADCC6", items: [
      { m: "kitchenBar", at: [-0.45, -1.4] },
      { m: "kitchenBar", at: [0.45, -1.4] },
      { m: "kitchenCoffeeMachine", at: [-0.4, -1.45], y: 0.88 },
      { m: "stoolBar", at: [-0.45, -0.55], rot: 180, colors: { carpet: "#9DB08F" } },
      { m: "stoolBar", at: [0.45, -0.55], rot: 180, colors: { carpet: "#9DB08F" } },
      { m: "pottedPlant", at: [-2.2, -2.0], s: 1.6 },
      { m: "pottedPlant", at: [2.2, -2.0], s: 1.3 },
    ],
  },

  // ---------- Bedroom (x = 28, walking −z) ----------
  {
    center: [24.3, -3], wall: "#B7C1D3", floor: "#E6D6BD", items: [
      { m: "rugRectangle", at: [0, -0.3], s: 1.3, colors: { carpet: "#EFE9DD", carpetDarker: "#DDD3C2" } },
      { p: "dune-bed", at: [0, -1.1] },
      { p: "still-bedside", at: [-1.5, -2.05] },
      { m: "cabinetBedDrawerTable", at: [1.5, -2.05] },
      { m: "lampSquareTable", at: [-1.5, -2.1], y: 0.56 },
      { m: "lampSquareTable", at: [1.5, -2.1], y: 0.56 },
      { m: "pillowLong", at: [0, -1.9], y: 0.6, colors: { carpet: "#B7C1D3" } },
    ],
  },
  {
    center: [31.7, -5], wall: "#EFE6D8", floor: "#EADCC6", items: [
      { m: "rugRound", at: [0, -0.4], colors: { carpet: "#E4DCCB", carpetDarker: "#CFC3AE" } },
      { p: "tidy-drawers", at: [-1.3, -2.05] },
      { p: "shelter-cabinet", at: [1.1, -2.05] },
      { m: "plantSmall2", at: [-1.5, -2.1], y: 0.81, s: 1.6 },
      { m: "lampRoundTable", at: [-0.95, -2.1], y: 0.81 },
      { m: "coatRackStanding", at: [2.6, -1.6] },
      { m: "pottedPlant", at: [-2.6, -1.8], s: 1.4 },
    ],
  },
  {
    center: [24.3, -17], wall: "#E8D6C0", floor: "#E6D6BD", items: [
      { m: "rugRound", at: [-0.2, -0.2], colors: { carpet: "#C9D3BF", carpetDarker: "#B5C2AA" } },
      { p: "dune-single", at: [0.9, -1.1] },
      { m: "cabinetBedDrawerTable", at: [-0.45, -2.05] },
      { m: "lampRoundTable", at: [-0.45, -2.1], y: 0.56 },
      { m: "bookcaseOpenLow", at: [-2.1, -2.05] },
      { m: "books", at: [-2.1, -2.05], y: 0.84 },
      { m: "cardboardBoxClosed", at: [-1.6, 0.2], s: 1.2 },
    ],
  },
  {
    center: [31.7, -19], wall: "#C7CFC2", floor: "#EADCC6", items: [
      { m: "bookcaseClosedWide", at: [-1.7, -2.05] },
      { m: "bookcaseClosedWide", at: [0.0, -2.05] },
      { m: "loungeDesignChair", at: [1.9, -1.0], rot: -30, colors: { carpetBlue: "#D8CDBB" } },
      { m: "lampRoundFloor", at: [2.6, -1.9] },
      { m: "rugSquare", at: [1.6, -0.6], colors: { carpet: "#E9E2D3", carpetDarker: "#D8CDBB" } },
    ],
  },

  // ---------- Workspace (x = 42, walking +z) ----------
  {
    center: [38.3, -18], wall: "#CBD5D1", floor: "#E6D6BD", items: [
      { m: "rugRectangle", at: [0, -0.9], colors: { carpet: "#E4DCCB", carpetDarker: "#CFC3AE" } },
      { p: "focus-desk", at: [0, -1.7] },
      { p: "pivot-chair", at: [0, -0.8], rot: 180 },
      { m: "computerScreen", at: [0, -2.0], y: 0.81 },
      { m: "computerKeyboard", at: [0, -1.6], y: 0.81 },
      { p: "beam-lamp", at: [0.6, -1.9], y: 0.81 },
      { m: "bookcaseOpen", at: [-2.3, -2.05] },
      { m: "pottedPlant", at: [2.3, -1.9], s: 1.5 },
    ],
  },
  {
    center: [45.7, -16], wall: "#EFE6D8", floor: "#EADCC6", items: [
      { p: "corner-desk", at: [-0.3, -1.1] },
      { m: "chairDesk", at: [-0.7, -0.6], rot: 150, colors: { carpet: "#55585A" } },
      { m: "laptop", at: [-0.9, -1.75], y: 0.81 },
      { m: "lampSquareTable", at: [0.6, -1.95], y: 0.81 },
      { p: "column-floor", at: [2.3, -1.9] },
      { m: "plantSmall2", at: [0.2, -1.9], y: 0.81, s: 1.6 },
    ],
  },
  {
    center: [38.3, -6], wall: "#2F4A3E", floor: "#E6D6BD", label: "Lighting", items: [
      { box: [0.7, 0.6, 0.7], at: [-1.8, -1.0], color: "#F4F1EA" },
      { box: [0.7, 0.9, 0.7], at: [-0.6, -1.4], color: "#F4F1EA" },
      { box: [0.7, 0.6, 0.7], at: [0.6, -1.0], color: "#F4F1EA" },
      { m: "lampRoundTable", at: [-1.8, -1.0], y: 0.6 },
      { m: "lampSquareTable", at: [-0.6, -1.4], y: 0.9 },
      { m: "lampRoundTable", at: [0.6, -1.0], y: 0.6, colors: { metal: "#C9A15A" } },
      { m: "lampRoundFloor", at: [1.8, -1.6], colors: { metal: "#36383A" } },
      { m: "lampSquareFloor", at: [2.5, -1.9], colors: { metal: "#C9A15A" } },
    ],
  },
  {
    center: [45.7, -6], wall: "#E7C9AE", floor: "#EADCC6", items: [
      { m: "desk", at: [0, -1.7], colors: { wood: "#F1EFEA" } },
      { m: "chairModernFrameCushion", at: [0, -0.9], rot: 180, colors: { carpetBlue: "#9DB08F" } },
      { m: "laptop", at: [0.1, -1.8], y: 0.81 },
      { m: "radio", at: [-0.55, -1.9], y: 0.81 },
      { m: "bookcaseOpenLow", at: [-2.1, -2.05] },
      { m: "bookcaseOpenLow", at: [2.1, -2.05] },
      { m: "plantSmall1", at: [2.1, -2.05], y: 0.84, s: 1.6 },
    ],
  },
];

/** Market hall bins and checkout tills around the end of the walk (x 36–48, z −1 … 12). */
const MARKET = [
  { center: [38.4, 3], tagZ: 1.05, items: [
    { box: [2.6, 0.75, 1.3], at: [0, 0], color: "#E2C39C" },
    { p: "plush-cushion", at: [-0.8, 0.1], y: 0.75, rot: 10 },
    { m: "pillow", at: [-0.35, -0.1], y: 0.75, rot: -15, colors: { carpet: "#9DB08F" } },
    { m: "pillow", at: [0.1, 0.15], y: 0.75, rot: 25, colors: { carpet: "#C47A57" } },
    { m: "pillowLong", at: [0.75, -0.1], y: 0.75, colors: { carpet: "#55585A" } },
  ] },
  { center: [45.6, 3], tagZ: 1.05, items: [
    { box: [2.6, 0.75, 1.3], at: [0, 0], color: "#E2C39C" },
    { p: "fern-pot", at: [-0.8, 0], y: 0.75 },
    { m: "pottedPlant", at: [-0.2, 0.2], y: 0.75, colors: { wood: "#C47A57" } },
    { m: "pottedPlant", at: [0.4, -0.15], y: 0.75, colors: { wood: "#F1EFEA" } },
    { m: "plantSmall2", at: [0.95, 0.2], y: 0.75, s: 1.8 },
  ] },
  { center: [38.6, -0.5], tagZ: 1.0, items: [
    { p: "loop-rug", at: [0, 0] },
    { m: "rugSquare", at: [0, 0], y: 0.04, rot: 12, colors: { carpet: "#9DB08F", carpetDarker: "#86997A" } },
    { m: "rugSquare", at: [0, 0], y: 0.08, rot: -9, colors: { carpet: "#C47A57", carpetDarker: "#A86545" } },
  ] },
];

const TILLS = [
  { center: [37.5, 10.5], items: [
    { m: "kitchenBar", at: [-0.45, 0] }, { m: "kitchenBar", at: [0.45, 0] }, { m: "kitchenBarEnd", at: [1.0, 0] },
    { m: "computerScreen", at: [0, -0.1], y: 0.88, s: 0.8 },
  ] },
  { center: [46.5, 10.5], items: [
    { m: "kitchenBar", at: [-0.45, 0] }, { m: "kitchenBar", at: [0.45, 0] }, { m: "kitchenBarEnd", at: [1.0, 0] },
    { m: "computerScreen", at: [0, -0.1], y: 0.88, s: 0.8 },
  ] },
];

const DEG = Math.PI / 180;

function placeGroup(group, roomIndex, faceYaw) {
  const [cx, cz] = group.center;
  let yaw = faceYaw;
  if (yaw === undefined) {
    const p = nearestPoint(cx, cz);
    yaw = Math.atan2(p.x - cx, p.z - cz); // local +z → toward the path
  }
  const cos = Math.cos(yaw);
  const sin = Math.sin(yaw);
  const toWorld = ([lx, lz]) => [cx + lx * cos + lz * sin, cz - lx * sin + lz * cos];
  const toPath = [Math.sin(yaw), Math.cos(yaw)];

  // Price tags line up along the room's front edge (like a tag rail by the aisle),
  // under their product but pushed apart so they never overlap.
  const tagZ = group.tagZ ?? 1.35;
  const tagged = group.items
    .map((it, i) => ({ it, i, x: it.at[0] }))
    .filter(({ it }) => it.p)
    .sort((a, b) => a.x - b.x);
  for (let k = 1; k < tagged.length; k++) {
    tagged[k].x = Math.max(tagged[k].x, tagged[k - 1].x + 0.95);
  }
  const tagX = Object.fromEntries(tagged.map(({ i, x }) => [i, x]));

  const items = group.items.map((it, i) => {
    const [x, z] = toWorld(it.at);
    const tag = it.p ? toWorld([tagX[i], tagZ]) : null;
    return {
      key: `${roomIndex}-${i}`,
      productId: it.p || null,
      model: it.m || null,
      box: it.box || null,
      color: it.color,
      colors: it.colors,
      position: [x, it.y || 0, z],
      yaw: yaw + (it.rot || 0) * DEG,
      scale: it.s || 1,
      toPath,
      tag: tag ? { position: [tag[0], 0, tag[1]], yaw } : null,
    };
  });
  return { yaw, items };
}

export const ROOM_SETS = ROOMS.map((room, i) => {
  const { yaw, items } = placeGroup(room, `r${i}`);
  return { ...room, yaw, items };
});

export const MARKET_SETS = MARKET.map((g, i) => ({ ...g, ...placeGroup(g, `m${i}`) }));
// Tills face the walker coming down the last stretch (−z direction).
export const TILL_SETS = TILLS.map((g, i) => ({ ...g, ...placeGroup(g, `t${i}`, Math.PI) }));

export const ALL_ITEMS = [...ROOM_SETS, ...MARKET_SETS, ...TILL_SETS].flatMap((g) => g.items);

/** Where each product instance stands, keyed by item key, for camera focus. */
export const PLACEMENTS = Object.fromEntries(
  ALL_ITEMS.filter((it) => it.productId).map((it) => [it.key, it]),
);

/** First placement of each product (used by the list view and minimap). */
export const FIRST_PLACEMENT = {};
for (const it of ALL_ITEMS) {
  if (it.productId && !FIRST_PLACEMENT[it.productId]) FIRST_PLACEMENT[it.productId] = it;
}

/** Hanging department signs, a few meters into each zone, facing the walker. */
export const SIGNS = ZONES.filter((z) => z.id !== "entrance").map((zone, i) => {
  const { point, tangent } = frameAt(zone.dist + 3);
  return {
    id: zone.id,
    number: i + 1,
    title: zone.name,
    position: [point.x, 3.05, point.z],
    yaw: Math.atan2(-tangent.x, -tangent.z),
  };
});

/**
 * Partition and outer walls as [x1, z1, x2, z2] segments. Corridors are 14 m apart,
 * partitions stop short at the ends where the path U-turns.
 */
export const WALLS = [
  [7, 15, 7, -28], [21, -39, 21, 7.5], [35, 15, 35, -28],
  [-7, 15, -7, -39], [-7, -39, 49, -39], [49, -39, 49, 15], [-7, 15, 49, 15],
];
