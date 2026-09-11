"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import InViewCanvas from "@/components/InViewCanvas";

const SKILLS_LIST = [
  // Languages
  "TypeScript",
  "JavaScript",
  "Python",
  "Java",
  "SQL",

  // Frontend & Motion
  "React.js",
  "Next.js",
  "App Router",
  "Tailwind CSS",
  "GSAP",
  "Lenis",
  "WebGL",
  "Three.js",
  "Framer Motion",

  // Backend & Architecture
  "Node.js",
  "NestJS",
  "Express.js",
  "Flask",
  "BullMQ",
  "REST APIs",
  "Turborepo",

  // Databases & Cloud
  "PostgreSQL",
  "Redis",
  "MongoDB",
  "MySQL",
  "Prisma ORM",
  "Docker",
  "GitHub Actions",
  "Vercel",

  // AI & Semantic Search
  "Vector Embeddings",
  "pgvector",
  "HNSW Indexes",
  "Deep Learning",
  "LSTM",
  "Time-Series Forecasting",

  // Data Science & Testing
  "Pandas",
  "NumPy",
  "Scikit-learn",
  "Matplotlib",
  "Playwright",
  "E2E Testing",
  "Jest",
  "Figma",
];

/* =========================================================
   GAME SETTINGS
   ========================================================= */

const MAX_TARGETS = 5;

// Higher = fewer targets appearing
const SPAWN_INTERVAL = 1800;

// Slightly slower than the original 25
const TARGET_SPEED = 21;

// Distance where targets begin
const MIN_SPAWN_Z = -105;
const MAX_SPAWN_Z = -90;

// Prevent targets from spawning too close together
const MIN_TARGET_DISTANCE = 3.5;

/* =========================================================
   BULLET SETTINGS
   ========================================================= */

const MUZZLE_POSITION = new THREE.Vector3(0, -2.6, 7.4);

const BULLET_SPEED = 70;
const MIN_TRAVEL_TIME = 0.05;
const MAX_TRAVEL_TIME = 0.22;

const CORE_LIFETIME = 0.1;
const RING_LIFETIME = 0.24;

/* =========================================================
   TYPES
   ========================================================= */

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

interface BulletData {
  id: number;
  from: THREE.Vector3;
  to: THREE.Vector3;
}

/* =========================================================
   BULLET
   ========================================================= */

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

  const coreRef = useRef<THREE.Mesh>(null);
  const coreMatRef = useRef<THREE.MeshBasicMaterial>(null);

  const ringRef = useRef<THREE.Mesh>(null);
  const ringMatRef = useRef<THREE.MeshBasicMaterial>(null);

  const elapsed = useRef(0);

  // Prevent onDone from firing multiple times.
  const doneRef = useRef(false);

  const { direction, quaternion, travelTime, streakLength } = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(to, from);

    const dist = Math.max(dir.length(), 0.001);

    const normDir = dir.clone().normalize();

    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      normDir,
    );

    const tTime = THREE.MathUtils.clamp(
      dist / BULLET_SPEED,
      MIN_TRAVEL_TIME,
      MAX_TRAVEL_TIME,
    );

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

    /* ---------------------------------------------------------
       BULLET IN FLIGHT
       --------------------------------------------------------- */

    if (t < travelTime) {
      const travelT = t / travelTime;

      const pos = from.clone().lerp(to, travelT);

      if (bulletRef.current) {
        bulletRef.current.visible = true;
        bulletRef.current.position.copy(pos);
      }

      if (streakRef.current) {
        streakRef.current.visible = true;

        streakRef.current.position
          .copy(pos)
          .addScaledVector(direction, -streakLength / 2);

        streakRef.current.quaternion.copy(quaternion);
      }

      return;
    }

    /* ---------------------------------------------------------
       IMPACT
       --------------------------------------------------------- */

    if (bulletRef.current) {
      bulletRef.current.visible = false;
    }

    if (streakRef.current) {
      streakRef.current.visible = false;
    }

    // Make sure impact effects become visible only after arrival.
    if (coreRef.current) {
      coreRef.current.visible = true;
    }

    if (ringRef.current) {
      ringRef.current.visible = true;
    }

    const impactT = t - travelTime;

    /* ---------------------------------------------------------
       IMPACT CORE
       --------------------------------------------------------- */

    const coreT = Math.min(impactT / CORE_LIFETIME, 1);

    if (coreRef.current) {
      coreRef.current.scale.setScalar(
        1.6 - coreT * 1.4,
      );
    }

    if (coreMatRef.current) {
      coreMatRef.current.opacity = 1 - coreT;
    }

    /* ---------------------------------------------------------
       SHOCKWAVE
       --------------------------------------------------------- */

    const ringT = Math.min(impactT / RING_LIFETIME, 1);

    if (ringRef.current) {
      ringRef.current.scale.setScalar(
        0.3 + ringT * 1.5,
      );
    }

    if (ringMatRef.current) {
      ringMatRef.current.opacity = 1 - ringT;
    }

    /* ---------------------------------------------------------
       CLEANUP
       --------------------------------------------------------- */

    if (impactT >= RING_LIFETIME && !doneRef.current) {
      doneRef.current = true;
      onDone();
    }
  });

  return (
    <group>
      {/* =====================================================
          BULLET
          ===================================================== */}

      <mesh
        ref={bulletRef}
        visible={false}
      >
        <sphereGeometry args={[0.12, 8, 8]} />

        <meshBasicMaterial
          color={0xccffcc}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* =====================================================
          BULLET MOTION STREAK
          ===================================================== */}

      <mesh
        ref={streakRef}
        visible={false}
      >
        <cylinderGeometry
          args={[
            0.035,
            0.01,
            streakLength,
            6,
          ]}
        />

        <meshBasicMaterial
          color={0x00ff33}
          transparent
          opacity={0.55}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* =====================================================
          IMPACT CORE
          ===================================================== */}

      <mesh
        ref={coreRef}
        position={to}
        visible={false}
      >
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

      {/* =====================================================
          IMPACT SHOCKWAVE
          ===================================================== */}

      <mesh
        ref={ringRef}
        position={to}
        visible={false}
      >
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

/* =========================================================
   MOVING GRID
   ========================================================= */

const MovingGrid = () => {
  const gridRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!gridRef.current) return;

    gridRef.current.position.z += delta * 15;

    if (gridRef.current.position.z > 10) {
      gridRef.current.position.z = 0;
    }
  });

  return (
    <group ref={gridRef}>
      <gridHelper
        args={[
          200,
          80,
          0x00ff33,
          0x00ff33,
        ]}
        position={[0, -4, -40]}
      />
    </group>
  );
};

/* =========================================================
   TARGET
   ========================================================= */

const Target = ({
  id,
  text,
  initialPosition,
  onHit,
  onMiss,
}: TargetProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const [hovered, setHovered] = useState(false);

  const timeRef = useRef(0);

  // Prevent onMiss from firing every frame.
  const missedRef = useRef(false);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    timeRef.current += delta;

    const time = timeRef.current;

    /* ---------------------------------------------------------
       TARGET MOVEMENT
       --------------------------------------------------------- */

    meshRef.current.position.z +=
      delta * TARGET_SPEED;

    /* ---------------------------------------------------------
       SUBTLE TARGET ROTATION
       --------------------------------------------------------- */

    meshRef.current.rotation.y =
      Math.sin(time * 2 + id) * 0.1;

    meshRef.current.rotation.z =
      Math.cos(time * 2 + id) * 0.05;

    /* ---------------------------------------------------------
       TARGET MISSED
       --------------------------------------------------------- */

    if (
      meshRef.current.position.z > 10 &&
      !missedRef.current
    ) {
      missedRef.current = true;
      onMiss(id);
    }
  });

  /* ---------------------------------------------------------
     TARGET WIDTH
     --------------------------------------------------------- */

  const boxWidth =
    text.length * 0.35 + 0.8;

  return (
    <mesh
      ref={meshRef}
      position={initialPosition}
      onPointerDown={(e) => {
        e.stopPropagation();

        // Don't allow a target that has already missed
        // to be clicked.
        if (missedRef.current) return;

        onHit(
          id,
          e.point.clone(),
        );
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry
        args={[
          boxWidth,
          1.2,
          0.1,
        ]}
      />

      <meshBasicMaterial
        color={
          hovered
            ? 0xffffff
            : 0x00ff33
        }
        toneMapped={false}
      />

      <Text
        position={[
          0,
          0,
          0.06,
        ]}
        fontSize={0.5}
        color="#000000"
        anchorX="center"
        anchorY="middle"
      >
        {text}
      </Text>
    </mesh>
  );
};

/* =========================================================
   GAME SCENE
   ========================================================= */

const GameScene = ({
  setScore,
}: {
  setScore: React.Dispatch<
    React.SetStateAction<number>
  >;
}) => {
  const [targets, setTargets] = useState<
    TargetData[]
  >([]);

  const [bullets, setBullets] = useState<
    BulletData[]
  >([]);

  /* ---------------------------------------------------------
     CAMERA / ASPECT
     --------------------------------------------------------- */

  const { size } = useThree();

  const aspectRef = useRef(
    size.width /
      Math.max(size.height, 1),
  );

  useEffect(() => {
    aspectRef.current =
      size.width /
      Math.max(size.height, 1);
  }, [size]);

  /* ---------------------------------------------------------
     TARGET SPAWNER
     --------------------------------------------------------- */

  useEffect(() => {
    const spawnTarget = () => {
      setTargets((prev) => {
        /* ---------------------------------------------------
           MAX TARGET LIMIT
           --------------------------------------------------- */

        if (prev.length >= MAX_TARGETS) {
          return prev;
        }

        /* ---------------------------------------------------
           RANDOM SKILL
           --------------------------------------------------- */

        const text =
          SKILLS_LIST[
            Math.floor(
              Math.random() *
                SKILLS_LIST.length,
            )
          ];

        /* ---------------------------------------------------
           VISIBLE HORIZONTAL RANGE
           --------------------------------------------------- */

        const REFERENCE_DISTANCE = 25;

        const VERTICAL_HALF_FOV =
          THREE.MathUtils.degToRad(25);

        const visibleHalfWidth =
          REFERENCE_DISTANCE *
          Math.tan(
            VERTICAL_HALF_FOV,
          ) *
          aspectRef.current;

        const xRange =
          Math.max(
            visibleHalfWidth * 0.85,
            4,
          );

        /* ---------------------------------------------------
           GENERATE A POSITION

           Try several times to avoid spawning directly
           on top of an existing target.
           --------------------------------------------------- */

        let x = 0;
        let y = 0;
        let z = 0;

        let validPosition = false;

        for (
          let attempt = 0;
          attempt < 12;
          attempt++
        ) {
          x =
            (Math.random() - 0.5) *
            2 *
            xRange;

          y =
            (Math.random() - 0.2) *
              15 +
            2;

          z =
            MIN_SPAWN_Z +
            Math.random() *
              (MAX_SPAWN_Z -
                MIN_SPAWN_Z);

          validPosition = prev.every(
            (target) => {
              const dx =
                target.position[0] -
                x;

              const dy =
                target.position[1] -
                y;

              const dz =
                target.position[2] -
                z;

              const distance =
                Math.sqrt(
                  dx * dx +
                    dy * dy +
                    dz * dz,
                );

              return (
                distance >=
                MIN_TARGET_DISTANCE
              );
            },
          );

          if (validPosition) {
            break;
          }
        }

        /* ---------------------------------------------------
           ADD TARGET
           --------------------------------------------------- */

        return [
          ...prev,
          {
            id: Math.random(),
            text,
            position: [
              x,
              y,
              z,
            ],
          },
        ];
      });
    };

    /* -------------------------------------------------------
       SPAWN FIRST TARGET IMMEDIATELY

       Then use the slower interval.
       ------------------------------------------------------- */

    spawnTarget();

    const interval =
      setInterval(
        spawnTarget,
        SPAWN_INTERVAL,
      );

    return () =>
      clearInterval(interval);
  }, []);

  /* ---------------------------------------------------------
     HIT TARGET
     --------------------------------------------------------- */

  const handleHit = (
    id: number,
    point: THREE.Vector3,
  ) => {
    /* -------------------------------------------------------
       SCORE
       ------------------------------------------------------- */

    setScore(
      (score) => score + 1,
    );

    /* -------------------------------------------------------
       REMOVE TARGET
       ------------------------------------------------------- */

    setTargets(
      (prev) =>
        prev.filter(
          (target) =>
            target.id !== id,
        ),
    );

    /* -------------------------------------------------------
       CREATE BULLET
       ------------------------------------------------------- */

    setBullets(
      (prev) => [
        ...prev,
        {
          id: Math.random(),
          from:
            MUZZLE_POSITION.clone(),
          to: point,
        },
      ],
    );
  };

  /* ---------------------------------------------------------
     MISSED TARGET
     --------------------------------------------------------- */

  const handleMiss = (
    id: number,
  ) => {
    setTargets(
      (prev) =>
        prev.filter(
          (target) =>
            target.id !== id,
        ),
    );
  };

  /* ---------------------------------------------------------
     BULLET FINISHED
     --------------------------------------------------------- */

  const handleBulletDone = (
    id: number,
  ) => {
    setBullets(
      (prev) =>
        prev.filter(
          (bullet) =>
            bullet.id !== id,
        ),
    );
  };

  /* ---------------------------------------------------------
     SCENE
     --------------------------------------------------------- */

  return (
    <>
      <fog
        attach="fog"
        args={[
          "#000000",
          30,
          90,
        ]}
      />

      <MovingGrid />

      {/* ===================================================
          TARGETS
          =================================================== */}

      {targets.map((target) => (
        <Target
          key={target.id}
          id={target.id}
          text={target.text}
          initialPosition={
            target.position
          }
          onHit={handleHit}
          onMiss={handleMiss}
        />
      ))}

      {/* ===================================================
          BULLETS
          =================================================== */}

      {bullets.map((bullet) => (
        <Bullet
          key={bullet.id}
          from={bullet.from}
          to={bullet.to}
          onDone={() =>
            handleBulletDone(
              bullet.id,
            )
          }
        />
      ))}
    </>
  );
};

/* =========================================================
   SKILL CLOUD
   ========================================================= */

export default function SkillCloud({
  onGameHover,
}: {
  onGameHover: (
    active: boolean,
  ) => void;
}) {
  const [score, setScore] =
    useState(0);

  const [flash, setFlash] =
    useState(false);

  /* ---------------------------------------------------------
     FLASH TIMEOUT
     --------------------------------------------------------- */

  const flashTimeoutRef =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(null);

  /* ---------------------------------------------------------
     CLEANUP FLASH TIMEOUT
     --------------------------------------------------------- */

  useEffect(() => {
    return () => {
      if (
        flashTimeoutRef.current
      ) {
        clearTimeout(
          flashTimeoutRef.current,
        );
      }
    };
  }, []);

  /* ---------------------------------------------------------
     SHOOT FLASH
     --------------------------------------------------------- */

  const handleShoot = () => {
    setFlash(true);

    if (
      flashTimeoutRef.current
    ) {
      clearTimeout(
        flashTimeoutRef.current,
      );
    }

    flashTimeoutRef.current =
      setTimeout(() => {
        setFlash(false);
      }, 100);
  };

  return (
    <div
      className="
        w-full
        flex
        flex-col
        font-mono
        select-none
        mt-12
      "
      onMouseEnter={() =>
        onGameHover(true)
      }
      onMouseLeave={() =>
        onGameHover(false)
      }
    >
      {/* =====================================================
          HEADER
          ===================================================== */}

      <div
        className="
          flex
          justify-between
          items-end
          mb-3
          px-1
          text-[#ffffff]
          text-[10px]
          md:text-sm
          tracking-widest
        "
      >
        <div>
          + SKILLS & TECHNOLOGIES
        </div>

        <div>
          SCORE: {score}
        </div>
      </div>

      {/* =====================================================
          GAME WINDOW
          ===================================================== */}

      <div
        onClick={handleShoot}
        className="
          relative
          w-full
          h-[400px]
          bg-black
          border
          border-[#00ff33]
          cursor-crosshair
          overflow-hidden
        "
      >
        {/* ===================================================
            SHOOT FLASH
            =================================================== */}

        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{
                opacity: 0.8,
              }}
              animate={{
                opacity: 0,
              }}
              exit={{
                opacity: 0,
              }}
              className="
                absolute
                inset-0
                bg-white/20
                z-50
                pointer-events-none
              "
            />
          )}
        </AnimatePresence>

        {/* ===================================================
            THREE.JS CANVAS
            =================================================== */}

        <InViewCanvas
          camera={{
            position: [
              0,
              0,
              8,
            ],
            fov: 50,
          }}
          dpr={[1, 1.5]}
          gl={{
            antialias: false,
            powerPreference:
              "high-performance",
          }}
        >
          <GameScene
            setScore={setScore}
          />
        </InViewCanvas>
      </div>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <div
        className="
          mt-4
          text-center
          text-[10px]
          md:text-sm
          uppercase
          tracking-[0.3em]
          text-[#ffffff]
        "
      >
        BREAK THE TARGETS!
      </div>
    </div>
  );
}
