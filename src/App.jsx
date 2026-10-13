import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import Showroom from "./scene/Showroom";
import CameraRig from "./scene/CameraRig";
import { preloadModels } from "./scene/Model";
import { ALL_ITEMS } from "./data/layout";
import { PRODUCTS } from "./data/catalog";
import Intro from "./ui/Intro";
import Hud from "./ui/Hud";
import ProductPanel from "./ui/ProductPanel";
import CartDrawer from "./ui/CartDrawer";
import Checkout from "./ui/Checkout";
import ProductList from "./ui/ProductList";
import Toast from "./ui/Toast";

preloadModels([
  ...new Set([...ALL_ITEMS.filter((i) => i.model).map((i) => i.model), ...Object.values(PRODUCTS).map((p) => p.model)]),
]);

/** Canvas textures draw text with Outfit, so wait for the font (with a timeout fallback). */
function useFontsReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const fonts = ["600 40px Outfit", "700 40px Outfit", "800 40px Outfit"].map((f) => document.fonts.load(f));
    const timeout = new Promise((r) => setTimeout(r, 2500));
    Promise.race([Promise.all(fonts), timeout]).then(() => setReady(true));
  }, []);
  return ready;
}

export default function App() {
  const fontsReady = useFontsReady();
  return (
    <>
      <Canvas
        className="scene"
        style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh" }}
        resize={{ debounce: 0 }}
        shadows
        dpr={[1, 1.75]}
        camera={{ fov: 62, near: 0.05, far: 80, position: [0, 1.62, 10] }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#F3EFE8"]} />
        <fog attach="fog" args={["#F3EFE8", 18, 50]} />
        <hemisphereLight args={["#FFFFFF", "#CDBDA4", 0.7]} />
        <ambientLight intensity={0.12} />
        <Environment resolution={128} environmentIntensity={0.35}>
          <Lightformer form="rect" intensity={2.2} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[30, 30, 1]} />
          <Lightformer form="rect" intensity={1} color="#FFE9CF" position={[-12, 3, 0]} rotation-y={Math.PI / 2} scale={[20, 4, 1]} />
          <Lightformer form="rect" intensity={1} color="#E4EEF0" position={[12, 3, 0]} rotation-y={-Math.PI / 2} scale={[20, 4, 1]} />
        </Environment>
        {fontsReady && (
          <Suspense fallback={null}>
            <Showroom />
          </Suspense>
        )}
        <CameraRig />
      </Canvas>

      <Hud />
      <ProductPanel />
      <ProductList />
      <CartDrawer />
      <Checkout />
      <Toast />
      <Intro ready={fontsReady} />
    </>
  );
}
