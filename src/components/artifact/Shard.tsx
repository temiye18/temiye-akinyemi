"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import type { Mesh } from "three";

function ShardMesh() {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.12;
  });
  return (
    <mesh ref={ref}>
      {/* faceted warm-stone shard — reads on both cream and near-black grounds */}
      <icosahedronGeometry args={[1.35, 0]} />
      <meshStandardMaterial
        color="#6a6353"
        metalness={0.4}
        roughness={0.38}
        flatShading
      />
    </mesh>
  );
}

/**
 * The signature Artifact — a faceted obsidian shard lit by sodium-amber, slowly
 * turning and draggable with inertial damping. Mounted client-only via dynamic
 * import; the reduced-motion poster is handled by the wrapper.
 */
export default function Shard() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 4.2], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      frameloop="always"
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 4]} intensity={2.2} color="#fff8ec" />
      <directionalLight position={[-4, -1, 1]} intensity={0.6} color="#cfd6e0" />
      <pointLight position={[-3, -2, 2]} intensity={28} color="#fbf3e4" />
      <ShardMesh />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        autoRotate
        autoRotateSpeed={0.6}
        rotateSpeed={0.6}
      />
    </Canvas>
  );
}
