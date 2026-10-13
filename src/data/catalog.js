/**
 * Products for sale. `model` is a GLB in /public/models (Kenney Furniture Kit, CC0).
 * Variants recolor materials by name (e.g. "carpet" = upholstery, "wood" = frame).
 */

// Soft Scandinavian defaults that replace the kit's bright colours on every model.
export const DEFAULT_COLORS = {
  carpet: "#D8CDBB",
  carpetBlue: "#A9B6A2",
  carpetDarker: "#BFB2A0",
  carpetWhite: "#F5F2EB",
  wood: "#E2C39C",
  woodDark: "#B08862",
  metal: "#D3D6D7",
  metalMedium: "#8A9093",
  metalDark: "#44484B",
  metalLight: "#F2F4F3",
  plant: "#5E8D5A",
  lamp: "#FFF2CC",
  glass: "#CFE3E0",
  _defaultMat: "#F4F2EC",
};

const fabric = (key = "carpet") => [
  { name: "Oat", swatch: "#D8CDBB", colors: { [key]: "#D8CDBB" } },
  { name: "Sage", swatch: "#9DB08F", colors: { [key]: "#9DB08F" } },
  { name: "Charcoal", swatch: "#55585A", colors: { [key]: "#55585A" } },
  { name: "Terracotta", swatch: "#C47A57", colors: { [key]: "#C47A57" } },
];
const woods = [
  { name: "Light oak", swatch: "#E2C39C", colors: { wood: "#E2C39C" } },
  { name: "Walnut", swatch: "#8A5C3D", colors: { wood: "#8A5C3D" } },
  { name: "White", swatch: "#F1EFEA", colors: { wood: "#F1EFEA" } },
  { name: "Black", swatch: "#2F3032", colors: { wood: "#2F3032" } },
];
const metals = [
  { name: "Brushed steel", swatch: "#D3D6D7", colors: { metal: "#D3D6D7" } },
  { name: "Brass", swatch: "#C9A15A", colors: { metal: "#C9A15A" } },
  { name: "Matte black", swatch: "#36383A", colors: { metal: "#36383A" } },
];

export const PRODUCTS = {
  // ---- Living room ----
  "cove-sofa": {
    name: "Cove 3-Seat Sofa", price: 649, zone: "living", model: "loungeSofa", variants: fabric(),
    description: "Deep seats, soft feather-blend cushions and a solid oak base. Made for long Sunday afternoons.",
  },
  "cove-corner": {
    name: "Cove Corner Sofa", price: 999, zone: "living", model: "loungeSofaCorner", variants: fabric(),
    description: "The Cove family in an L-shape. Room for everyone, with removable, washable covers.",
  },
  "drift-chair": {
    name: "Drift Lounge Chair", price: 289, zone: "living", model: "loungeChairRelax", variants: fabric(),
    description: "A low, reclined armchair with a steel frame. Pair it with a floor lamp and a good book.",
  },
  "grove-coffee": {
    name: "Grove Coffee Table", price: 149, zone: "living", model: "tableCoffee", variants: woods,
    description: "Rounded corners, a lower shelf for magazines and a durable lacquered top.",
  },
  "stack-bookcase": {
    name: "Stack Open Bookcase", price: 119, zone: "living", model: "bookcaseOpen", variants: woods,
    description: "Five open shelves that work as a bookcase or a room divider. Adjustable shelf heights.",
  },
  "halo-floor": {
    name: "Halo Floor Lamp", price: 79, zone: "living", model: "lampRoundFloor", variants: metals,
    description: "A warm, diffused glow from a frosted shade on a slim stand. LED bulb included.",
  },
  "ripple-rug": {
    name: "Ripple Round Rug", price: 89, zone: "living", model: "rugRound", variants: fabric(),
    description: "Hand-tufted wool blend with a soft border. Ø 190 cm, easy to vacuum.",
  },
  "frame-tvbench": {
    name: "Frame TV Bench", price: 199, zone: "living", model: "cabinetTelevision", variants: woods,
    description: "Low and long, with cable management at the back and two open compartments.",
  },

  // ---- Dining & kitchen ----
  "harvest-table": {
    name: "Harvest Dining Table", price: 399, zone: "dining", model: "table", variants: woods,
    description: "Seats six. Solid wood top with a natural finish that gets better with every dinner.",
  },
  "nook-chair": {
    name: "Nook Dining Chair", price: 69, zone: "dining", model: "chairCushion", variants: fabric(),
    description: "A sturdy wooden chair with a padded seat. Stackable for when friends come over.",
  },
  "moon-table": {
    name: "Moon Round Table", price: 249, zone: "dining", model: "tableRound", variants: woods,
    description: "Round and pedestal-based, so nobody bumps a table leg. Perfect for small spaces.",
  },
  "perch-stool": {
    name: "Perch Bar Stool", price: 59, zone: "dining", model: "stoolBar", variants: fabric(),
    description: "Counter-height stool with a cushioned seat and a footrest ring.",
  },

  // ---- Bedroom ----
  "dune-bed": {
    name: "Dune Double Bed", price: 549, zone: "bedroom", model: "bedDouble", variants: fabric(),
    description: "Upholstered headboard and a slatted base. Mattress and bedding shown are sold separately.",
  },
  "dune-single": {
    name: "Dune Single Bed", price: 329, zone: "bedroom", model: "bedSingle", variants: fabric(),
    description: "The Dune bed in a single size, a great fit for a guest room or kids' room.",
  },
  "still-bedside": {
    name: "Still Bedside Table", price: 79, zone: "bedroom", model: "cabinetBedDrawerTable", variants: woods,
    description: "One drawer and an open shelf: just enough for a lamp, a book and your phone.",
  },
  "tidy-drawers": {
    name: "Tidy Chest of Drawers", price: 159, zone: "bedroom", model: "sideTableDrawers", variants: woods,
    description: "Smooth-running drawers with soft-close fittings and a wide top for décor.",
  },
  "shelter-cabinet": {
    name: "Shelter Storage Cabinet", price: 229, zone: "bedroom", model: "bookcaseClosedWide", variants: woods,
    description: "Closed storage that hides the clutter. Adjustable shelves inside.",
  },

  // ---- Workspace ----
  "focus-desk": {
    name: "Focus Desk", price: 199, zone: "office", model: "desk", variants: woods,
    description: "A clean-lined desk with a cable tray underneath and room for two screens.",
  },
  "corner-desk": {
    name: "Corner Desk", price: 279, zone: "office", model: "deskCorner", variants: woods,
    description: "Makes the most of a corner. Plenty of surface for work and hobbies.",
  },
  "pivot-chair": {
    name: "Pivot Office Chair", price: 149, zone: "office", model: "chairDesk", variants: fabric(),
    description: "Height-adjustable with lumbar support and smooth-rolling castors.",
  },
  "beam-lamp": {
    name: "Beam Desk Lamp", price: 35, zone: "office", model: "lampSquareTable", variants: metals,
    description: "A compact table lamp with a warm, glare-free light for late work sessions.",
  },
  "column-floor": {
    name: "Column Floor Lamp", price: 89, zone: "office", model: "lampSquareFloor", variants: metals,
    description: "A tall, square shade that throws light up and down. Dimmable.",
  },

  // ---- Market hall ----
  "fern-pot": {
    name: "Fern Potted Plant", price: 19, zone: "checkout", model: "pottedPlant", variants: [
      { name: "Oak pot", swatch: "#E2C39C", colors: { wood: "#E2C39C" } },
      { name: "Clay pot", swatch: "#C47A57", colors: { wood: "#C47A57" } },
      { name: "White pot", swatch: "#F1EFEA", colors: { wood: "#F1EFEA" } },
    ],
    description: "An easy-care houseplant in a ceramic pot. Brings any room to life.",
  },
  "plush-cushion": {
    name: "Plush Cushion", price: 15, zone: "checkout", model: "pillow", variants: fabric(),
    description: "A soft, washable cushion cover with a feather-blend inner. 50 × 50 cm.",
  },
  "loop-rug": {
    name: "Loop Square Rug", price: 49, zone: "checkout", model: "rugSquare", variants: fabric(),
    description: "Flat-woven cotton rug, reversible and machine washable. 120 × 120 cm.",
  },
};

export const PRODUCT_IDS = Object.keys(PRODUCTS);
