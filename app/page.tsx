"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import CustomCursor from "@/components/CustomCursor";
import Timeline from "@/components/Timeline";
import SkillCloud from "@/components/SkillCloud";
import ContactForm from "@/components/ContactForm";

import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";

const NeonDivider = () => (
  <div className="w-[90%] md:w-[93%] mx-auto h-[0.7px] bg-[#00ff33] relative z-30" />
);

const Divider = () => (
  <div className="w-[90%] md:w-[100%] mx-auto h-[2px] bg-[#00ff33] relative z-30" />
);

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
    <div className="absolute right-0 top-0 w-full md:w-[60%] h-full z-0 [filter:drop-shadow(0_0_15px_rgba(0,255,51,0.6))]">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <OrbitControls enableZoom={false} enablePan={false} />
        <RotatingShape
          position={[0, 0, 0]}
          scale={2.5}
          geometryType="icosahedron"
          speed={0.15}
          setIsDrag={setIsDrag}
        />
      </Canvas>
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
  const geometry = useMemo(() => new THREE.PlaneGeometry(80, 40, 100, 50), []);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta;
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
    <div className="absolute bottom-0 left-0 w-full h-[400px] pointer-events-none z-0 [filter:drop-shadow(0_0_5px_rgba(0,255,51,0.4))]">
      <Canvas camera={{ position: [0, 0.5, 7], fov: 50 }}>
        <TerrainMesh />
      </Canvas>
    </div>
  );
};

const projects = [
  {
    id: "1",
    year: "2025-26",
    shortName: "MindTrack",
    role: "FULL-STACK DEVELOPER",
    tech: ["MERN STACK", "MACHINE LEARNING", "TAILWIND CSS"],
    description:
      "An AI-powered platform with secure user authentication, interactive dashboards for mood trends, and personalized wellness insights.",
    image: "/images/mindwell.jpg",
    link: "https://github.com/KUSH-Q-37/mindwell",
  },
  {
    id: "2",
    year: "2026",
    shortName: "IPL 2022 Analysis",
    role: "DATA ANALYST",
    tech: ["PYTHON", "NUMPY", "PANDAS", "MATPLOTLIB", "SEABORN"],
    description:
      "Exploratory data analysis and complex data visualizations mapping team performance and match trends.",
    video: "/videos/ipl.mp4",
    image: "/images/ipl.jpg",
    link: "https://github.com/KUSH-Q-37/Data-Science",
  },
];

const fadeUpVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
} as const; 

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
        <section className="relative h-screen flex flex-col justify-center px-8 md:px-24">
          <GeometricBackground setIsDrag={setIsDrag} />

          <motion.div
            initial="hidden"
            animate={!isLoading ? "visible" : "hidden"}
            className="relative z-10 select-text pointer-events-none"
          >
            <motion.h1
              variants={fadeUpVariant}
              className="text-6xl md:text-9xl tracking-tighter select-none pointer-events-auto w-fit flex flex-col items-start leading-[0.9]"
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
              className="mt-6 text-xl md:text-2xl text-zinc-400 max-w-2xl font-light pointer-events-auto"
            >
              Full-Stack Developer & Software Engineering Student crafting
              interactive, high-performance digital experiences.
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
                        <span className="w-8 h-[2px] bg-[#00ff33] group-hover/link:w-full transition-all duration-300 shadow-[0_0_8px_rgba(0,255,51,0.8)]"></span>
                      </a>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-6 pt-8 pb-0 lg:px-8 border-b lg:border-b-0 lg:border-r border-[#00ff33] flex items-center">
                  <div className="w-full aspect-video relative border border-zinc-800 bg-black overflow-hidden flex items-center justify-center group-hover:border-[#00ff33]/50 transition-colors duration-500 shadow-2xl">
                    {project.video ? (
                      <>
                        <img
                          src={project.image}
                          alt={project.shortName}
                          className="absolute inset-0 w-full h-full object-cover z-0 grayscale group-hover:opacity-0 transition-opacity duration-500"
                        />
                        <video
                          src={project.video}
                          loop
                          muted
                          playsInline
                          onMouseEnter={(e) => {
                            const playPromise = e.currentTarget.play();
                            if (playPromise !== undefined) {
                              playPromise.catch(() => {});
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.pause();
                            e.currentTarget.currentTime = 0;
                          }}
                          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-auto"
                        />
                      </>
                    ) : (
                      <img
                        src={project.image}
                        className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      />
                    )}
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

            {/* Changed to items-stretch so both columns match height dynamically */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
              
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeUpVariant}
                whileHover="hover"
                // Removed min-h-[500px], added h-full to stretch to match the right column
                className="lg:col-span-5 flex flex-col justify-between border border-zinc-800 bg-[#0a0a0a] p-6 md:p-8 hover:border-[#00ff33]/50 transition-colors duration-500 shadow-2xl relative h-full min-h-[350px] overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 z-0"
                  initial={{ opacity: 0 }}
                  variants={{ hover: { opacity: 0.8 } }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  <img
                    src="/images/pfp.jpg"
                    alt="Background Portrait"
                    className="w-full h-full object-cover grayscale"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
                </motion.div>

                <motion.div
                  className="relative z-10"
                  initial={{ opacity: 1 }}
                  variants={{ initial: { opacity: 1 }, hover: { opacity: 0 } }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <h3 className="text-2xl font-bold text-white uppercase tracking-wider mb-4">
                    Curriculum Vitae
                  </h3>
                  <p className="text-zinc-400 font-light text-sm leading-relaxed">
                    Access my comprehensive professional experience, technical
                    skills, and educational background. Available for direct
                    viewing or secure local extraction.
                  </p>
                </motion.div>

                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#00ff33]" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#00ff33]" />

                <div className="flex flex-col sm:flex-row gap-4 mt-8 pointer-events-auto relative z-10">
                  <a
                    href="https://drive.google.com/file/d/1BqYDD2k77h622F03X_ay9UWXnhDaU0XA/view"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-center py-4 border border-[#00ff33] text-[#00ff33] hover:bg-[#00ff33] hover:text-black transition-all duration-300 font-bold tracking-[0.2em] text-[10px] uppercase cursor-none"
                  >
                    View Resume
                  </a>
                  <a
                    href="https://drive.google.com/file/d/1BqYDD2k77h622F03X_ay9UWXnhDaU0XA/view"
                    download="Kush_Bhardwaj_Resume.pdf"
                    className="flex-1 text-center py-4 bg-[#00ff33] border border-[#00ff33] text-black hover:bg-white hover:border-white transition-all duration-300 font-bold tracking-[0.2em] text-[10px] uppercase cursor-none"
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
                // Changed gap-6 to gap-3 to compact the list
                className="lg:col-span-7 flex flex-col justify-between gap-3 h-full"
              >
                {[
                  {
                    title: "Kaggle Python Coder Badge",
                    desc: "Successfully completed Python programming challenges on Kaggle.",
                    link: "https://www.kaggle.com/certification/badges/kushbhardwaj72/30", // Add your Kaggle link here
                  },
                  {
                    title: "British Airways Data Science Simulation",
                    desc: "Completed a virtual data science job simulation focused on business analytics via Forage.",
                    link: "https://drive.google.com/file/d/1APIBcMIpBgxXuody56E1feS5AtwGK6Rk/view", // Add your Forage/Certificate link here
                  },
                  {
                    title: "HackerRank Certified SQL Developer",
                    desc: "Demonstrated proficiency in SQL, including JOIN, GROUP BY, aggregate functions, and database querying.",
                    link: "https://www.hackerrank.com/certificates/3d610aa45759", // Add your HackerRank link here
                  },
                  {
                    title: "HackerRank Certified Python Developer",
                    desc: "Validated Python fundamentals, object-oriented programming (OOP), collections, and modular programming.",
                    link: "https://www.hackerrank.com/certificates/f1ed70f77049", // Add your HackerRank link here
                  },
                  {
                    title: "HackerRank Gold (5-Star) Python Badge",
                    desc: "Demonstrated advanced Python programming and problem-solving skills.",
                    link: "https://www.hackerrank.com/profile/khush7217553287", // Add your HackerRank link here
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    // Reduced top/bottom padding to py-1
                    className="group relative flex flex-col items-start justify-center border-l border-[#00ff33]/30 hover:border-[#00ff33] pl-6 py-1 transition-colors duration-300"
                  >
                    <h4 className="text-base md:text-lg font-bold text-zinc-200 group-hover:text-[#00ff33] transition-colors">
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
                        className="mt-2 text-[#00ff33] font-mono text-[9px] tracking-[0.2em] uppercase font-bold border border-[#00ff33]/50 px-3 py-1 hover:bg-[#00ff33] hover:text-black transition-colors duration-300 pointer-events-auto cursor-none"
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
        {/* --------------------------------------- */}

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
          <div className="absolute top-70 -left-4 w-[500px] h-[400px] opacity-80 z-0">
            <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
              <OrbitControls enableZoom={false} enablePan={false} />
              <WireframeGlobe setIsDrag={setIsDrag} />
            </Canvas>
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
                className="flex justify-end gap-8 mt-12 w-full max-w-2xl"
              >
                <a
                  href="https://github.com/KUSH-Q-37"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#00ff33] hover:text-white transition-colors duration-300 cursor-none"
                  aria-label="GitHub"
                >
                  <FaGithub className="w-12 h-12 md:w-16 md:h-16" />
                </a>

                <a
                  href="https://www.linkedin.com/in/kush-bhardwaj-73a65628b/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#00ff33] hover:text-white transition-colors duration-300 cursor-none"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin className="w-12 h-12 md:w-16 md:h-16" />
                </a>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}