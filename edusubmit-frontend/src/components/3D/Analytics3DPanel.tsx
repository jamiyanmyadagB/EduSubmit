import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface Analytics3DPanelProps {
  title: string;
  value: string;
  change: number;
  color: string;
  position?: [number, number, number];
}

function FloatingPanel({ title, value, change, color, position = [0, 0, 0] }: Analytics3DPanelProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = React.useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
    }
  });

  const panelColor = useMemo(() => {
    if (color === 'green') return '#10b981';
    if (color === 'blue') return '#3b82f6';
    if (color === 'purple') return '#8b5cf6';
    if (color === 'orange') return '#f97316';
    return '#6b7280';
  }, [color]);

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? [1.05, 1.05, 1.05] : [1, 1, 1]}
      >
        <boxGeometry args={[2, 1.5, 0.2]} />
        <meshStandardMaterial
          color={panelColor}
          transparent
          opacity={0.8}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Glass effect overlay */}
      <mesh position={[0, 0, 0.11]}>
        <boxGeometry args={[1.9, 1.4, 0.01]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.1}
          metalness={1}
          roughness={0}
        />
      </mesh>

      {/* Text content */}
      <Text
        position={[0, 0.3, 0.12]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        {title}
      </Text>
      
      <Text
        position={[0, 0, 0.12]}
        fontSize={0.25}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        {value}
      </Text>
      
      <Text
        position={[0, -0.3, 0.12]}
        fontSize={0.12}
        color={change > 0 ? '#10b981' : '#ef4444'}
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-regular.woff"
      >
        {change > 0 ? '+' : ''}{change}%
      </Text>

      {/* Floating particles */}
      {Array.from({ length: 5 }).map((_, i) => (
        <Sphere
          key={i}
          position={[
            (Math.random() - 0.5) * 3,
            position[1] + (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
          ]}
          args={[0.02, 16, 16]}
        >
          <meshStandardMaterial
            color={panelColor}
            emissive={panelColor}
            emissiveIntensity={0.5}
          />
        </Sphere>
      ))}
    </group>
  );
}

function AnimatedBackground() {
  const particlesRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.02;
    }
  });

  const particles = useMemo(() => {
    const positions = new Float32Array(300);
    for (let i = 0; i < 100; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return positions;
  }, []);

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(particles), 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#8b5cf6"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

export default function Analytics3DPanel() {
  return (
    <div className="w-full h-96 relative">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
        
        <AnimatedBackground />
        
        <FloatingPanel
          title="Total Students"
          value="1,234"
          change={12.5}
          color="blue"
          position={[-3, 1, 0]}
        />
        
        <FloatingPanel
          title="Assignments"
          value="456"
          change={8.3}
          color="green"
          position={[0, 1, 0]}
        />
        
        <FloatingPanel
          title="Submissions"
          value="789"
          change={-2.1}
          color="orange"
          position={[3, 1, 0]}
        />
        
        <FloatingPanel
          title="Avg Score"
          value="85.2%"
          change={5.7}
          color="purple"
          position={[-1.5, -1, 0]}
        />
        
        <FloatingPanel
          title="Completion Rate"
          value="92.8%"
          change={3.2}
          color="green"
          position={[1.5, -1, 0]}
        />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI * 0.8}
          minPolarAngle={Math.PI * 0.2}
        />
      </Canvas>
    </div>
  );
}
