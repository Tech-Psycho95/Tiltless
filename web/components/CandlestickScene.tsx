'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useMotionValue, useSpring } from 'framer-motion';
import * as THREE from 'three';

interface CandleProps {
  position: [number, number, number];
  tilt?: boolean;
  index: number;
}

function Candle({ position, tilt = false, index }: CandleProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [isTilting, setIsTilting] = useState(tilt);
  
  // Random drift speed and direction
  const driftSpeed = useMemo(() => ({
    x: (Math.random() - 0.5) * 0.3,
    y: (Math.random() - 0.5) * 0.2,
    z: (Math.random() - 0.5) * 0.3,
  }), []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    
    // Slow drift
    meshRef.current.position.x = position[0] + Math.sin(time * driftSpeed.x + index) * 0.5;
    meshRef.current.position.y = position[1] + Math.sin(time * driftSpeed.y + index) * 0.3;
    meshRef.current.position.z = position[2] + Math.cos(time * driftSpeed.z + index) * 0.5;

    // Gentle rotation
    meshRef.current.rotation.y += 0.002;

    // Tilt shake effect
    if (isTilting) {
      meshRef.current.rotation.x = Math.sin(time * 10) * 0.2;
      meshRef.current.rotation.z = Math.cos(time * 10) * 0.2;
    }
  });

  const color = isTilting ? '#ef4444' : '#10b981';
  const emissive = isTilting ? '#dc2626' : '#059669';

  return (
    <group ref={meshRef} position={position}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.8, 0.3]} />
        <meshPhysicalMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={isTilting ? 0.5 : 0.2}
          transparent
          opacity={0.8}
          roughness={0.2}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
      {/* Wick */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
        <meshPhysicalMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.3}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}

function Scene() {
  const { viewport, gl } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  
  // Mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      mouseX.set(x);
      mouseY.set(y);
    };

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reducedMotion) {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [mouseX, mouseY]);

  useFrame(() => {
    if (!groupRef.current) return;
    
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reducedMotion) {
      groupRef.current.rotation.x = -springY.get() * 0.2;
      groupRef.current.rotation.y = springX.get() * 0.3;
    }
  });

  // Generate candle positions
  const candles = useMemo(() => {
    const positions: Array<{ pos: [number, number, number]; tilt: boolean }> = [];
    const spread = 12;
    
    for (let i = 0; i < 30; i++) {
      const x = (Math.random() - 0.5) * spread;
      const y = (Math.random() - 0.5) * spread;
      const z = (Math.random() - 0.5) * spread;
      const tilt = Math.random() < 0.15; // 15% chance to be tilting
      
      positions.push({ pos: [x, y, z], tilt });
    }
    
    return positions;
  }, []);

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} castShadow />
      <pointLight position={[-10, -10, -5]} intensity={0.3} color="#97fce4" />
      
      <group ref={groupRef}>
        {candles.map((candle, i) => (
          <Candle
            key={i}
            position={candle.pos}
            tilt={candle.tilt}
            index={i}
          />
        ))}
      </group>

      {/* Particles */}
      <Particles />
    </>
  );
}

function Particles() {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    
    return positions;
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;
    particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles, 3]}
          count={particles.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#97fce4"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

export default function CandlestickScene() {
  const [dpr, setDpr] = useState(1);

  useEffect(() => {
    // Cap devicePixelRatio at 2 for performance
    setDpr(Math.min(window.devicePixelRatio, 2));
  }, []);

  // Check for WebGL support
  const hasWebGL = useMemo(() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl')
      );
    } catch (e) {
      return false;
    }
  }, []);

  if (!hasWebGL) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-brand-bg via-brand-dark to-brand-bg" />
    );
  }

  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={dpr}
        camera={{ position: [0, 0, 12], fov: 50 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        className="opacity-40 lg:opacity-60"
      >
        <Scene />
      </Canvas>
    </div>
  );
}
