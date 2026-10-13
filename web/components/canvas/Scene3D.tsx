"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { HeroChart, Particles } from "./HeroChart";

export default function Scene3D() {
  return (
    <div className="absolute inset-0 w-full h-full -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.25]}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1} />
          <HeroChart />
          <Particles />
        </Suspense>
      </Canvas>
    </div>
  );
}
