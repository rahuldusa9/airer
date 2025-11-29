'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';

let Canvas, useFrame;

if (typeof window !== 'undefined') {
  const fiber = require('@react-three/fiber');
  Canvas = fiber.Canvas;
  useFrame = fiber.useFrame;
}

function ParticleField() {
  const pointsRef = useRef();
  
  const [positions, colors] = useMemo(() => {
    const positions = [];
    const colors = [];
    const colorPalette = [
      new THREE.Color('#00f3ff'),
      new THREE.Color('#bf00ff'),
      new THREE.Color('#ff006e'),
      new THREE.Color('#39ff14'),
    ];

    for (let i = 0; i < 2000; i++) {
      const x = (Math.random() - 0.5) * 50;
      const y = (Math.random() - 0.5) * 50;
      const z = (Math.random() - 0.5) * 50;
      positions.push(x, y, z);

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors.push(color.r, color.g, color.b);
    }

    return [new Float32Array(positions), new Float32Array(colors)];
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current && useFrame) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.02;
      pointsRef.current.rotation.x = clock.getElapsedTime() * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

export default function ParticleBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof window === 'undefined' || !Canvas) {
    return <div className="fixed inset-0 -z-10 bg-black" />;
  }

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 15], fov: 75 }}>
        <ParticleField />
      </Canvas>
    </div>
  );
}
