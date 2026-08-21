'use client';

import { motion } from 'framer-motion';

interface JourneyItem {
  year: string;
  title: string;
  subtitle: string;
  description: string;
  link?: string;
  linkLabel?: string;
}

const journeyData: JourneyItem[] = [
  {
    year: "2022 - 2026",
    title: "B.Tech Computer Science",
    subtitle: "GLA University, Mathura",
    description: "Deep dive into advanced algorithms, database management, networking, and operating systems.",
    link: "https://drive.google.com/file/d/1CocGtJ2hNNAclaIBtB2YT0uJrI02xvYI/view?usp=sharing"
  },
  {
    year: "June-July 2024",
    title: "Virtual Full Stack Developer Intern",
    subtitle: "Internship Studio (Remote)",
    description: "Developed the frontend of an e-commerce web application using HTML, CSS, JavaScript, and React.js, building responsive and reusable components.",
    link: "https://drive.google.com/file/d/19PwbdMEuPRkT2Y8loJzpJpdgzq9i42QT/view?pli=1"
  },
  {
    year: "2024 - 25",
    title: "Full Stack Development Training",
    subtitle: "IntegraMind, GLA University",
    description: "Built a Flask-based task prioritization and project management web app, implementing backend logic and frontend integration for user task workflows.",
    link: "https://github.com/KUSH-Q-37/Integramind",
    linkLabel: "View Repository"
  },
  {
    year: "July 2026 - Present",
    title: "Web Developer Intern",
    subtitle: "VM One Technologies, Noida (On-site)",
    description: "Designing and maintaining the company's production website end to end — a ten-section React 19 + TypeScript experience with GSAP/Lenis scroll animation and custom Canvas/WebGL visuals.",
  }
];

export default function Timeline() {
  return (
    <div className="relative max-w-4xl mx-auto mt-12 py-8">
      <div className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-[1px] bg-[#00ff33] shadow-[0_0_12px_rgba(0,255,51,0.7)] md:-translate-x-1/2" />

      <div className="flex flex-col gap-16">
        {journeyData.map((item, index) => {
          const isEven = index % 2 === 0;
          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative flex items-start md:items-center justify-between w-full"
            >
              <div 
                className="absolute left-4.75 md:left-1/2 top-1 md:top-1/2 w-4.5 h-4.5 bg-black border-[1.5px] border-[#00ff33] rounded-full -translate-x-1/2 md:-translate-y-1/2 z-10 ,inset_0_0_4px_rgba(0,255,51,0.5)]" 
              />

              <div className={`w-full pl-12 md:pl-0 md:w-[calc(50%-3rem)] ${isEven ? 'md:mr-auto md:text-right' : 'md:ml-auto md:text-left'}`}>
                <span className="text-[#00ff33] font-mono text-xs tracking-widest block mb-2">
                  {item.year}
                </span>
                <h3 className="text-xl md:text-2xl font-bold text-zinc-200 uppercase tracking-tight">
                  {item.title}
                </h3>
                <h4 className="text-[10px] md:text-xs font-mono tracking-[0.2em] text-zinc-500 uppercase mt-2 mb-4">
                  {item.subtitle}
                </h4>
                <p className="text-zinc-400 font-light text-sm leading-relaxed mb-4">
                  {item.description}
                </p>
                
                {item.link && (
                  <div className={`flex ${isEven ? 'md:justify-end' : 'md:justify-start'}`}>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block text-[#00ff33] font-mono text-[10px] tracking-[0.2em] uppercase font-bold border border-[#00ff33]/50 px-4 py-1.5 hover:bg-[#00ff33] hover:text-black active:bg-[#00ff33] active:text-black transition-colors duration-300 pointer-events-auto cursor-none"
                    >
                      {item.linkLabel ?? "View Certificate"}
                    </a>
                  </div>
                )}
                {/* ------------------------------------------- */}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}