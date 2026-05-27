import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

function FloatingCube({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} transparent opacity={0.6} />
      </mesh>
    </Float>
  );
}

function FloatingSphere({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.cos(state.clock.elapsedTime * 0.5) * 0.5;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1.5}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color={color} transparent opacity={0.5} />
      </mesh>
    </Float>
  );
}

export default function AnimatedBackground() {
  const shapes = useMemo(() => [
    { position: [-4, 2, -2] as [number, number, number], color: '#3b82f6', type: 'cube' },
    { position: [3, -1, -3] as [number, number, number], color: '#8b5cf6', type: 'sphere' },
    { position: [-2, -2, -1] as [number, number, number], color: '#06b6d4', type: 'cube' },
    { position: [4, 3, -2] as [number, number, number], color: '#f59e0b', type: 'sphere' },
    { position: [0, 1, -4] as [number, number, number], color: '#10b981', type: 'cube' },
  ], []);

  return (
    <div className="fixed inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {shapes.map((shape, index) => (
          shape.type === 'cube' ? (
            <FloatingCube key={index} position={shape.position} color={shape.color} />
          ) : (
            <FloatingSphere key={index} position={shape.position} color={shape.color} />
          )
        ))}
        
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  );
}
