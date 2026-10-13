import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { PATH_LENGTH, frameAt } from "../data/path";
import { ROOM_SETS, MARKET_SETS, TILL_SETS, SIGNS, WALLS } from "../data/layout";
import { KitModel } from "./Model";
import { ProductItem } from "./Product";
import { arrowTexture, bannerTexture, floorTexture, signTexture, BRAND } from "./textures";

const BOUNDS = { minX: -7, maxX: 49, minZ: -39, maxZ: 15 };
const WALL_H = 3.4;
const CEILING_H = 4.2;

export default function Showroom() {
  return (
    <group>
      <Floor />
      <Ceiling />
      <Walls />
      <PathRibbon />
      <FloorArrows />
      {ROOM_SETS.map((room, i) => (
        <RoomSet key={i} room={room} />
      ))}
      {[...MARKET_SETS, ...TILL_SETS].map((g, i) => (
        <Items key={`g${i}`} items={g.items} />
      ))}
      {SIGNS.map((s) => (
        <HangingSign key={s.id} sign={s} />
      ))}
      <Banner title="Welcome to NORDWALK" sub="Follow the arrows · scroll to walk" position={[0, 3.0, 6.5]} yaw={0} />
      <Banner title="Thanks for walking with us" sub="Checkout this way" position={[42, 3.0, 13.6]} yaw={Math.PI} bg="#B5643F" />
      <KitModel model="rugDoormat" position={[0, 0.01, 12]} scale={2.4} />
      <KitModel model="pottedPlant" position={[-2.2, 0, 12.8]} scale={2} />
      <KitModel model="pottedPlant" position={[2.2, 0, 12.8]} scale={2} />
    </group>
  );
}

function Floor() {
  const map = useMemo(() => {
    const t = floorTexture().clone();
    t.repeat.set((BOUNDS.maxX - BOUNDS.minX) / 2, (BOUNDS.maxZ - BOUNDS.minZ) / 2);
    t.needsUpdate = true;
    return t;
  }, []);
  const w = BOUNDS.maxX - BOUNDS.minX;
  const d = BOUNDS.maxZ - BOUNDS.minZ;
  return (
    <mesh rotation-x={-Math.PI / 2} position={[BOUNDS.minX + w / 2, 0, BOUNDS.minZ + d / 2]} receiveShadow>
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial map={map} roughness={0.9} />
    </mesh>
  );
}

/** White ceiling with long light panels over each corridor. */
function Ceiling() {
  const w = BOUNDS.maxX - BOUNDS.minX;
  const d = BOUNDS.maxZ - BOUNDS.minZ;
  const strips = [];
  for (const x of [0, 14, 28, 42]) {
    for (let z = 10; z > -34; z -= 6) strips.push([x, z]);
  }
  return (
    <group>
      <mesh rotation-x={Math.PI / 2} position={[BOUNDS.minX + w / 2, CEILING_H, BOUNDS.minZ + d / 2]}>
        <planeGeometry args={[w, d]} />
        {/* The ceiling gets little direct light, so give it a faint self-glow to stay bright. */}
        <meshStandardMaterial color="#F7F5F0" emissive="#EDE7DC" emissiveIntensity={0.55} roughness={1} />
      </mesh>
      {strips.map(([x, z], i) => (
        <mesh key={i} position={[x, CEILING_H - 0.02, z]} rotation-x={Math.PI / 2}>
          <planeGeometry args={[0.5, 3.2]} />
          <meshBasicMaterial color="#FFFBF0" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Walls() {
  return (
    <group>
      {WALLS.map(([x1, z1, x2, z2], i) => {
        const len = Math.hypot(x2 - x1, z2 - z1);
        const yaw = Math.atan2(x2 - x1, z2 - z1);
        return (
          <mesh key={i} position={[(x1 + x2) / 2, WALL_H / 2, (z1 + z2) / 2]} rotation-y={yaw} receiveShadow castShadow>
            <boxGeometry args={[0.2, WALL_H, len]} />
            <meshStandardMaterial color="#F4F1EA" roughness={0.95} />
          </mesh>
        );
      })}
    </group>
  );
}

/** Light walkway ribbon following the route, with darker edge lines. */
function PathRibbon() {
  const geometries = useMemo(() => {
    const strip = (offsetA, offsetB) => {
      const n = Math.ceil(PATH_LENGTH * 2);
      const pos = [];
      const idx = [];
      const p = new THREE.Vector3();
      const t = new THREE.Vector3();
      for (let i = 0; i <= n; i++) {
        frameAt((i / n) * PATH_LENGTH, p, t);
        const sx = -t.z;
        const sz = t.x;
        pos.push(p.x + sx * offsetA, 0, p.z + sz * offsetA, p.x + sx * offsetB, 0, p.z + sz * offsetB);
        if (i < n) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setIndex(idx);
      g.computeVertexNormals();
      return g;
    };
    return { walk: strip(-0.9, 0.9), left: strip(-0.98, -0.9), right: strip(0.9, 0.98) };
  }, []);
  return (
    <group position-y={0.012}>
      <mesh geometry={geometries.walk} receiveShadow>
        <meshStandardMaterial color={BRAND.path} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      {[geometries.left, geometries.right].map((g, i) => (
        <mesh key={i} geometry={g} position-y={0.002}>
          <meshStandardMaterial color="#C9BFAF" side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

/** Yellow arrows painted on the walkway every few meters. */
function FloorArrows() {
  const ref = useRef();
  const spacing = 2.8;
  const count = Math.floor((PATH_LENGTH - 2) / spacing);
  const map = useMemo(() => arrowTexture(), []);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const p = new THREE.Vector3();
    const t = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      frameAt(2 + i * spacing, p, t);
      e.set(-Math.PI / 2, Math.atan2(-t.x, -t.z), 0, "YXZ");
      q.setFromEuler(e);
      m.compose(p.setY(0.02), q, new THREE.Vector3(1, 1, 1));
      ref.current.setMatrixAt(i, m);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [count]);
  return (
    <instancedMesh ref={ref} args={[null, null, count]}>
      <planeGeometry args={[0.85, 0.85]} />
      <meshBasicMaterial map={map} transparent toneMapped={false} depthWrite={false} />
    </instancedMesh>
  );
}

/** Floor patch, back wall and side fins that make a room set, plus its furniture. */
function RoomSet({ room }) {
  const [cx, cz] = room.center;
  return (
    <group>
      <group position={[cx, 0, cz]} rotation-y={room.yaw}>
        <mesh position={[0, 0.015, -0.4]} receiveShadow>
          <boxGeometry args={[7.2, 0.03, 4.2]} />
          <meshStandardMaterial color={room.floor} roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.45, -2.62]} receiveShadow castShadow>
          <boxGeometry args={[7.2, 2.9, 0.12]} />
          <meshStandardMaterial color={room.wall} roughness={0.95} />
        </mesh>
        {[-3.6, 3.6].map((x) => (
          <mesh key={x} position={[x, 1.45, -1.9]} receiveShadow castShadow>
            <boxGeometry args={[0.12, 2.9, 1.5]} />
            <meshStandardMaterial color="#F4F1EA" roughness={0.95} />
          </mesh>
        ))}
      </group>
      <Items items={room.items} />
    </group>
  );
}

function Items({ items }) {
  return items.map((it) => {
    if (it.productId) return <ProductItem key={it.key} item={it} />;
    if (it.box) {
      const [w, h, d] = it.box;
      return (
        <mesh key={it.key} position={[it.position[0], it.position[1] + h / 2, it.position[2]]} rotation-y={it.yaw} castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={it.color} roughness={0.8} />
        </mesh>
      );
    }
    return <KitModel key={it.key} model={it.model} colors={it.colors} scale={it.scale} position={it.position} rotation-y={it.yaw} />;
  });
}

function HangingSign({ sign }) {
  const map = useMemo(() => signTexture(sign.number, sign.title), [sign]);
  return (
    <group position={sign.position} rotation-y={sign.yaw}>
      <mesh>
        <planeGeometry args={[2.8, 0.7]} />
        <meshBasicMaterial map={map} toneMapped={false} side={THREE.DoubleSide} transparent />
      </mesh>
      {[-1.1, 1.1].map((x) => (
        <mesh key={x} position={[x, (CEILING_H - sign.position[1]) / 2 + 0.35, 0]}>
          <cylinderGeometry args={[0.008, 0.008, CEILING_H - sign.position[1] - 0.35, 4]} />
          <meshBasicMaterial color="#8C8C8C" />
        </mesh>
      ))}
    </group>
  );
}

function Banner({ title, sub, position, yaw, bg }) {
  const map = useMemo(() => bannerTexture(title, sub, bg), [title, sub, bg]);
  return (
    <group position={position} rotation-y={yaw}>
      <mesh>
        <planeGeometry args={[4.4, 1.1]} />
        <meshBasicMaterial map={map} toneMapped={false} side={THREE.DoubleSide} transparent />
      </mesh>
    </group>
  );
}

