# NORDWALK – a walkable 3D furniture showroom

An e-commerce demo where the store *is* the interface. Visitors follow yellow floor arrows through five departments (Living Room, Dining & Kitchen, Bedroom, Workspace, Market Hall & Checkout), step up to any product to see it up close, pick a colour that updates the 3D model live, and check out.

Built with **React**, **Vite**, **three.js / React Three Fiber**, **drei** and **zustand**. No backend: the cart is stored in the browser and checkout is a demo.

## Controls

| Action | Desktop | Mobile |
| --- | --- | --- |
| Walk the route | Scroll, ↑ / ↓ (or W / S), or hold the ‹ › buttons | Swipe up / down |
| Look around | Drag, or ← / → | Swipe sideways |
| View a product | Click it or its price tag | Tap |
| Orbit a product | Drag | Swipe |
| Jump | Department bar, store map, or *All products* | Department bar, *All products* |

Shareable links: `?zone=bedroom` starts in a department, `?product=cove-sofa` opens a product.

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/ (deploy the folder as-is, e.g. Netlify Drop)
```

## Project structure

- `src/data/path.js` – the walking route (a Catmull-Rom curve) and department boundaries
- `src/data/catalog.js` – products, prices and colour variants
- `src/data/layout.js` – room sets, props, price-tag rails, walls and signs
- `src/scene/` – the 3D showroom, model loading/recolouring, products and the camera rig
- `src/ui/` – intro, HUD (department bar, minimap), product panel, cart, checkout

## Credits

3D furniture models: [Furniture Kit](https://kenney.nl/assets/furniture-kit) by Kenney, licensed CC0 (see `public/models/LICENSE-kenney.txt`). NORDWALK is a fictional brand made for a portfolio.
