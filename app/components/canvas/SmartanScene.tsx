"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Float, Stars } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function AnimatedSphere() {
  const sphereRef = useRef<any>(null);
  const materialRef = useRef<any>(null);
  const { viewport } = useThree();

  useFrame((state) => {
    const { clock, pointer } = state;
    
    if (sphereRef.current) {
      // 1. Follow Mouse with slight delay (Lerp)
      const targetX = (pointer.x * viewport.width) / 2.5;
      const targetY = (pointer.y * viewport.height) / 2.5;
      
      sphereRef.current.position.x = THREE.MathUtils.lerp(sphereRef.current.position.x, targetX, 0.05);
      sphereRef.current.position.y = THREE.MathUtils.lerp(sphereRef.current.position.y, targetY, 0.05);

      // 2. STRESS LOGIC: Increase distortion based on mouse speed/distance
      const dist = Math.sqrt(Math.pow(pointer.x, 2) + Math.pow(pointer.y, 2));
      materialRef.current.distort = THREE.MathUtils.lerp(materialRef.current.distort, 0.4 + dist * 0.2, 0.1);
      materialRef.current.speed = THREE.MathUtils.lerp(materialRef.current.speed, 2 + dist * 3, 0.1);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <Sphere ref={sphereRef} args={[1, 100, 100]} scale={2}>
        <MeshDistortMaterial
          ref={materialRef}
          color="#000000" // Set to black as requested
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.1}
          metalness={1}
        />
      </Sphere>
    </Float>
  );
}

export default function SmartanScene() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#08263f]">
      <Canvas camera={{ position: [0, 0, 5] }} dpr={[1, 2]}>
        <ambientLight intensity={0.4} />
        {/* Rim Light for the "Black Pearl" look */}
        <pointLight position={[10, 10, 10]} intensity={2} color="#f7961d" />
        <pointLight position={[-10, -10, -10]} intensity={1.5} color="#0076c6" />
        <Stars radius={100} depth={50} count={4000} factor={6} saturation={0} fade speed={1.5} />
        <AnimatedSphere />
      </Canvas>
    </div>
  );
}