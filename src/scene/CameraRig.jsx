import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { frameAt, PATH_LENGTH } from "../data/path";
import { PLACEMENTS } from "../data/layout";
import { useStore } from "../store";
import { productSizes } from "./Product";

const EYE = 1.62;
const WALK_SPEED = 3.4; // m/s when holding a key or arrow button
const damp = (current, target, lambda, dt) => THREE.MathUtils.damp(current, target, lambda, dt);

/** Eases unit vector `dir` toward unit vector `target` (handles near-opposite directions). */
function turnToward(dir, target, lambda, dt) {
  const k = 1 - Math.exp(-lambda * dt);
  dir.lerp(target, k);
  if (dir.lengthSq() < 1e-6) dir.copy(target);
  dir.normalize();
}

/**
 * Shared input state written by DOM listeners, read every frame.
 * yaw / pitch are look offsets set by dragging (mouse or touch); keyLook by ← → keys.
 */
export const input = { forward: 0, keyLook: 0, yaw: 0, pitch: 0 };

/**
 * Moves the camera along the path (scroll / keys / touch swipe), lets the visitor look
 * around by dragging, and steps up to a product when one is selected. Plain mouse movement
 * never turns the camera, so products stay put under the cursor while you aim at them.
 */
export default function CameraRig() {
  const { camera, gl } = useThree();
  const state = useRef({
    dist: useStore.getState().targetDist,
    yaw: 0,
    pitch: 0,
    published: -1,
    teleportTick: 0,
    selectedKey: null,
    pos: new THREE.Vector3(),
    dir: new THREE.Vector3(0, 0, -1),
    look: new THREE.Vector3(),
    init: false,
  });
  const tmp = useRef({ p: new THREE.Vector3(), t: new THREE.Vector3(), ahead: new THREE.Vector3(), v: new THREE.Vector3() }).current;

  useWalkInput(gl.domElement);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = state.current;
    const store = useStore.getState();

    if (input.forward && store.entered) store.walk(input.forward * WALK_SPEED * dt);
    if (input.keyLook) input.yaw = THREE.MathUtils.clamp(input.yaw + input.keyLook * 1.6 * dt, -2.6, 2.6);
    if (store.selectedKey !== s.selectedKey) {
      // Start each product view (and the walk after it) from a centred look.
      s.selectedKey = store.selectedKey;
      input.yaw = 0;
      input.pitch = 0;
    }
    if (store.teleportTick !== s.teleportTick) {
      s.teleportTick = store.teleportTick;
      s.dist = store.targetDist;
      s.init = false; // snap position and view on this frame
    }
    s.dist = damp(s.dist, store.targetDist, 3.2, dt);
    if (Math.abs(s.dist - s.published) > 0.05) {
      s.published = s.dist;
      store.setCurrentDist(s.dist);
    }

    const selected = store.selectedKey && PLACEMENTS[store.selectedKey];
    const desiredPos = tmp.v;
    const desiredLook = tmp.ahead;
    // Picked from afar (list, link, next/prev): walk the path to it first, then step in.
    const arriving = selected && Math.abs(store.targetDist - s.dist) > 2.5;

    if (selected && !arriving) {
      // Frame the product from the aisle side; dragging orbits around it.
      const size = productSizes.get(store.selectedKey) || new THREE.Vector3(1, 1, 1);
      const [px, py, pz] = selected.position;
      const portrait = window.innerWidth < window.innerHeight;
      // A portrait phone sees a narrow slice horizontally, so step further back.
      const reach = (Math.max(size.x, size.z, size.y) * 1.15 + 1.5) * (portrait ? 1.45 : 1);
      input.yaw = THREE.MathUtils.clamp(input.yaw, -1.1, 1.1); // stay on the aisle side
      const [tx, tz] = selected.toPath;
      const base = Math.atan2(tx, tz) - input.yaw;
      const lift = THREE.MathUtils.clamp(-input.pitch, -0.4, 0.9);
      desiredPos.set(px + Math.sin(base) * reach, py + size.y * 0.55 + 0.75 + lift, pz + Math.cos(base) * reach);
      desiredLook.set(px, py + size.y * 0.45, pz);
      // On wide screens the product panel covers the right side, so aim a little to the
      // right of the product to show it in the free space on the left.
      if (window.innerWidth > 900) {
        desiredLook.x += Math.cos(base) * reach * 0.22;
        desiredLook.z -= Math.sin(base) * reach * 0.22;
      } else if (window.innerWidth <= 640) {
        // On phones the panel is a bottom sheet: aim low so the product sits in the top half.
        desiredLook.y -= reach * 0.32;
      }
      if (!s.init) {
        // Arrived by teleport: start on the path beside the product, then step in.
        const { point } = frameAt(s.dist, tmp.p, tmp.t);
        s.pos.set(point.x, EYE, point.z);
        s.dir.copy(desiredLook).sub(s.pos).normalize();
        s.init = true;
      }
      s.pos.x = damp(s.pos.x, desiredPos.x, 3, dt);
      s.pos.y = damp(s.pos.y, desiredPos.y, 3, dt);
      s.pos.z = damp(s.pos.z, desiredPos.z, 3, dt);
      turnToward(s.dir, desiredLook.sub(s.pos).normalize(), 4, dt);
    } else {
      // Walk mode: stand on the path and look ahead; dragging turns the head.
      const { point: p, tangent: t } = frameAt(s.dist, tmp.p, tmp.t);
      const lookAheadT = frameAt(Math.min(s.dist + 2.5, PATH_LENGTH), tmp.ahead).point; // smooth through bends
      const dir = new THREE.Vector3(lookAheadT.x - p.x, 0, lookAheadT.z - p.z);
      if (dir.lengthSq() < 1e-4) dir.set(t.x, 0, t.z);
      dir.normalize();

      // While walking on, let a sideways look drift back to the direction of travel.
      if (Math.abs(store.targetDist - s.dist) > 0.4 && !input.keyLook) {
        input.yaw *= Math.exp(-1.4 * dt);
        input.pitch *= Math.exp(-1.4 * dt);
      }
      const idle = store.entered ? 0 : Math.sin(performance.now() / 2600) * 0.25; // gentle sway behind the intro
      s.yaw = damp(s.yaw, input.yaw + idle, 6, dt);
      s.pitch = damp(s.pitch, store.entered ? input.pitch : -0.05, 6, dt);
      dir.applyAxisAngle(THREE.Object3D.DEFAULT_UP, s.yaw);

      const bob = Math.sin(s.dist * 3.2) * 0.025 * Math.min(1, Math.abs(store.targetDist - s.dist));
      desiredPos.set(p.x, EYE + bob, p.z);
      dir.y = s.pitch - 0.09;
      dir.normalize();
      if (!s.init) {
        s.pos.copy(desiredPos);
        s.dir.copy(dir);
        s.init = true;
      }
      s.pos.x = damp(s.pos.x, desiredPos.x, 6, dt);
      s.pos.y = damp(s.pos.y, desiredPos.y, 6, dt);
      s.pos.z = damp(s.pos.z, desiredPos.z, 6, dt);
      turnToward(s.dir, dir, 5, dt);
    }

    // The view direction (not a fixed look-at point) is smoothed, so a fast walk can
    // never overtake the point the camera looks at and spin it around.
    camera.position.copy(s.pos);
    camera.lookAt(s.look.copy(s.pos).add(s.dir));
  });

  return <FollowLight />;
}

/** Shadow-casting sun that follows the camera so shadows stay crisp everywhere. */
function FollowLight() {
  const light = useRef();
  const { camera } = useThree();
  useFrame(() => {
    const l = light.current;
    l.position.set(camera.position.x + 5, 11, camera.position.z + 4);
    l.target.position.set(camera.position.x, 0, camera.position.z);
    l.target.updateMatrixWorld();
  });
  return (
    <directionalLight
      ref={light}
      intensity={2.1}
      color="#FFF6E8"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-bias={-0.0004}
      shadow-normalBias={0.03}
      shadow-camera-left={-14}
      shadow-camera-right={14}
      shadow-camera-top={14}
      shadow-camera-bottom={-14}
      shadow-camera-near={1}
      shadow-camera-far={30}
    />
  );
}

/** Wheel, keyboard and touch-drag controls. */
function useWalkInput(canvas) {
  useEffect(() => {
    const isUi = (el) => el instanceof Element && el.closest("[data-ui-scroll]");

    const onWheel = (e) => {
      if (isUi(e.target)) return;
      const store = useStore.getState();
      if (!store.entered || store.selectedKey) return;
      const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      store.walk(THREE.MathUtils.clamp(delta, -120, 120) * 0.012);
    };

    const keys = new Set();
    const update = () => {
      input.forward = (keys.has("up") ? 1 : 0) - (keys.has("down") ? 1 : 0);
      input.keyLook = (keys.has("left") ? 1 : 0) - (keys.has("right") ? 1 : 0);
    };
    const keyName = (e) =>
      ({ ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down", ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right" })[e.code];
    const onKeyDown = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const store = useStore.getState();
      if (e.code === "Escape") {
        if (store.checkoutOpen || store.cartOpen || store.listOpen) {
          store.setCartOpen(false);
          store.setListOpen(false);
        } else store.deselect();
        return;
      }
      const k = keyName(e);
      if (!k) return;
      e.preventDefault();
      keys.add(k);
      update();
    };
    const onKeyUp = (e) => {
      const k = keyName(e);
      if (k) {
        keys.delete(k);
        update();
      }
    };

    // Drag to look around ("grab the world": drag right turns the view left).
    // On touch, a vertical swipe walks instead (swipe up = forward, like scrolling down).
    let last = null;
    const onPointerDown = (e) => {
      if (e.button === 0) last = { x: e.clientX, y: e.clientY, touch: e.pointerType !== "mouse" };
    };
    const onPointerMove = (e) => {
      if (!last) return;
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      last.x = e.clientX;
      last.y = e.clientY;
      const store = useStore.getState();
      if (!store.entered) return;
      input.yaw = THREE.MathUtils.clamp(input.yaw + dx * (last.touch ? 0.006 : 0.0045), -2.6, 2.6);
      if (last.touch && !store.selectedKey) store.walk(-dy * 0.03);
      else input.pitch = THREE.MathUtils.clamp(input.pitch + dy * 0.003, -0.5, 0.5);
    };
    const onPointerUp = () => {
      last = null;
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [canvas]);
}
