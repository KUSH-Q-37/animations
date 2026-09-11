"use client";

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";

import {
  useFrame,
  useThree,
} from "@react-three/fiber";

import { Text } from "@react-three/drei";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import * as THREE from "three";

import InViewCanvas from "@/components/InViewCanvas";

/* =========================================================
   SKILLS
   ========================================================= */

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

const MAX_TARGETS = 4;

const SPAWN_INTERVAL = 2000;

const TARGET_SPEED = 18;

const MIN_TARGET_DISTANCE = 7;

const MIN_SPAWN_Z = -105;
const MAX_SPAWN_Z = -92;

/* =========================================================
   BULLET SETTINGS
   ========================================================= */

const MUZZLE_POSITION = new THREE.Vector3(
  0,
  -2.6,
  7.4,
);

const BULLET_SPEED = 70;

const MIN_TRAVEL_TIME = 0.05;
const MAX_TRAVEL_TIME = 0.22;

const CORE_LIFETIME = 0.1;
const RING_LIFETIME = 0.24;

/* =========================================================
   GRID SETTINGS
   ========================================================= */

const GRID_COUNT = 5;

const GRID_SPACING = 40;

const GRID_SPEED = 15;

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

  initialPosition: [
    number,
    number,
    number,
  ];

  onHit: (
    id: number,
    point: THREE.Vector3,
  ) => void;

  onMiss: (
    id: number,
  ) => void;
}

interface BulletData {
  id: number;
  from: THREE.Vector3;
  to: THREE.Vector3;
}

/* =========================================================
   SHUFFLE
   ========================================================= */

const shuffleArray = <T,>(
  array: T[],
): T[] => {
  const result = [...array];

  for (
    let i = result.length - 1;
    i > 0;
    i--
  ) {
    const j = Math.floor(
      Math.random() * (i + 1),
    );

    const temp = result[i];

    result[i] = result[j];
    result[j] = temp;
  }

  return result;
};

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
  const bulletRef =
    useRef<THREE.Mesh>(null);

  const streakRef =
    useRef<THREE.Mesh>(null);

  const coreRef =
    useRef<THREE.Mesh>(null);

  const coreMatRef =
    useRef<THREE.MeshBasicMaterial>(null);

  const ringRef =
    useRef<THREE.Mesh>(null);

  const ringMatRef =
    useRef<THREE.MeshBasicMaterial>(null);

  const elapsed =
    useRef(0);

  const doneRef =
    useRef(false);

  const {
    direction,
    quaternion,
    travelTime,
    streakLength,
  } = useMemo(() => {
    const dir =
      new THREE.Vector3().subVectors(
        to,
        from,
      );

    const distance =
      Math.max(
        dir.length(),
        0.001,
      );

    const normalizedDirection =
      dir.clone().normalize();

    const quat =
      new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        normalizedDirection,
      );

    const calculatedTravelTime =
      THREE.MathUtils.clamp(
        distance / BULLET_SPEED,
        MIN_TRAVEL_TIME,
        MAX_TRAVEL_TIME,
      );

    return {
      direction:
        normalizedDirection,

      quaternion:
        quat,

      travelTime:
        calculatedTravelTime,

      streakLength:
        Math.min(
          distance * 0.35,
          1.1,
        ),
    };
  }, [from, to]);

  useFrame((_, delta) => {
    elapsed.current += delta;

    const time =
      elapsed.current;

    /* =======================================================
       FLIGHT
       ======================================================= */

    if (
      time < travelTime
    ) {
      const travelT =
        time / travelTime;

      const position =
        from
          .clone()
          .lerp(
            to,
            travelT,
          );

      if (
        bulletRef.current
      ) {
        bulletRef.current.visible =
          true;

        bulletRef.current.position.copy(
          position,
        );
      }

      if (
        streakRef.current
      ) {
        streakRef.current.visible =
          true;

        streakRef.current.position
          .copy(position)
          .addScaledVector(
            direction,
            -streakLength / 2,
          );

        streakRef.current.quaternion.copy(
          quaternion,
        );
      }

      return;
    }

    /* =======================================================
       IMPACT
       ======================================================= */

    if (
      bulletRef.current
    ) {
      bulletRef.current.visible =
        false;
    }

    if (
      streakRef.current
    ) {
      streakRef.current.visible =
        false;
    }

    if (
      coreRef.current
    ) {
      coreRef.current.visible =
        true;
    }

    if (
      ringRef.current
    ) {
      ringRef.current.visible =
        true;
    }

    const impactTime =
      time - travelTime;

    /* =======================================================
       CORE
       ======================================================= */

    const coreT =
      Math.min(
        impactTime /
          CORE_LIFETIME,
        1,
      );

    if (
      coreRef.current
    ) {
      coreRef.current.scale.setScalar(
        1.6 -
          coreT * 1.4,
      );
    }

    if (
      coreMatRef.current
    ) {
      coreMatRef.current.opacity =
        1 - coreT;
    }

    /* =======================================================
       RING
       ======================================================= */

    const ringT =
      Math.min(
        impactTime /
          RING_LIFETIME,
        1,
      );

    if (
      ringRef.current
    ) {
      ringRef.current.scale.setScalar(
        0.3 +
          ringT * 1.5,
      );
    }

    if (
      ringMatRef.current
    ) {
      ringMatRef.current.opacity =
        1 - ringT;
    }

    /* =======================================================
       CLEANUP
       ======================================================= */

    if (
      impactTime >=
        RING_LIFETIME &&
      !doneRef.current
    ) {
      doneRef.current = true;

      onDone();
    }
  });

  return (
    <group>
      {/* BULLET */}

      <mesh
        ref={bulletRef}
        visible={false}
      >
        <sphereGeometry
          args={[0.12, 8, 8]}
        />

        <meshBasicMaterial
          color={0xccffcc}
          toneMapped={false}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
        />
      </mesh>

      {/* STREAK */}

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
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
        />
      </mesh>

      {/* IMPACT CORE */}

      <mesh
        ref={coreRef}
        position={to}
        visible={false}
      >
        <sphereGeometry
          args={[0.15, 8, 8]}
        />

        <meshBasicMaterial
          ref={coreMatRef}
          color={0xffffff}
          transparent
          opacity={1}
          toneMapped={false}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
        />
      </mesh>

      {/* SHOCKWAVE */}

      <mesh
        ref={ringRef}
        position={to}
        visible={false}
      >
        <ringGeometry
          args={[
            0.5,
            0.62,
            24,
          ]}
        />

        <meshBasicMaterial
          ref={ringMatRef}
          color={0x00ff33}
          transparent
          opacity={1}
          toneMapped={false}
          blending={
            THREE.AdditiveBlending
          }
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

const MovingGrid = ({
  gameOver,
}: {
  gameOver: boolean;
}) => {
  const gridRefs =
    useRef<
      Array<THREE.Group | null>
    >([]);

  useFrame((_, delta) => {
    if (gameOver) {
      return;
    }

    for (
      let i = 0;
      i < gridRefs.current.length;
      i++
    ) {
      const grid =
        gridRefs.current[i];

      if (!grid) {
        continue;
      }

      grid.position.z +=
        delta * GRID_SPEED;

      /*
       * Once a grid passes the camera,
       * move it to the back of the tunnel.
       *
       * This means we NEVER allow the grid
       * to drift infinitely.
       */

      if (
        grid.position.z >
        GRID_SPACING
      ) {
        grid.position.z -=
          GRID_COUNT *
          GRID_SPACING;
      }
    }
  });

  return (
    <group>
      {Array.from({
        length: GRID_COUNT,
      }).map((_, index) => (
        <group
          key={index}
          ref={(node) => {
            gridRefs.current[index] =
              node;
          }}
          position={[
            0,
            0,
            -GRID_SPACING * index,
          ]}
        >
          <gridHelper
            args={[
              200,
              80,
              0x00ff33,
              0x00ff33,
            ]}
            position={[
              0,
              -4,
              0,
            ]}
          />
        </group>
      ))}
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
  const meshRef =
    useRef<THREE.Mesh>(null);

  const [hovered, setHovered] =
    useState(false);

  const timeRef =
    useRef(0);

  const missedRef =
    useRef(false);

  const hitRef =
    useRef(false);

  useFrame((_, delta) => {
    if (
      !meshRef.current
    ) {
      return;
    }

    timeRef.current +=
      delta;

    const time =
      timeRef.current;

    /* MOVEMENT */

    meshRef.current.position.z +=
      delta * TARGET_SPEED;

    /* ROTATION */

    meshRef.current.rotation.y =
      Math.sin(
        time * 1.5 + id,
      ) * 0.045;

    meshRef.current.rotation.z =
      Math.cos(
        time * 1.5 + id,
      ) * 0.025;

    /* MISS */

    if (
      meshRef.current.position.z >
        10 &&
      !missedRef.current &&
      !hitRef.current
    ) {
      missedRef.current =
        true;

      onMiss(id);
    }
  });

  const boxWidth =
    THREE.MathUtils.clamp(
      text.length * 0.32 + 1.1,
      3.2,
      8.5,
    );

  const fontSize =
    text.length > 20
      ? 0.32
      : text.length > 15
        ? 0.37
        : text.length > 10
          ? 0.43
          : 0.5;

  return (
    <mesh
      ref={meshRef}
      position={initialPosition}
      onPointerDown={(event) => {
        event.stopPropagation();

        if (
          missedRef.current ||
          hitRef.current
        ) {
          return;
        }

        hitRef.current =
          true;

        onHit(
          id,
          event.point.clone(),
        );
      }}
      onPointerOver={() =>
        setHovered(true)
      }
      onPointerOut={() =>
        setHovered(false)
      }
    >
      <boxGeometry
        args={[
          boxWidth,
          1.35,
          0.14,
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
          0.08,
        ]}
        fontSize={fontSize}
        color="#000000"
        anchorX="center"
        anchorY="middle"
        maxWidth={
          boxWidth - 0.45
        }
        textAlign="center"
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
  onGameOver,
  gameKey,
  gameOver,
  onSkillHit,
  onSkillMiss,
}: {
  setScore: React.Dispatch<
    React.SetStateAction<number>
  >;

  onGameOver: () => void;

  gameKey: number;

  gameOver: boolean;

  onSkillHit: (
    skill: string,
  ) => void;

  onSkillMiss: (
    skill: string,
  ) => void;
}) => {
  const [targets, setTargets] =
    useState<TargetData[]>([]);

  const [bullets, setBullets] =
    useState<BulletData[]>([]);

  /* =======================================================
     IDS
     ======================================================= */

  const nextTargetId =
    useRef(1);

  const nextBulletId =
    useRef(1);

  /* =======================================================
     SKILL QUEUE
     ======================================================= */

  const skillQueueRef =
    useRef<string[]>([]);

  /* =======================================================
     TARGETS REF
     
     Keeps callbacks from depending on
     stale React state.
     ======================================================= */

  const targetsRef =
    useRef<TargetData[]>([]);

  useEffect(() => {
    targetsRef.current =
      targets;
  }, [targets]);

  /* =======================================================
     RESET GAME
     ======================================================= */

  useEffect(() => {
    const shuffled =
      shuffleArray(
        SKILLS_LIST,
      );

    skillQueueRef.current =
      shuffled;

    nextTargetId.current =
      1;

    nextBulletId.current =
      1;

    targetsRef.current =
      [];

    setTargets([]);

    setBullets([]);
  }, [gameKey]);

  /* =======================================================
     CAMERA
     ======================================================= */

  const { size } =
    useThree();

  const aspectRef =
    useRef(
      size.width /
        Math.max(
          size.height,
          1,
        ),
    );

  useEffect(() => {
    aspectRef.current =
      size.width /
      Math.max(
        size.height,
        1,
      );
  }, [size]);

  /* =======================================================
     GAME OVER GUARD
     ======================================================= */

  const gameOverTriggeredRef =
    useRef(false);

  useEffect(() => {
    if (!gameOver) {
      gameOverTriggeredRef.current =
        false;
    }
  }, [gameOver]);

  /* =======================================================
     CHECK COMPLETION
     ======================================================= */

  const checkGameComplete =
    useCallback(
      (
        remainingTargets: TargetData[],
      ) => {
        const queueEmpty =
          skillQueueRef.current
            .length === 0;

        const targetsEmpty =
          remainingTargets.length ===
          0;

        if (
          queueEmpty &&
          targetsEmpty &&
          !gameOverTriggeredRef.current
        ) {
          gameOverTriggeredRef.current =
            true;

          window.setTimeout(() => {
            onGameOver();
          }, 300);
        }
      },
      [onGameOver],
    );

  /* =======================================================
     SPAWN TARGET
     
     IMPORTANT:
     
     The queue is modified OUTSIDE the
     React setState updater.
     
     This prevents React Strict Mode from
     consuming skills twice.
     ======================================================= */

  const spawnTarget =
    useCallback(() => {
      if (gameOver) {
        return;
      }

      if (
        targetsRef.current.length >=
        MAX_TARGETS
      ) {
        return;
      }

      if (
        skillQueueRef.current
          .length === 0
      ) {
        checkGameComplete(
          targetsRef.current,
        );

        return;
      }

      /* -----------------------------------------------
         TAKE EXACTLY ONE SKILL
         ----------------------------------------------- */

      const text =
        skillQueueRef.current.shift();

      if (!text) {
        return;
      }

      /* -----------------------------------------------
         VISIBLE WIDTH
         ----------------------------------------------- */

      const REFERENCE_DISTANCE =
        25;

      const HALF_FOV =
        THREE.MathUtils.degToRad(
          25,
        );

      const visibleHalfWidth =
        REFERENCE_DISTANCE *
        Math.tan(HALF_FOV) *
        aspectRef.current;

      const xRange =
        Math.max(
          visibleHalfWidth * 0.72,
          4,
        );

      /* -----------------------------------------------
         POSITION
         ----------------------------------------------- */

      let x = 0;
      let y = 0;
      let z = 0;

      let validPosition =
        false;

      const currentTargets =
        targetsRef.current;

      for (
        let attempt = 0;
        attempt < 50;
        attempt++
      ) {
        x =
          (Math.random() - 0.5) *
          2 *
          xRange;

        y =
          THREE.MathUtils.lerp(
            -0.5,
            7,
            Math.random(),
          );

        z =
          MIN_SPAWN_Z +
          Math.random() *
            (
              MAX_SPAWN_Z -
              MIN_SPAWN_Z
            );

        validPosition =
          currentTargets.every(
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

        if (
          validPosition
        ) {
          break;
        }
      }

      const newTarget: TargetData =
        {
          id:
            nextTargetId.current++,

          text,

          position: [
            x,
            y,
            z,
          ],
        };

      /* -----------------------------------------------
         UPDATE REF FIRST
         ----------------------------------------------- */

      const nextTargets = [
        ...targetsRef.current,
        newTarget,
      ];

      targetsRef.current =
        nextTargets;

      /* -----------------------------------------------
         THEN UPDATE REACT STATE
         ----------------------------------------------- */

      setTargets(
        nextTargets,
      );
    }, [
      gameOver,
      checkGameComplete,
    ]);

  /* =======================================================
     SPAWN LOOP
     ======================================================= */

  useEffect(() => {
    if (gameOver) {
      return;
    }

    const firstSpawn =
      window.setTimeout(() => {
        spawnTarget();
      }, 700);

    const interval =
      window.setInterval(() => {
        spawnTarget();
      }, SPAWN_INTERVAL);

    return () => {
      window.clearTimeout(
        firstSpawn,
      );

      window.clearInterval(
        interval,
      );
    };
  }, [
    spawnTarget,
    gameKey,
    gameOver,
  ]);

  /* =======================================================
     HIT
     ======================================================= */

  const handleHit =
    useCallback(
      (
        id: number,
        point: THREE.Vector3,
      ) => {
        const target =
          targetsRef.current.find(
            (item) =>
              item.id === id,
          );

        if (!target) {
          return;
        }

        /* -----------------------------------------------
           RECORD
           ----------------------------------------------- */

        onSkillHit(
          target.text,
        );

        /* -----------------------------------------------
           SCORE
           ----------------------------------------------- */

        setScore(
          (previous) =>
            previous + 1,
        );

        /* -----------------------------------------------
           REMOVE TARGET
           ----------------------------------------------- */

        const remainingTargets =
          targetsRef.current.filter(
            (item) =>
              item.id !== id,
          );

        targetsRef.current =
          remainingTargets;

        setTargets(
          remainingTargets,
        );

        /* -----------------------------------------------
           BULLET
           
           Numeric ID guaranteed.
           ----------------------------------------------- */

        const bulletId =
          nextBulletId.current++;

        const bullet: BulletData =
          {
            id: bulletId,

            from:
              MUZZLE_POSITION.clone(),

            to:
              point.clone(),
          };

        setBullets(
          (previousBullets) => [
            ...previousBullets,
            bullet,
          ],
        );

        /* -----------------------------------------------
           COMPLETION
           ----------------------------------------------- */

        checkGameComplete(
          remainingTargets,
        );
      },
      [
        setScore,
        onSkillHit,
        checkGameComplete,
      ],
    );

  /* =======================================================
     MISS
     ======================================================= */

  const handleMiss =
    useCallback(
      (id: number) => {
        const target =
          targetsRef.current.find(
            (item) =>
              item.id === id,
          );

        if (!target) {
          return;
        }

        /* -----------------------------------------------
           RECORD
           ----------------------------------------------- */

        onSkillMiss(
          target.text,
        );

        /* -----------------------------------------------
           REMOVE
           ----------------------------------------------- */

        const remainingTargets =
          targetsRef.current.filter(
            (item) =>
              item.id !== id,
          );

        targetsRef.current =
          remainingTargets;

        setTargets(
          remainingTargets,
        );

        /* -----------------------------------------------
           COMPLETION
           ----------------------------------------------- */

        checkGameComplete(
          remainingTargets,
        );
      },
      [
        onSkillMiss,
        checkGameComplete,
      ],
    );

  /* =======================================================
     BULLET DONE
     ======================================================= */

  const handleBulletDone =
    useCallback(
      (id: number) => {
        setBullets(
          (currentBullets) =>
            currentBullets.filter(
              (bullet) =>
                bullet.id !== id,
            ),
        );
      },
      [],
    );

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <>
      {/* FOG */}

      <fog
        attach="fog"
        args={[
          "#000000",
          30,
          90,
        ]}
      />

      {/* GRID */}

      <MovingGrid
        gameOver={gameOver}
      />

      {/* TARGETS */}

      {targets.map(
        (target) => (
          <Target
            key={target.id}
            id={target.id}
            text={target.text}
            initialPosition={
              target.position
            }
            onHit={
              handleHit
            }
            onMiss={
              handleMiss
            }
          />
        ),
      )}

      {/* BULLETS */}

      {bullets.map(
        (bullet) => (
          <Bullet
            key={bullet.id}
            from={
              bullet.from
            }
            to={
              bullet.to
            }
            onDone={() =>
              handleBulletDone(
                bullet.id,
              )
            }
          />
        ),
      )}
    </>
  );
};

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function SkillCloud({
  onGameHover,
}: {
  onGameHover: (
    active: boolean,
  ) => void;
}) {
  /* =======================================================
     GAME STATE
     ======================================================= */

  const [score, setScore] =
    useState(0);

  const [flash, setFlash] =
    useState(false);

  const [gameOver, setGameOver] =
    useState(false);

  const [gameKey, setGameKey] =
    useState(0);

  /* =======================================================
     RESULTS
     ======================================================= */

  const [hitSkills, setHitSkills] =
    useState<string[]>([]);

  const [missSkills, setMissSkills] =
    useState<string[]>([]);

  /* =======================================================
     FLASH TIMEOUT
     ======================================================= */

  const flashTimeoutRef =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(null);

  /* =======================================================
     CLEANUP
     ======================================================= */

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

  /* =======================================================
     HIT
     ======================================================= */

  const handleSkillHit =
    useCallback(
      (skill: string) => {
        setHitSkills(
          (previous) => [
            ...previous,
            skill,
          ],
        );
      },
      [],
    );

  /* =======================================================
     MISS
     ======================================================= */

  const handleSkillMiss =
    useCallback(
      (skill: string) => {
        setMissSkills(
          (previous) => [
            ...previous,
            skill,
          ],
        );
      },
      [],
    );

  /* =======================================================
     SHOOT FLASH
     ======================================================= */

  const handleShoot =
    useCallback(() => {
      if (gameOver) {
        return;
      }

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
    }, [gameOver]);

  /* =======================================================
     GAME OVER
     ======================================================= */

  const handleGameOver =
    useCallback(() => {
      setGameOver(true);

      /*
       * VERY IMPORTANT:
       *
       * Immediately release game cursor.
       *
       * Skill Results never call onGameHover.
       */

      onGameHover(false);
    }, [
      onGameHover,
    ]);

  /* =======================================================
     RESTART
     ======================================================= */

  const restartGame =
    useCallback(() => {
      setScore(0);

      setGameOver(false);

      setFlash(false);

      setHitSkills([]);

      setMissSkills([]);

      /*
       * Completely remount GameScene.
       */

      setGameKey(
        (previous) =>
          previous + 1,
      );

      /*
       * Immediately restore normal cursor.
       */

      onGameHover(false);
    }, [
      onGameHover,
    ]);

  /* =======================================================
     DISCOVERY
     ======================================================= */

  const totalDiscovered =
    hitSkills.length +
    missSkills.length;

  const totalSkills =
    SKILLS_LIST.length;

  /* =======================================================
     RENDER
     ======================================================= */

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
    >
      {/* ===================================================
          HEADER
          =================================================== */}

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

      {/* ===================================================
          GAME WINDOW
          
          ONLY THIS ELEMENT controls game cursor mode.
          =================================================== */}

      <div
        onMouseEnter={() =>
          onGameHover(true)
        }
        onMouseLeave={() =>
          onGameHover(false)
        }
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
        {/* FLASH */}

        <AnimatePresence>
          {flash &&
            !gameOver && (
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

        {/* CANVAS */}

        <InViewCanvas
          camera={{
            position: [
              0,
              0,
              8,
            ],
            fov: 50,
          }}
          dpr={[
            1,
            1.5,
          ]}
          gl={{
            antialias: false,
            powerPreference:
              "high-performance",
          }}
        >
          <GameScene
            key={gameKey}
            gameKey={gameKey}
            setScore={
              setScore
            }
            onGameOver={
              handleGameOver
            }
            gameOver={
              gameOver
            }
            onSkillHit={
              handleSkillHit
            }
            onSkillMiss={
              handleSkillMiss
            }
          />
        </InViewCanvas>

        {/* =================================================
            GAME OVER
            ================================================= */}

        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="
                absolute
                inset-0
                z-40
                flex
                flex-col
                items-center
                justify-center
                bg-black/85
                text-[#00ff33]
              "
            >
              <motion.div
                initial={{
                  scale: 0.8,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                transition={{
                  duration: 0.3,
                }}
                className="
                  text-center
                  px-6
                "
              >
                <div
                  className="
                    text-xl
                    md:text-3xl
                    font-bold
                    tracking-[0.25em]
                  "
                >
                  GAME OVER
                </div>

                <div
                  className="
                    mt-3
                    text-[10px]
                    md:text-sm
                    tracking-[0.2em]
                    text-white
                  "
                >
                  ALL SKILLS DISCOVERED
                </div>

                <div
                  className="
                    mt-2
                    text-[10px]
                    md:text-sm
                    tracking-widest
                    text-[#00ff33]
                  "
                >
                  SCORE: {score} /{" "}
                  {SKILLS_LIST.length}
                </div>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();

                    restartGame();
                  }}
                  className="
                    mt-6
                    border
                    border-[#00ff33]
                    px-6
                    py-3
                    text-[10px]
                    md:text-sm
                    tracking-[0.2em]
                    text-[#00ff33]
                    transition-all
                    duration-200
                    hover:bg-[#00ff33]
                    hover:text-black
                  "
                >
                  PLAY AGAIN
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ===================================================
          FOOTER
          =================================================== */}

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
        {gameOver
          ? "ALL TARGETS CLEARED"
          : "BREAK THE TARGETS!"}
      </div>

      {/* ===================================================
          SKILL RESULTS
          
          NO onMouseEnter / onMouseLeave HERE.
          
          Therefore this section NEVER activates the
          game cursor.
          =================================================== */}

      <AnimatePresence>
        {totalDiscovered > 0 && (
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: 20,
            }}
            transition={{
              duration: 0.3,
            }}
            className="
              mt-8
              w-full
              border
              border-[#1a1a1a]
              bg-black
              font-mono
            "
          >
            {/* RESULTS HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-[#1a1a1a]
                px-4
                py-3
                text-[10px]
                md:text-xs
                tracking-[0.2em]
                text-white
              "
            >
              <span>
                + SKILL RESULTS
              </span>

              <span className="text-[#666]">
                {totalDiscovered} /{" "}
                {totalSkills}
              </span>
            </div>

            {/* RESULTS GRID */}

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
              "
            >
              {/* =========================================
                  HIT
                  ========================================= */}

              <div
                className="
                  border-b
                  md:border-b-0
                  md:border-r
                  border-[#1a1a1a]
                  p-4
                "
              >
                <div
                  className="
                    mb-4
                    flex
                    items-center
                    justify-between
                    text-[10px]
                    md:text-xs
                    tracking-[0.2em]
                  "
                >
                  <span className="text-[#00ff33]">
                    HIT
                  </span>

                  <span className="text-[#00ff33]">
                    {hitSkills.length
                      .toString()
                      .padStart(
                        2,
                        "0",
                      )}
                  </span>
                </div>

                {hitSkills.length ===
                0 ? (
                  <div
                    className="
                      py-4
                      text-[10px]
                      tracking-widest
                      text-[#444]
                    "
                  >
                    NO SKILLS HIT
                  </div>
                ) : (
                  <div
                    className="
                      flex
                      flex-wrap
                      gap-2
                    "
                  >
                    {hitSkills.map(
                      (
                        skill,
                        index,
                      ) => (
                        <motion.div
                          key={`${skill}-${index}`}
                          initial={{
                            opacity: 0,
                            scale: 0.9,
                          }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                          }}
                          className="
                            border
                            border-[#00ff33]
                            px-3
                            py-2
                            text-[9px]
                            md:text-[10px]
                            tracking-wider
                            text-[#00ff33]
                          "
                        >
                          {skill}
                        </motion.div>
                      ),
                    )}
                  </div>
                )}
              </div>

              {/* =========================================
                  MISS
                  ========================================= */}

              <div
                className="
                  p-4
                "
              >
                <div
                  className="
                    mb-4
                    flex
                    items-center
                    justify-between
                    text-[10px]
                    md:text-xs
                    tracking-[0.2em]
                  "
                >
                  <span className="text-[#ff3333]">
                    MISS
                  </span>

                  <span className="text-[#ff3333]">
                    {missSkills.length
                      .toString()
                      .padStart(
                        2,
                        "0",
                      )}
                  </span>
                </div>

                {missSkills.length ===
                0 ? (
                  <div
                    className="
                      py-4
                      text-[10px]
                      tracking-widest
                      text-[#444]
                    "
                  >
                    NO SKILLS MISSED
                  </div>
                ) : (
                  <div
                    className="
                      flex
                      flex-wrap
                      gap-2
                    "
                  >
                    {missSkills.map(
                      (
                        skill,
                        index,
                      ) => (
                        <motion.div
                          key={`${skill}-${index}`}
                          initial={{
                            opacity: 0,
                            scale: 0.9,
                          }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                          }}
                          className="
                            border
                            border-[#ff3333]
                            px-3
                            py-2
                            text-[9px]
                            md:text-[10px]
                            tracking-wider
                            text-[#ff3333]
                          "
                        >
                          {skill}
                        </motion.div>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
