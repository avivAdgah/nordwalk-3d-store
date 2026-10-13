import * as THREE from "three";

export const FONT = "Outfit, system-ui, sans-serif";
export const BRAND = { ink: "#22302A", green: "#2F4A3E", yellow: "#F2C46D", cream: "#FBF8F2", path: "#EFEAE1" };

const cache = new Map();

function canvasTexture(key, w, h, draw) {
  if (cache.has(key)) return cache.get(key);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  cache.set(key, tex);
  return tex;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Wraps text to `maxWidth`, returning at most `maxLines` lines. */
function wrap(ctx, text, maxWidth, maxLines) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines.slice(0, maxLines);
}

/** Price tag card: product name + price, brand-yellow price block. */
export function tagTexture(name, price, highlighted = false) {
  return canvasTexture(`tag:${name}:${price}:${highlighted}`, 512, 320, (ctx, w, h) => {
    roundRect(ctx, 0, 0, w, h, 34);
    ctx.fillStyle = highlighted ? BRAND.green : "#FFFFFF";
    ctx.fill();
    ctx.fillStyle = highlighted ? "#FFFFFF" : BRAND.ink;
    ctx.font = `700 46px ${FONT}`;
    wrap(ctx, name, w - 64, 2).forEach((l, i) => ctx.fillText(l, 32, 74 + i * 54));
    roundRect(ctx, 32, h - 118, 230, 88, 22);
    ctx.fillStyle = BRAND.yellow;
    ctx.fill();
    ctx.fillStyle = BRAND.ink;
    ctx.font = `800 62px ${FONT}`;
    ctx.fillText(`$${price}`, 52, h - 52);
    ctx.font = `600 30px ${FONT}`;
    ctx.fillStyle = highlighted ? "rgba(255,255,255,.8)" : "#6C756F";
    ctx.textAlign = "right";
    ctx.fillText(highlighted ? "View ›" : "Click to view", w - 32, h - 58);
  });
}

/** Hanging department sign: big number badge + department name. */
export function signTexture(number, title) {
  return canvasTexture(`sign:${number}:${title}`, 1024, 256, (ctx, w, h) => {
    roundRect(ctx, 0, 0, w, h, 40);
    ctx.fillStyle = BRAND.green;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(128, h / 2, 78, 0, Math.PI * 2);
    ctx.fillStyle = BRAND.yellow;
    ctx.fill();
    ctx.fillStyle = BRAND.ink;
    ctx.font = `800 96px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillText(String(number), 128, h / 2 + 34);
    ctx.textAlign = "left";
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `700 ${title.length > 18 ? 66 : 84}px ${FONT}`;
    ctx.fillText(title, 240, h / 2 + 28);
  });
}

/** Wide banner with a headline and a sub-line. */
export function bannerTexture(title, sub, bg = BRAND.green) {
  return canvasTexture(`banner:${title}:${sub}:${bg}`, 1536, 384, (ctx, w, h) => {
    roundRect(ctx, 0, 0, w, h, 48);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFFFFF";
    // Shrink long headlines so they always fit inside the banner.
    let size = 128;
    do {
      ctx.font = `800 ${size}px ${FONT}`;
      size -= 4;
    } while (ctx.measureText(title).width > w - 120 && size > 48);
    ctx.fillText(title, w / 2, 190);
    ctx.fillStyle = BRAND.yellow;
    ctx.font = `600 62px ${FONT}`;
    ctx.fillText(sub, w / 2, 290);
  });
}

/** Floor arrow (points toward +y of the texture = forward). */
export function arrowTexture() {
  return canvasTexture("arrow", 256, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = BRAND.yellow;
    ctx.strokeStyle = "rgba(34,48,42,.35)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(w / 2, 22);
    ctx.lineTo(w - 36, 130);
    ctx.lineTo(w / 2 + 34, 130);
    ctx.lineTo(w / 2 + 34, h - 26);
    ctx.lineTo(w / 2 - 34, h - 26);
    ctx.lineTo(w / 2 - 34, 130);
    ctx.lineTo(36, 130);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });
}

/** Light concrete floor with faint 1 m tiles. */
export function floorTexture() {
  const tex = canvasTexture("floor", 512, 512, (ctx, w, h) => {
    ctx.fillStyle = "#E4E0D8";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) {
      ctx.fillStyle = `rgba(${Math.random() > 0.5 ? "255,255,255" : "120,110,100"},${Math.random() * 0.05})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
    ctx.strokeStyle = "rgba(120,110,100,.12)";
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, w, h);
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}
