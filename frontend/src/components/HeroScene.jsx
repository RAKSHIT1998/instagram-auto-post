import { Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";

const REDUCED_MOTION = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function DistortedBlob() {
  return (
    <Float speed={REDUCED_MOTION ? 0 : 1.4} rotationIntensity={REDUCED_MOTION ? 0 : 0.6} floatIntensity={REDUCED_MOTION ? 0 : 1.2}>
      <mesh>
        <icosahedronGeometry args={[1.6, 8]} />
        <MeshDistortMaterial
          color="#7C3AED"
          distort={REDUCED_MOTION ? 0.15 : 0.45}
          speed={REDUCED_MOTION ? 0 : 2}
          roughness={0.15}
          metalness={0.6}
          emissive="#06B6D4"
          emissiveIntensity={0.25}
        />
      </mesh>
    </Float>
  );
}

function MouseParallaxRig() {
  useFrame(({ camera, pointer }) => {
    camera.position.x += (pointer.x * 1.2 - camera.position.x) * 0.04;
    camera.position.y += (pointer.y * 0.8 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 3, 5]} intensity={1.2} color="#06B6D4" />
      <pointLight position={[-4, -2, 3]} intensity={1} color="#7C3AED" />
      <Suspense fallback={null}>
        <DistortedBlob />
        {!REDUCED_MOTION ? <Sparkles count={60} scale={6} size={2} speed={0.3} color="#A78BFA" /> : null}
      </Suspense>
      {!REDUCED_MOTION ? <MouseParallaxRig /> : null}
    </Canvas>
  );
}
