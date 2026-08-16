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
      {/* faceted obsidian shard */}
      <icosahedronGeometry args={[1.35, 0]} />
      <meshStandardMaterial
        color="#0c0e15"
        metalness={0.65}
        roughness={0.22}
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
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 3, 4]} intensity={1.4} color="#e9e9f1" />
      <pointLight position={[-3, -1, -2]} intensity={45} color="#e6a251" />
      <pointLight position={[2.5, -2, 3]} intensity={22} color="#e6a251" />
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
