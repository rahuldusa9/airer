'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';

let Canvas, useFrame, Sphere, MeshDistortMaterial;

if (typeof window !== 'undefined') {
  const fiber = require('@react-three/fiber');
  const drei = require('@react-three/drei');
  Canvas = fiber.Canvas;
  useFrame = fiber.useFrame;
  Sphere = drei.Sphere;
  MeshDistortMaterial = drei.MeshDistortMaterial;
}

function AnimatedSphere({ character }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.getElapsedTime() * 0.3;
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.2;
    }
  });

  const colors = {
    'neon-blue': '#00f3ff',
    'neon-purple': '#bf00ff',
    'neon-pink': '#ff006e',
    'neon-green': '#39ff14',
  };

  const colorKeys = Object.keys(colors);
  const randomColor = colors[colorKeys[Math.floor(Math.random() * colorKeys.length)]];

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]} scale={2}>
      <MeshDistortMaterial
        color={randomColor}
        attach="material"
        distort={0.5}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
}

function Particles() {
  const particlesRef = useRef();
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20;
      temp.push(x, y, z);
    }
    return new Float32Array(temp);
  }, []);

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#00f3ff" transparent opacity={0.6} />
    </points>
  );
}

export default function AvatarSphere({ character }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof window === 'undefined' || !Canvas) {
    return <div className="w-full h-full bg-black/50 rounded-lg" />;
  }

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#bf00ff" />
        <AnimatedSphere character={character} />
        <Particles />
      </Canvas>
    </div>
  );
}
