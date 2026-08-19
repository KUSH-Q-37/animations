"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import InViewCanvas from "@/components/InViewCanvas";

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
  "Redis",
  "Prisma",
  "Docker",
  "Vercel",
  "GitHub Actions",
  "Playwright",
  "Jest",
  "Three.js",
  "GSAP",
  "Framer Motion",
  "Vite",
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
  onHit: (id: number, point: THREE.Vector3) => void;
  onMiss: (id: number) => void;
}

// Where the "gun" sits — just in front of the fixed camera, bottom-center of
// the frame — every shot is fired from here.
const MUZZLE_POSITION = new THREE.Vector3(0, -2.6, 7.4);

const BULLET_SPEED = 70; // world units / second — how fast the round travels
const MIN_TRAVEL_TIME = 0.05;
const MAX_TRAVEL_TIME = 0.22;
const CORE_LIFETIME = 0.1; // bright impact pop (after arrival)
const RING_LIFETIME = 0.24; // expanding shockwave (after arrival, governs cleanup)

/**
 * A single shot: an actual bullet — a small glowing round with a short
 * motion streak — that flies from the muzzle to the impact point, then pops
 * into a spark + expanding shockwave on arrival. Purely visual — scoring and
 * removal of the target already happened the instant the shot fired.
 */
const Bullet = ({
  from,
  to,
  onDone,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  onDone: () => void;
}) => {
  const bulletRef = useRef<THREE.Mesh>(null);
  const streakRef = useRef<THREE.Mesh>(null);
  const streakMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const coreMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ringMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const elapsed = useRef(0);

  const { direction, quaternion, travelTime, streakLength } = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(to, from);
    const dist = Math.max(dir.length(), 0.001);
    const normDir = dir.clone().normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      normDir,
    );
    const tTime = THREE.MathUtils.clamp(dist / BULLET_SPEED, MIN_TRAVEL_TIME, MAX_TRAVEL_TIME);
    return {
      direction: normDir,
      quaternion: quat,
      travelTime: tTime,
      streakLength: Math.min(dist * 0.35, 1.1),
    };
  }, [from, to]);

  useFrame((_, delta) => {
    elapsed.current += delta;
    const t = elapsed.current;

    if (t < travelTime) {
      // --- in flight: a small round travelling from muzzle to target ---
      const travelT = t / travelTime;
      const pos = from.clone().lerp(to, travelT);

      if (bulletRef.current) {
        bulletRef.current.visible = true;
        bulletRef.current.position.copy(pos);
      }
      if (streakRef.current) {
        streakRef.current.visible = true;
        streakRef.current.position.copy(pos).addScaledVector(direction, -streakLength / 2);
        streakRef.current.quaternion.copy(quaternion);
      }
      return;
    }

    // --- impact: bullet lands, spark + shockwave take over ---
    if (bulletRef.current) bulletRef.current.visible = false;
    if (streakRef.current) streakRef.current.visible = false;

    const impactT = t - travelTime;

    const coreT = Math.min(impactT / CORE_LIFETIME, 1);
    if (coreRef.current) coreRef.current.scale.setScalar(1.6 - coreT * 1.4);
    if (coreMatRef.current) coreMatRef.current.opacity = 1 - coreT;

    const ringT = Math.min(impactT / RING_LIFETIME, 1);
    if (ringRef.current) ringRef.current.scale.setScalar(0.3 + ringT * 1.5);
    if (ringMatRef.current) ringMatRef.current.opacity = 1 - ringT;

    if (impactT >= RING_LIFETIME) onDone();
  });

  return (
    <group>
      {/* the bullet itself */}
      <mesh ref={bulletRef} visible={false}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial
          color={0xccffcc}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* short motion streak trailing the bullet */}
      <mesh ref={streakRef} visible={false}>
        <cylinderGeometry args={[0.035, 0.01, streakLength, 6]} />
        <meshBasicMaterial
          ref={streakMatRef}
          color={0x00ff33}
          transparent
          opacity={0.55}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* impact spark */}
      <mesh ref={coreRef} position={to}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial
          ref={coreMatRef}
          color={0xffffff}
          transparent
          opacity={1}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* impact shockwave */}
      <mesh ref={ringRef} position={to}>
        <ringGeometry args={[0.5, 0.62, 24]} />
        <meshBasicMaterial
          ref={ringMatRef}
          color={0x00ff33}
          transparent
          opacity={1}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

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
        onHit(id, e.point.clone());
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

interface BulletData {
  id: number;
  from: THREE.Vector3;
  to: THREE.Vector3;
}

const GameScene = ({
  setScore,
}: {
  setScore: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const [targets, setTargets] = useState<TargetData[]>([]);
  const [bullets, setBullets] = useState<BulletData[]>([]);

  // The camera's horizontal FOV depends on the canvas's aspect ratio. On a
  // wide desktop canvas that's generous; on a narrow mobile/portrait canvas
  // it's much tighter, so targets spawned at a fixed world-space X drift
  // off-screen before they're reachable. Track the live aspect in a ref
  // (read at spawn time) without restarting the spawn interval on resize.
  const { size } = useThree();
  const aspectRef = useRef(size.width / Math.max(size.height, 1));
  useEffect(() => {
    aspectRef.current = size.width / Math.max(size.height, 1);
  }, [size]);

  useEffect(() => {
    const spawnTarget = () => {
      setTargets((prev) => {
        if (prev.length > 5) return prev;

        const text =
          SKILLS_LIST[Math.floor(Math.random() * SKILLS_LIST.length)];

        // Reference distance roughly mid-flight, so targets stay inside the
        // visible frustum for most of their approach, not just at spawn.
        const REFERENCE_DISTANCE = 25;
        const VERTICAL_HALF_FOV = THREE.MathUtils.degToRad(25); // half of the 50° camera FOV
        const visibleHalfWidth =
          REFERENCE_DISTANCE * Math.tan(VERTICAL_HALF_FOV) * aspectRef.current;
        const xRange = Math.max(visibleHalfWidth * 0.85, 4);

        const x = (Math.random() - 0.5) * 2 * xRange;
        const y = (Math.random() - 0.2) * 15 + 2;
        const z = -90 - Math.random() * 20;

        return [...prev, { id: Math.random(), text, position: [x, y, z] }];
      });
    };

    const interval = setInterval(spawnTarget, 1200);
    return () => clearInterval(interval);
  }, []);

  const handleHit = (id: number, point: THREE.Vector3) => {
    setScore((s) => s + 1);
    setTargets((prev) => prev.filter((t) => t.id !== id));
    setBullets((prev) => [
      ...prev,
      { id: Math.random(), from: MUZZLE_POSITION.clone(), to: point },
    ]);
  };

  const handleMiss = (id: number) => {
    setTargets((prev) => prev.filter((t) => t.id !== id));
  };

  const handleBulletDone = (id: number) => {
    setBullets((prev) => prev.filter((b) => b.id !== id));
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
      {bullets.map((b) => (
        <Bullet
          key={b.id}
          from={b.from}
          to={b.to}
          onDone={() => handleBulletDone(b.id)}
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

        <InViewCanvas
          camera={{ position: [0, 0, 8], fov: 50 }}
          dpr={[1, 1.5]} // Caps pixel ratio to 1.5 (Massive performance boost)
          gl={{ antialias: false, powerPreference: "high-performance" }} // Optimized WebGL rendering
        >
          <GameScene setScore={setScore} />
        </InViewCanvas>
      </div>

      <div className="mt-4 text-center text-[10px] md:text-sm uppercase tracking-[0.3em] text-[#ffffff]">
        BREAK THE TARGETS!
      </div>
    </div>
  );
}
