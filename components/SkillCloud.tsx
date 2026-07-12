"use client";

import { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

const SKILLS_LIST = [
  "Python",
  "Java",
  "JavaScript",
  "SQL",
  "React.js",
  "Node.js",
  "Express.js",
  "Flask",
  "MongoDB",
  "PostgreSQL",
  "NestJS",
  "Tailwind CSS",
  "TypeScript",
  "Git",
  "Next.js",
  "REST APIs",
  "Numpy",
  "Pandas",
  "Matplotlib",
  "Seaborn",
  "Scikit-learn",
  "Plotly",
  "Cufflinks",
];

interface TargetData {
  id: number;
  text: string;
  position: [number, number, number];
}

interface TargetProps {
  id: number;
  text: string;
  initialPosition: [number, number, number];
  onHit: (id: number) => void;
  onMiss: (id: number) => void;
}

const MovingGrid = () => {
  const gridRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (gridRef.current) {
      gridRef.current.position.z += delta * 15;
      if (gridRef.current.position.z > 10) {
        gridRef.current.position.z = 0;
      }
    }
  });

  return (
    <group ref={gridRef}>
      <gridHelper
        args={[200, 80, 0x00ff33, 0x00ff33]}
        position={[0, -4, -40]}
      />
    </group>
  );
};

const Target = ({ id, text, initialPosition, onHit, onMiss }: TargetProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta;
    const time = timeRef.current;
    meshRef.current.position.z += delta * 25;
    meshRef.current.rotation.y = Math.sin(time * 2 + id) * 0.1;
    meshRef.current.rotation.z = Math.cos(time * 2 + id) * 0.05;

    if (meshRef.current.position.z > 10) {
      onMiss(id);
    }
  });

  const boxWidth = text.length * 0.35 + 0.8;

  return (
    <mesh
      ref={meshRef}
      position={initialPosition}
      onPointerDown={(e) => {
        e.stopPropagation();
        onHit(id);
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[boxWidth, 1.2, 0.1]} />
      <meshBasicMaterial
        color={hovered ? 0xffffff : 0x00ff33}
        toneMapped={false}
      />
      <Text
        position={[0, 0, 0.06]}
        fontSize={0.5}
        color="#000000"
        anchorX="center"
        anchorY="middle"
        // Move toneMapped into the material prop
        material={new THREE.MeshBasicMaterial({ toneMapped: false })}
      >
        {text}
      </Text>
    </mesh>
  );
};

const GameScene = ({
  setScore,
}: {
  setScore: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const [targets, setTargets] = useState<TargetData[]>([]);

  useEffect(() => {
    const spawnTarget = () => {
      setTargets((prev) => {
        if (prev.length > 5) return prev;

        const text =
          SKILLS_LIST[Math.floor(Math.random() * SKILLS_LIST.length)];
        const x = (Math.random() - 0.5) * 50;
        const y = (Math.random() - 0.2) * 15 + 2;
        const z = -90 - Math.random() * 20;

        return [...prev, { id: Math.random(), text, position: [x, y, z] }];
      });
    };

    const interval = setInterval(spawnTarget, 1200);
    return () => clearInterval(interval);
  }, []);

  const handleHit = (id: number) => {
    setScore((s) => s + 1);
    setTargets((prev) => prev.filter((t) => t.id !== id));
  };

  const handleMiss = (id: number) => {
    setTargets((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      <fog attach="fog" args={["#000000", 30, 90]} />
      <MovingGrid />
      {targets.map((t) => (
        <Target
          key={t.id}
          id={t.id}
          text={t.text}
          initialPosition={t.position}
          onHit={handleHit}
          onMiss={handleMiss}
        />
      ))}
    </>
  );
};

export default function SkillCloud({
  onGameHover,
}: {
  onGameHover: (active: boolean) => void;
}) {
  const [score, setScore] = useState(0);
  const [flash, setFlash] = useState(false);

  const handleShoot = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 100);
  };

  return (
    <div
      className="w-full flex flex-col font-mono select-none mt-12"
      onMouseEnter={() => onGameHover(true)}
      onMouseLeave={() => onGameHover(false)}
    >
      <div className="flex justify-between items-end mb-3 px-1 text-[#ffffff] text-[10px] md:text-sm tracking-widest">
        <div>+ SKILLS & TECHNOLOGIES</div>
        <div>SCORE: {score}</div>
      </div>
      <div
        onClick={handleShoot}
        className="relative w-full h-[400px] bg-black border border-[#00ff33] cursor-crosshair overflow-hidden"
      >
        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/20 z-50 pointer-events-none"
            />
          )}
        </AnimatePresence>

        <Canvas
          camera={{ position: [0, 0, 8], fov: 50 }}
          dpr={[1, 1.5]} // Caps pixel ratio to 1.5 (Massive performance boost)
          gl={{ antialias: false, powerPreference: "high-performance" }} // Optimized WebGL rendering
        >
          <GameScene setScore={setScore} />
        </Canvas>
      </div>

      <div className="mt-4 text-center text-[10px] md:text-sm uppercase tracking-[0.3em] text-[#ffffff]">
        BREAK THE TARGETS!
      </div>
    </div>
  );
}
