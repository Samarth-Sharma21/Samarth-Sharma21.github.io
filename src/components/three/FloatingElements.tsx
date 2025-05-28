import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTheme } from '../../contexts/ThemeContext';

interface FloatingObjectProps {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  speed: number;
  size: number;
  shape: 'cube' | 'sphere' | 'tetrahedron';
}

const FloatingObject: React.FC<FloatingObjectProps> = ({ 
  position, 
  rotation, 
  color, 
  speed, 
  size,
  shape
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Gentle floating motion
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.2;
    
    // Slow rotation
    meshRef.current.rotation.x += 0.002 * speed;
    meshRef.current.rotation.y += 0.001 * speed;
  });

  const renderShape = () => {
    switch (shape) {
      case 'cube':
        return <boxGeometry args={[size, size, size]} />;
      case 'sphere':
        return <sphereGeometry args={[size * 0.6, 16, 16]} />;
      case 'tetrahedron':
        return <tetrahedronGeometry args={[size * 0.7, 0]} />;
      default:
        return <boxGeometry args={[size, size, size]} />;
    }
  };

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      {renderShape()}
      <meshStandardMaterial 
        color={color} 
        transparent 
        opacity={0.7}
        emissive={color}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
};

const FloatingElements: React.FC = () => {
  const { theme } = useTheme();
  
  const primaryColor = theme === 'dark' ? '#0563bb' : '#0563bb';
  const secondaryColor = theme === 'dark' ? '#D32F2F' : '#3182ce';
  
  const objects = [
    { position: [-8, 2, -5], rotation: [0.5, 0.8, 0], color: primaryColor, speed: 0.5, size: 1.5, shape: 'cube' as const },
    { position: [8, -2, -10], rotation: [0.2, 0.3, 0.5], color: secondaryColor, speed: 0.7, size: 2, shape: 'sphere' as const },
    { position: [0, 4, -8], rotation: [0.1, 1.2, 0.4], color: primaryColor, speed: 0.3, size: 1, shape: 'tetrahedron' as const },
    { position: [-10, -4, -12], rotation: [0.8, 0.3, 0.2], color: secondaryColor, speed: 0.4, size: 1.8, shape: 'sphere' as const },
    { position: [12, 6, -15], rotation: [0.3, 0.5, 0.2], color: primaryColor, speed: 0.6, size: 1.2, shape: 'cube' as const },
  ];

  return (
    <Canvas style={{ position: 'absolute', inset: 0 }}>
      <ambientLight intensity={0.1} />
      <directionalLight position={[10, 10, 5]} intensity={0.3} />
      {objects.map((obj, index) => (
        <FloatingObject
          key={index}
          position={obj.position}
          rotation={obj.rotation}
          color={obj.color}
          speed={obj.speed}
          size={obj.size}
          shape={obj.shape}
        />
      ))}
    </Canvas>
  );
};

export default FloatingElements;