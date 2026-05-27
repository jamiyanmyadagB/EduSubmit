import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import * as THREE from 'three';

interface AssignmentCard3DProps {
  title: string;
  description: string;
  deadline: string;
  progress: number;
  status: 'pending' | 'submitted' | 'graded';
  onClick?: () => void;
}

function Card3D({ title, description, progress, status }: { title: string; description: string; progress: number; status: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  const statusColors = {
    pending: '#f59e0b',
    submitted: '#3b82f6',
    graded: '#10b981',
  };

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <boxGeometry args={[3, 4, 0.5]} />
        <meshStandardMaterial 
          color={statusColors[status as keyof typeof statusColors]} 
          transparent 
          opacity={0.8}
          metalness={0.3}
          roughness={0.4}
        />
        
        <Text
          position={[0, 1.5, 0.26]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.5}
        >
          {title}
        </Text>
        
        <Text
          position={[0, 0.5, 0.26]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.5}
        >
          {description}
        </Text>
        
        <Text
          position={[0, -0.5, 0.26]}
          fontSize={0.12}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Progress: {progress}%
        </Text>
      </mesh>
    </Float>
  );
}

export default function AssignmentCard3D({ title, description, deadline, progress, status, onClick }: AssignmentCard3DProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className="h-64 cursor-pointer"
    >
      <div className="h-full glass-morphism p-4 rounded-xl">
        <div className="h-48">
          <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Card3D title={title} description={description} progress={progress} status={status} />
          </Canvas>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-white">Deadline</span>
            <span className="text-xs text-gray-300">{deadline}</span>
          </div>
          
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className={`h-2 rounded-full ${
                status === 'graded' ? 'bg-green-500' : 
                status === 'submitted' ? 'bg-blue-500' : 'bg-yellow-500'
              }`}
            />
          </div>
          
          <div className="mt-2 text-center">
            <span className={`text-xs px-2 py-1 rounded-full ${
              status === 'graded' ? 'bg-green-500/20 text-green-300' : 
              status === 'submitted' ? 'bg-blue-500/20 text-blue-300' : 'bg-yellow-500/20 text-yellow-300'
            }`}>
              {status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
