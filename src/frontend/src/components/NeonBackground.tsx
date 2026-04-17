"use client";
import { Canvas } from "@react-three/fiber";
import { useFrame } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import type { Mesh } from "three";

function TorusKnot() {
  const meshRef = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.15;
      meshRef.current.rotation.y += delta * 0.2;
    }
  });
  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <torusKnotGeometry args={[1.2, 0.35, 128, 16]} />
      <meshStandardMaterial
        color="#00FFFF"
        emissive="#00FFFF"
        emissiveIntensity={0.4}
        wireframe={true}
        transparent
        opacity={0.55}
      />
    </mesh>
  );
}

function FloatingOrb({
  x,
  y,
  z,
  color,
}: { x: number; y: number; z: number; color: string }) {
  const meshRef = useRef<Mesh>(null);
  const speed = 0.3 + Math.random() * 0.5;
  const offset = Math.random() * Math.PI * 2;
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y =
        y + Math.sin(state.clock.elapsedTime * speed + offset) * 0.4;
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.z += 0.003;
    }
  });
  return (
    <mesh ref={meshRef} position={[x, y, z]}>
      <icosahedronGeometry args={[0.25, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.6}
        wireframe={true}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[5, 5, 5]} color="#00FFFF" intensity={2} />
      <pointLight position={[-5, -5, -5]} color="#BF5FFF" intensity={1.5} />
      <pointLight position={[0, 0, 5]} color="#9B59B6" intensity={1} />
      <TorusKnot />
      <FloatingOrb x={-3} y={1.5} z={-2} color="#00FFFF" />
      <FloatingOrb x={3} y={-1} z={-1} color="#BF5FFF" />
      <FloatingOrb x={-2} y={-2} z={-3} color="#00FFFF" />
      <FloatingOrb x={2.5} y={2} z={-2} color="#BF5FFF" />
      <FloatingOrb x={0} y={3} z={-3} color="#9B59B6" />
    </>
  );
}

interface NeonBackgroundProps {
  className?: string;
}

export function NeonBackground({ className = "" }: NeonBackgroundProps) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
