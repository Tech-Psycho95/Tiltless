"use client";

import { useEffect, useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { InstancedMesh, Object3D, Color, MathUtils } from "three";
import type { Points as ThreePoints } from "three";
import { Float, Points, PointMaterial } from "@react-three/drei";

const COUNT = 40; // Number of candlesticks
const TILT_COUNT = 5; // How many are 'tilted' (red)

export function HeroChart() {
  const meshRef = useRef<InstancedMesh>(null);
  const { viewport, mouse } = useThree();
  const dummy = useMemo(() => new Object3D(), []);
  
  // Base colors
  const mintColor = useMemo(() => new Color("#97FCE4"), []);
  const redColor = useMemo(() => new Color("#FF5C5C"), []);
  const darkGlass = useMemo(() => new Color("#1a222c"), []);
  const currentColor = useMemo(() => new Color(), []);

  const barsData = useMemo(() => {
    const data = [];
    for (let i = 0; i < COUNT; i++) {
      const isTilt = i > COUNT - TILT_COUNT - 3 && i < COUNT - 2; // Arbitrary cluster of tilted bars
      data.push({
        position: [
          (i - COUNT / 2) * 0.4, // x position spread
          MathUtils.randFloat(-1, 1), // initial y
          MathUtils.randFloat(-2, 2) // z depth
        ],
        scale: [0.15, MathUtils.randFloat(0.5, 2.5), 0.15],
        isTilt,
        color: isTilt ? redColor : mintColor,
        speed: MathUtils.randFloat(0.5, 1.5),
        offset: MathUtils.randFloat(0, Math.PI * 2)
      });
    }
    return data;
  }, [mintColor, redColor]);

  // Set initial instances
  useEffect(() => {
    if (!meshRef.current) return;
    barsData.forEach((bar, i) => {
      dummy.position.set(bar.position[0], bar.position[1], bar.position[2]);
      dummy.scale.set(bar.scale[0], bar.scale[1], bar.scale[2]);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, bar.isTilt ? redColor : darkGlass); // Base state color
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [dummy, barsData, darkGlass, redColor]);

  // Animation frame
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();

    // Group parallax rotation based on mouse
    const targetRotX = (mouse.y * viewport.height) / 10;
    const targetRotY = (mouse.x * viewport.width) / 10;
    
    meshRef.current.rotation.x = MathUtils.lerp(meshRef.current.rotation.x, targetRotX * 0.1, 0.05);
    meshRef.current.rotation.y = MathUtils.lerp(meshRef.current.rotation.y, targetRotY * 0.1, 0.05);

    barsData.forEach((bar, i) => {
      const yOffset = Math.sin(time * bar.speed + bar.offset) * 0.2;
      let xOffset = 0;
      
      // Subtle shake for tilted bars
      if (bar.isTilt) {
        xOffset = Math.sin(time * 20) * 0.02; 
      }
      
      dummy.position.set(bar.position[0] + xOffset, bar.position[1] + yOffset, bar.position[2]);
      dummy.scale.set(bar.scale[0], bar.scale[1], bar.scale[2]);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      
      // Color interpolation for non-tilted to pulse
      if (!bar.isTilt) {
        const pulse = (Math.sin(time * 2 + bar.offset) + 1) * 0.5;
        currentColor.copy(darkGlass).lerp(mintColor, pulse * 0.3);
        meshRef.current!.setColorAt(i, currentColor);
      }
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <group position={[0, 0, -2]}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
          <boxGeometry />
          <meshStandardMaterial
            transparent 
            opacity={0.72}
            roughness={0.35}
            metalness={0.1}
          />
        </instancedMesh>
      </Float>
    </group>
  );
}

export function Particles() {
  const sphere = useMemo(() => {
    const count = 500;
    const positions = new Float32Array(count * 3);
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const radius = Math.sqrt(1 - y * y) * 5;
      const angle = goldenAngle * i;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y * 5;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, []);

  const ref = useRef<ThreePoints>(null);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 20;
      ref.current.rotation.y -= delta / 30;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial transparent color="#ffffff" size={0.02} sizeAttenuation={true} depthWrite={false} opacity={0.2} />
      </Points>
    </group>
  );
}
