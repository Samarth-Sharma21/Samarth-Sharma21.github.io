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
  shape,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    // Gentle floating motion
    meshRef.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.2;

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
  const secondaryColor = theme === 'dark' ? '#3182ce' : '#D32F2F';
  const accentColor = theme === 'dark' ? '#60A5FA' : '#2563EB';

  const objects = [
    {
      position: [-6, 2, -5],
      rotation: [0.5, 0.8, 0],
      color: primaryColor,
      speed: 0.5,
      size: 1.2,
      shape: 'cube' as const,
    },
    {
      position: [7, -1, -8],
      rotation: [0.2, 0.3, 0.5],
      color: secondaryColor,
      speed: 0.7,
      size: 1.5,
      shape: 'sphere' as const,
    },
    {
      position: [-2, 3, -6],
      rotation: [0.1, 1.2, 0.4],
      color: accentColor,
      speed: 0.3,
      size: 0.8,
      shape: 'tetrahedron' as const,
    },
    {
      position: [-8, -3, -10],
      rotation: [0.8, 0.3, 0.2],
      color: primaryColor,
      speed: 0.4,
      size: 1.3,
      shape: 'sphere' as const,
    },
    {
      position: [9, 4, -12],
      rotation: [0.3, 0.5, 0.2],
      color: secondaryColor,
      speed: 0.6,
      size: 1.0,
      shape: 'cube' as const,
    },
    {
      position: [3, -2, -7],
      rotation: [0.6, 0.1, 0.8],
      color: accentColor,
      speed: 0.8,
      size: 0.9,
      shape: 'tetrahedron' as const,
    },
    {
      position: [-4, 5, -9],
      rotation: [0.4, 0.7, 0.3],
      color: primaryColor,
      speed: 0.35,
      size: 1.1,
      shape: 'cube' as const,
    },
  ];

  return (
    <Canvas
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      camera={{ position: [0, 0, 10], fov: 75 }}
      dpr={[1, 2]}>
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={0.4} />
      <pointLight
        position={[-10, -10, -10]}
        intensity={0.3}
        color={primaryColor}
      />
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
