import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTheme } from '../../contexts/ThemeContext';
import * as THREE from 'three';

interface FloatingLogoProps {
  position: [number, number, number];
  rotation: [number, number, number];
  speed: number;
  size: number;
  imageUrl: string;
  phase: number;
}

const degToRad = (deg: number) => (deg * Math.PI) / 180;

const distance = (a: [number, number, number], b: [number, number, number]) => {
  return Math.sqrt(
    Math.pow(a[0] - b[0], 2) +
      Math.pow(a[1] - b[1], 2) +
      Math.pow(a[2] - b[2], 2)
  );
};

const generateNonOverlappingPosition = (
  existingPositions: [number, number, number][],
  ranges: {
    horizontalRange: number;
    verticalRange: number;
    depthRange: number;
  },
  minDistance: number,
  maxAttempts = 100
): [number, number, number] => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const pos: [number, number, number] = [
      (Math.random() * 2 - 1) * ranges.horizontalRange,
      (Math.random() * 2 - 1) * ranges.verticalRange,
      -(Math.random() * ranges.depthRange),
    ];
    const isFarEnough = existingPositions.every(
      (p) => distance(p, pos) >= minDistance
    );
    if (isFarEnough) return pos;
  }
  // Fallback to origin if all attempts fail
  return [0, 0, 0];
};

const FloatingLogo: React.FC<FloatingLogoProps> = ({
  position,
  rotation,
  speed,
  size,
  imageUrl,
  phase,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useMemo(
    () => new THREE.TextureLoader().load(imageUrl),
    [imageUrl]
  );

  const rotXRef = useRef(rotation[0]);
  const rotYRef = useRef(rotation[1]);
  const rotZRef = useRef(rotation[2]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const floatAmplitude = 1.5;
    meshRef.current.position.y =
      position[1] +
      Math.sin(state.clock.elapsedTime * speed + phase) * floatAmplitude;
    meshRef.current.position.x =
      position[0] +
      Math.sin(state.clock.elapsedTime * speed * 0.7 + phase * 1.3) *
        (floatAmplitude * 0.6);
    meshRef.current.position.z =
      position[2] +
      Math.cos(state.clock.elapsedTime * speed * 0.9 + phase * 0.7) *
        (floatAmplitude * 0.4);

    meshRef.current.rotation.x =
      rotXRef.current +
      Math.sin(state.clock.elapsedTime * speed + phase) * degToRad(20);
    meshRef.current.rotation.y =
      rotYRef.current +
      Math.sin(state.clock.elapsedTime * speed + phase * 1.5) * degToRad(30);
    meshRef.current.rotation.z =
      rotZRef.current +
      Math.sin(state.clock.elapsedTime * speed + phase * 0.5) * degToRad(15);
  });

  return (
    <mesh ref={meshRef} castShadow>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.4}
        toneMapped={false}
      />
    </mesh>
  );
};

interface FloatingElementsProps {
  marginTop?: number; // Optional margin from the top in pixels
}

const FloatingElements: React.FC<FloatingElementsProps> = ({
  marginTop = 0,
}) => {
  const { theme } = useTheme();
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width < 768;
  const heroHeight = windowSize.height;

  const cameraPosition: [number, number, number] = isMobile
    ? [0, 0, 80]
    : [0, 0, 120];
  const cameraFov = isMobile ? 80 : 60;

  const logosData = [
    'python',
    'java',
    'javascript',
    'typescript',
    'nodejs',
    'react',
    'nextjs',
    'mysql',
    'mongodb',
    'postgresql',
    'github',
    'git',
    'docker',
    'kubernetes',
    'jenkins',
    'prometheus',
    'grafana',
    'elasticsearch', // for Kibana
    'ansible',
    'terraform',
    'amazonwebservices',
    'azure',
    'googlecloud',
  ].map((name) => ({
    imageUrl: `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${name}/${name}-original.svg`,
    rotation: [Math.random() * 0.5, Math.random() * 0.5, Math.random() * 0.5] as [number, number, number],
    speed: 0.3 + Math.random() * 0.4,
  }));
  const logosWithPosition = useMemo(() => {
    const placedPositions: [number, number, number][] = [];
    const spreadFactor = isMobile ? 0.8 : 1;
    const verticalRange = (heroHeight - marginTop) * 0.1 * spreadFactor;
    const horizontalRange = windowSize.width * 0.1 * spreadFactor;
    const depthRange = 30 * spreadFactor;

    const minDistance = 12; // adjust spacing as needed

    return logosData.map((logo) => {
      const position = generateNonOverlappingPosition(
        placedPositions,
        { verticalRange, horizontalRange, depthRange },
        minDistance
      );
      placedPositions.push(position);
      return {
        ...logo,
        position,
        size: isMobile ? 8 : 10,
        phase: Math.random() * Math.PI * 2,
      };
    });
  }, [isMobile, windowSize.width, heroHeight, marginTop, logosData]);

  return (
    <Canvas
      style={{
        position: 'absolute',
        top: marginTop,
        left: 0,
        width: '100%',
        height: `${heroHeight - marginTop}px`,
        background: theme === 'dark' ? '#0b0b0b' : '#ffffff',
        touchAction: 'none',
      }}
      camera={{ position: cameraPosition, fov: cameraFov }}
      dpr={[1, 2]}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 5]} intensity={0.6} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color='#0563bb' />
      {logosWithPosition.map((logo, index) => (
        <FloatingLogo key={index} {...logo} />
      ))}
    </Canvas>
  );
};

export default FloatingElements;
