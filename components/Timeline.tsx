'use client';

import { motion } from 'framer-motion';

interface JourneyItem {
  year: string;
  title: string;
  subtitle: string;
  description: string;
}

const journeyData: JourneyItem[] = [
  {
    year: "June-July 2024",
    title: "Virtual Internship",
    subtitle: "Internship Studio",
    description: "Engineered responsive, reusable frontend components and interactive user interfaces."
  },
  {
    year: "2022 - 2026",
    title: "B.Tech Computer Science",
    subtitle: "GLA University, Mathura",
    description: "Deep dive into advanced algorithms, database management, networking, and operating systems."
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
                className="absolute left-[19px] md:left-1/2 top-1 md:top-1/2 w-[18px] h-[18px] bg-black border-[1.5px] border-[#00ff33] rounded-full -translate-x-1/2 md:-translate-y-1/2 z-10 shadow-[0_0_10px_rgba(0,255,51,0.8),inset_0_0_4px_rgba(0,255,51,0.5)]" 
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
                <p className="text-zinc-400 font-light text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}