"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";
import CustomCursor from "@/components/CustomCursor";
import Timeline from "@/components/Timeline";
import SkillCloud from "@/components/SkillCloud";
import ContactForm from "@/components/ContactForm";


import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import InViewCanvas from "@/components/InViewCanvas";

const NeonDivider = () => (
  <div className="w-[90%] mx-auto h-[0.7px] bg-[#00ff33] relative z-30" />
);

const Divider = () => (
  <div className="w-full h-[2px] bg-[#00ff33] relative z-30" />
);

// Plain drei <OrbitControls> forces touch-action:"none" on its canvas the
// moment it connects, so a single-finger swipe over these decorative 3D
// backgrounds rotates the shape instead of scrolling the page — on
// touch devices that pins the whole page in place. Put touch-action back to
// "pan-y" right after mount (a macrotask after drei's own connect effect)
// so vertical swipes still scroll normally; horizontal drags still rotate.
const ScrollFriendlyOrbitControls = () => {
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      const el = controlsRef.current?.domElement as HTMLElement | undefined;
      if (el) el.style.touchAction = "pan-y";
    }, 0);
    return () => clearTimeout(id);
  }, []);

  return <OrbitControls ref={controlsRef} enableZoom={false} enablePan={false} />;
};

const RotatingShape = ({
  position,
  scale,
  geometryType,
  speed = 0.2,
  setIsDrag,
}: any) => {
  const groupRef = useRef<any>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.x += delta * speed;
      groupRef.current.rotation.y += delta * (speed + 0.1);
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          setIsDrag(true);
        }}
        onPointerOut={() => setIsDrag(false)}
      >
        <sphereGeometry args={[1.5, 32]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
      <mesh>
        {geometryType === "icosahedron" ? (
          <icosahedronGeometry args={[1, 0]} />
        ) : (
          <octahedronGeometry args={[1, 0]} />
        )}
        <meshBasicMaterial
          color={0x00ff33}
          wireframe={true}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};

const GeometricBackground = ({
  setIsDrag,
}: {
  setIsDrag: (val: boolean) => void;
}) => {
  return (
    <div className="absolute top-0 right-0 w-48 h-48 sm:w-60 sm:h-60 md:w-[60%] md:h-full z-0 [filter:drop-shadow(0_0_15px_rgba(0,255,51,0.6))]">
      <InViewCanvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <ScrollFriendlyOrbitControls />
        <RotatingShape
          position={[0, 0, 0]}
          scale={2.5}
          geometryType="icosahedron"
          speed={0.15}
          setIsDrag={setIsDrag}
        />
      </InViewCanvas>
    </div>
  );
};

const WireframeGlobe = ({
  setIsDrag,
}: {
  setIsDrag: (val: boolean) => void;
}) => {
  const groupRef = useRef<any>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
      groupRef.current.rotation.x += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          setIsDrag(true);
        }}
        onPointerOut={() => setIsDrag(false)}
      >
        <sphereGeometry args={[5.5, 32]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[5, 2]} />
        <meshBasicMaterial
          color={0x00ff33}
          wireframe={true}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};

const TerrainMesh = () => {
  const meshRef = useRef<any>(null);
  // Fewer segments = far fewer vertices to rewrite every update (61*31
  // instead of 101*51) with no visible loss — the wave is slow and broad,
  // and the mask-fade at the terrain's near edge hides the coarser mesh.
  const geometry = useMemo(() => new THREE.PlaneGeometry(80, 40, 60, 30), []);
  const timeRef = useRef(0);
  const frameRef = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta;

    // The vertex rewrite + GPU re-upload below is the priciest part of the
    // whole page's per-frame cost. The wave moves slowly enough that
    // updating it at ~30fps instead of ~60fps is invisible, but it halves
    // that cost on every device.
    frameRef.current++;
    if (frameRef.current % 2 !== 0) return;

    const time = timeRef.current;
    const positions = meshRef.current.geometry.attributes.position;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z =
        Math.sin(x * 0.3 + time * 0.4) * 0.4 +
        Math.cos(y * 0.3 + time * 0.4) * 0.4;
      positions.setZ(i, z);
    }
    positions.needsUpdate = true;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -2.5, -8]}
    >
      <meshBasicMaterial
        color={0x00ff33}
        wireframe={true}
        transparent
        opacity={0.8}
        toneMapped={false}
      />
    </mesh>
  );
};

const TerrainBackground = () => {
  return (
    <div className="absolute bottom-0 left-0 w-full h-[400px] pointer-events-none z-0 [filter:drop-shadow(0_0_5px_rgba(0,255,51,0.4))] [mask-image:linear-gradient(to_bottom,black_0%,black_65%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_65%,transparent_100%)]">
      <InViewCanvas
        camera={{ position: [0, 0.5, 7], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <TerrainMesh />
      </InViewCanvas>
    </div>
  );
};

const RESUME_URL =
  "https://drive.google.com/file/d/1nQmD5ywDHGVHKqbaheoTYV5GjxSRtHb3/view?usp=sharing";

type Project = {
  id: string;
  year: string;
  shortName: string;
  role: string;
  tech: string[];
  description: string;
  image: string;
  link: string;
  // Optional data-pipeline stages, shown as a small flow diagram — only
  // set on projects where that's actually the interesting part.
  pipeline?: string[];
};

const projects: Project[] = [
  {
    id: "1",
    year: "2026",
    shortName: "PriceTrail",
    role: "FULL-STACK DEVELOPER",
    tech: ["TYPESCRIPT", "NESTJS", "NEXT.JS", "POSTGRESQL", "REDIS"],
    description:
      "A full-stack Flipkart price-tracking platform built as a 9-package TypeScript monorepo, with an automated daily scrape-embed-match pipeline, a partitioned time-series schema, and a multi-layer product matching engine using pgvector HNSW semantic search.",
    image: "/images/pricetrail.jpg",
    link: "https://pricetrail-tau.vercel.app",
    pipeline: ["SCRAPE", "EMBED", "MATCH", "STORE"],
  },
  {
    id: "2",
    year: "2026",
    shortName: "MindTrack",
    role: "FULL-STACK DEVELOPER",
    tech: ["MERN STACK", "MACHINE LEARNING", "TAILWIND CSS"],
    description:
      "An AI-powered platform with secure user authentication, interactive dashboards for mood trends, and personalized wellness insights.",
    image: "/images/mindwell.jpg",
    link: "https://github.com/KUSH-Q-37/mindwell",
  },
  {
    id: "3",
    year: "2026",
    shortName: "IPL 2022 Analysis",
    role: "DATA ANALYST",
    tech: ["PYTHON", "NUMPY", "PANDAS", "MATPLOTLIB", "SEABORN"],
    description:
      "Exploratory data analysis and complex data visualizations mapping team performance and match trends.",
    image: "/images/ipl.jpg",
    link: "https://github.com/KUSH-Q-37/Data-Science",
  },
];

const fadeUpVariant: any = { // <--- Kept ': any' to skip strict type checking
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.8, 
      ease: [0.16, 1, 0.3, 1] 
    },
  },
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isGame, setIsGame] = useState(false);
  const [isDrag, setIsDrag] = useState(false);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (e.button === 0) {
        window.getSelection()?.removeAllRanges();
      }
    };
    window.addEventListener("mousedown", handleGlobalClick);
    return () => window.removeEventListener("mousedown", handleGlobalClick);
  }, []);

  useEffect(() => {
    // iOS Safari only applies `:active` styles when a touchstart listener
    // exists somewhere on the page — otherwise every `active:` utility
    // below (the mobile stand-in for `hover:`) silently never fires.
    const noop = () => {};
    document.addEventListener("touchstart", noop, { passive: true });
    return () => document.removeEventListener("touchstart", noop);
  }, []);

  useEffect(() => {
    const duration = 2000;
    const interval = 20;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newProgress = Math.min(
        Math.floor((currentStep / steps) * 100),
        100,
      );
      setProgress(newProgress);

      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(() => {
          setIsLoading(false);
        }, 300);
      }
    }, interval);

    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => clearInterval(timer);
  }, [isLoading]);

  return (
    <>
      <CustomCursor isGame={isGame} isDrag={isDrag} />

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={!isLoading ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="fixed top-5 left-5 md:top-8 md:left-8 z-40 font-mono text-lg md:text-xl font-bold tracking-tight select-none pointer-events-none"
      >
        <span className="text-zinc-500">&lt;</span>
        <span className="text-white">KUSH</span>
        <span className="text-[#00ff33] drop-shadow-[0_0_8px_rgba(0,255,51,0.6)]">/DEV</span>
        <span className="text-zinc-500">&gt;</span>
      </motion.div>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="preloader"
            initial={{ opacity: 1, y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-50 bg-[#0a0a0a] flex items-center justify-center font-mono select-none"
          >
            <div className="text-white text-3xl md:text-5xl font-light tracking-widest">
              {progress}%
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="min-h-screen bg-background text-foreground selection:bg-[#00ff33] selection:text-black relative font-sans">
        <section className="relative h-auto md:h-screen flex flex-col justify-start md:justify-center pt-28 pb-16 md:pt-0 md:pb-0 px-8 md:px-24">
          <GeometricBackground setIsDrag={setIsDrag} />

          <motion.div
            initial="hidden"
            animate={!isLoading ? "visible" : "hidden"}
            className="relative z-10 select-text pointer-events-none"
          >
            <motion.h1
              variants={fadeUpVariant}
              className="text-7xl sm:text-8xl md:text-9xl tracking-tighter select-none pointer-events-auto w-fit flex flex-col items-start leading-[0.9]"
            >
              <div className="text-white pl-4 md:pl-0 pb-4">
                <span className="select-none">Kush</span>
              </div>

              <div className="inline-block bg-[#00ff33] text-black px-4 md:px-0 pt-2 pb-7.5">
                <span className="select-none">Bhardwaj</span>
              </div>
            </motion.h1>

            <motion.p
              variants={fadeUpVariant}
              className="mt-6 pl-4 md:pl-0 text-xl md:text-2xl text-zinc-400 max-w-2xl font-light pointer-events-auto"
            >
              Full-Stack Developer & 2026 CS Graduate crafting
              interactive, high-performance digital experiences at VM One Technologies.
            </motion.p>

            <motion.p
              variants={fadeUpVariant}
              className="mt-4 pl-4 md:pl-0 text-sm md:text-base text-zinc-500 max-w-xl font-light pointer-events-auto"
            >
              Comfortable across the stack — React and Node on the front and back end,
              PostgreSQL and Redis underneath — with a background in Python and
              machine learning from earlier data science work.
            </motion.p>
          </motion.div>
        </section>

        <NeonDivider />

        <section className="bg-[#0a0a0a] relative z-10">
          <div className="px-4 md:px-12 py-10">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUpVariant}
              className="text-3xl md:text-5xl font-bold tracking-tight uppercase text-zinc-200"
            >
              Featured Work
            </motion.h2>
          </div>

          <div className="flex flex-col gap-16 md:gap-24 px-4 md:px-12 pb-32">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeUpVariant}
                className="group relative grid grid-cols-1 lg:grid-cols-12 border-t border-[#00ff33]"
              >
                <div className="lg:col-span-2 pt-8 pb-8 lg:pr-6 border-b lg:border-b-0 lg:border-r border-[#00ff33] flex flex-col justify-start">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-zinc-400 text-[10px] font-mono tracking-widest uppercase">
                      {project.shortName}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full border border-[#00ff33] opacity-70" />
                  </div>
                  <span className="text-6xl md:text-7xl font-bold text-zinc-100 tracking-tighter leading-none mt-1">
                    0{project.id}
                  </span>
                  
                  {project.link && (
                    <div className="mt-12 pointer-events-auto">
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noreferrer"
                        className="group/link flex flex-col gap-2 cursor-none w-fit"
                      >
                        <span className="text-[#00ff33] font-mono text-sm tracking-[0.2em] uppercase font-bold drop-shadow-[0_0_8px_rgba(0,255,51,0.5)]">
                          Visit Site
                        </span>
                        <span className="w-8 h-[2px] bg-[#00ff33] group-hover/link:w-full group-active/link:w-full transition-all duration-300 shadow-[0_0_8px_rgba(0,255,51,0.8)]"></span>
                      </a>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-6 pt-8 pb-0 lg:px-8 border-b lg:border-b-0 lg:border-r border-[#00ff33] flex items-center">
                  <div className="w-full aspect-video relative border border-zinc-800 bg-black overflow-hidden flex items-center justify-center group-hover:border-[#00ff33]/50 group-active:border-[#00ff33]/50 transition-colors duration-500 shadow-2xl">
                    <Image
                      src={project.image}
                      alt={project.shortName}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-contain grayscale group-hover:grayscale-0 group-active:grayscale-0 transition-all duration-700"
                    />
                  </div>
                </div>

                <div className="lg:col-span-4 pt-8 pb-0 lg:pl-8 flex flex-col justify-start relative">
                  <div className="mb-4 mt-1">
                    <h4 className="text-zinc-500 text-[9px] font-mono tracking-[0.2em] uppercase mb-1">
                      Year
                    </h4>
                    <p className="text-2xl font-light text-zinc-200">
                      {project.year}
                    </p>
                  </div>
                  <div className="mb-5">
                    <h4 className="text-zinc-500 text-[9px] font-mono tracking-[0.2em] uppercase mb-1">
                      Role
                    </h4>
                    <p className="text-lg md:text-xl font-normal tracking-wide uppercase text-zinc-200 leading-tight">
                      {project.role}
                    </p>
                  </div>
                  <div className="mb-6">
                    <h4 className="text-zinc-500 text-[9px] font-mono tracking-[0.2em] uppercase mb-2">
                      Technologies
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((techItem, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest text-[#00ff33] border border-[#00ff33] bg-black/40"
                        >
                          {techItem}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 flex items-start gap-2 pr-4">
                    <span className="text-[#00ff33] text-xs font-mono mt-0.5">
                      +
                    </span>
                    <p className="text-[10px] md:text-xs font-mono text-zinc-400 uppercase leading-relaxed tracking-wider">
                      {project.description}
                    </p>
                  </div>

                  {project.pipeline && (
                    <div className="mt-6">
                      <h4 className="text-zinc-500 text-[9px] font-mono tracking-[0.2em] uppercase mb-2">
                        Pipeline
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
                        {project.pipeline.map((stage, i) => (
                          <div key={stage} className="flex items-center gap-1.5">
                            <span className="px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest text-black bg-[#00ff33]">
                              {stage}
                            </span>
                            {i < project.pipeline!.length - 1 && (
                              <span className="text-[#00ff33] text-xs font-mono">
                                →
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <NeonDivider />

        <section className="pt-24 pb-64 px-8 md:px-24 bg-zinc-950/50 relative z-10 overflow-hidden">
          <div className="max-w-4xl mx-auto relative z-10">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUpVariant}
              className="text-4xl md:text-5xl font-bold mb-8 tracking-tight uppercase"
            >
              My Journey
            </motion.h2>
            <Timeline />
          </div>
          <TerrainBackground />
        </section>

        <Divider />

        {/* --- COMPACTED CREDENTIALS SECTION --- */}
        <section className="py-16 md:py-24 px-8 md:px-24 bg-background relative z-10">
          <div className="max-w-6xl mx-auto relative z-10">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUpVariant}
              className="text-4xl md:text-5xl font-bold tracking-tight uppercase mb-10 md:mb-12"
            >
              Credentials <span className="text-[#00ff33]">&</span> Resume
            </motion.h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
              
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeUpVariant}
                className="lg:col-span-5 flex flex-col justify-between border border-zinc-800 bg-[#0a0a0a] p-6 md:p-8 hover:border-[#00ff33]/50 active:border-[#00ff33]/50 transition-colors duration-500 shadow-2xl relative h-full min-h-[350px] overflow-hidden"
              >
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white uppercase tracking-wider mb-4 select-none">
                    Curriculum Vitae
                  </h3>
                  <p className="text-zinc-400 font-light text-sm leading-relaxed select-none">
                    Access my comprehensive professional experience, technical
                    skills, and educational background. Available for direct
                    viewing or secure local extraction.
                  </p>
                </div>

                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#00ff33]" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#00ff33]" />

                <div className="flex flex-col sm:flex-row gap-4 mt-8 pointer-events-auto relative z-10">
                  <a
                    href={RESUME_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-center py-4 border border-[#00ff33] text-[#00ff33] hover:bg-[#00ff33] hover:text-black active:bg-[#00ff33] active:text-black transition-all duration-300 font-bold tracking-[0.2em] text-[10px] uppercase cursor-none"
                  >
                    View Resume
                  </a>
                  <a
                    href={RESUME_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-center py-4 bg-[#00ff33] border border-[#00ff33] text-black hover:bg-white hover:border-white active:bg-white active:border-white transition-all duration-300 font-bold tracking-[0.2em] text-[10px] uppercase cursor-none"
                  >
                    Extract PDF
                  </a>
                </div>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeUpVariant}
                className="lg:col-span-7 flex flex-col justify-between gap-3 h-full"
              >
                {[
                  {
                    title: "Kaggle Python Coder Badge",
                    desc: "Successfully completed Python programming challenges on Kaggle.",
                    link: "https://www.kaggle.com/certification/badges/kushbhardwaj72/30", 
                  },
                  {
                    title: "British Airways Data Science Simulation",
                    desc: "Completed a virtual data science job simulation focused on business analytics via Forage.",
                    link: "https://drive.google.com/file/d/1APIBcMIpBgxXuody56E1feS5AtwGK6Rk/view", 
                  },
                  {
                    title: "HackerRank Certified SQL Developer",
                    desc: "Demonstrated proficiency in SQL, including JOIN, GROUP BY, aggregate functions, and database querying.",
                    link: "https://www.hackerrank.com/certificates/3d610aa45759",
                  },
                  {
                    title: "HackerRank Certified Python Developer",
                    desc: "Validated Python fundamentals, object-oriented programming (OOP), collections, and modular programming.",
                    link: "https://www.hackerrank.com/certificates/f1ed70f77049", 
                  },
                  {
                    title: "HackerRank Gold (5-Star) Python Badge",
                    desc: "Demonstrated advanced Python programming and problem-solving skills.",
                    link: "https://www.hackerrank.com/profile/khush7217553287",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="group relative flex flex-col items-start justify-center border-l border-[#00ff33]/30 hover:border-[#00ff33] active:border-[#00ff33] pl-6 py-1 transition-colors duration-300"
                  >
                    <h4 className="text-base md:text-lg font-bold text-zinc-200 group-hover:text-[#00ff33] group-active:text-[#00ff33] transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[10px] font-mono text-zinc-500 mt-1 tracking-wide leading-relaxed uppercase">
                      {item.desc}
                    </p>
                    
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 text-[#00ff33] font-mono text-[9px] tracking-[0.2em] uppercase font-bold border border-[#00ff33]/50 px-3 py-1 hover:bg-[#00ff33] hover:text-black active:bg-[#00ff33] active:text-black transition-colors duration-300 pointer-events-auto cursor-none"
                      >
                        Visit
                      </a>
                    )}
                  </div>
                ))}
              </motion.div>
              
            </div>
          </div>
        </section>

        <NeonDivider />

        <section className="py-24 px-8 md:px-24 overflow-hidden relative z-10 bg-background">
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="mb-12">
              <motion.h2
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeUpVariant}
                className="text-4xl md:text-5xl font-bold tracking-tight uppercase mb-4"
              >
                Arsenal
              </motion.h2>
              <p className="text-zinc-500 max-w-xl font-light">
                Don't just read the stack. Break it.
              </p>
            </div>

            <SkillCloud onGameHover={(val: boolean) => setIsGame(val)} />
          </div>
        </section>

        <NeonDivider />

        <section className="relative min-h-screen bg-[#0a0a0a] overflow-hidden flex flex-col pt-32 px-8 md:px-16 z-10">
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 md:top-63 md:bottom-auto md:left-auto md:-left-4 md:translate-x-0 w-[340px] h-[320px] md:w-[450px] md:h-[400px] opacity-80 z-0">
            <InViewCanvas
              camera={{ position: [0, 0, 15], fov: 45 }}
              dpr={[1, 1.5]}
              gl={{ antialias: false, powerPreference: "high-performance" }}
            >
              <ScrollFriendlyOrbitControls />
              <WireframeGlobe setIsDrag={setIsDrag} />
            </InViewCanvas>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-[1600px] mx-auto z-20 relative pointer-events-none">
            <div className="flex flex-col items-start justify-start w-full">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUpVariant}
                className="mb-1 pointer-events-auto w-fit"
              >
                <div className="inline-block bg-[#00ff33] text-black font-extrabold text-5xl md:text-6xl tracking-tighter leading-[1] px-3 py-1 uppercase select-none">
                  + LET'S WORK
                </div>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUpVariant}
                className="ml-8 md:ml-16 pointer-events-auto w-fit"
              >
                <div className="inline-block bg-[#00ff33] text-black font-extrabold text-5xl md:text-6xl tracking-tighter leading-[1] px-3 py-1 uppercase select-none">
                  TOGETHER
                </div>
              </motion.div>
            </div>

            <div className="flex flex-col justify-between items-end w-full pointer-events-auto">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUpVariant}
                className="w-full max-w-2xl"
              >
                <ContactForm />
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUpVariant}
                className="flex justify-end gap-3 mt-5 w-full max-w-2xl"
              >
                <a
                  href="https://github.com/KUSH-Q-37"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-[#00ff33] hover:text-white active:text-white transition-colors duration-300 cursor-none"
                  aria-label="GitHub"
                >
                  <FaGithub className="w-7 h-7 md:w-5 md:h-5" />
                </a>

                <a
                  href="https://www.linkedin.com/in/kush-bhardwaj-73a65628b/"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-[#00ff33] hover:text-white active:text-white transition-colors duration-300 cursor-none"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin className="w-7 h-7 md:w-5 md:h-5" />
                </a>

                <a
                  href="https://leetcode.com/u/kush968/"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-[#00ff33] hover:text-white active:text-white transition-colors duration-300 cursor-none"
                  aria-label="LeetCode"
                >
                  <SiLeetcode className="w-7 h-7 md:w-5 md:h-5" />
                </a>
              </motion.div>
            </div>
          </div>
        </section>
        
      </main>
    </>
  );
}