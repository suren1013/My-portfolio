import React from 'react';
import { motion } from 'motion/react';
import { ArrowDown, FileText, Cpu, PenTool, Focus } from 'lucide-react';

const STATS = [
  { label: 'CGPA', value: '9.03', icon: <Focus size={16} className="text-accent-500" /> },
  { label: 'Engineering Projects', value: '6+', icon: <PenTool size={16} className="text-accent-500" /> },
  { label: 'Specialization', value: 'FEA & Embedded', icon: <Cpu size={16} className="text-accent-500" /> },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Engineering/Blueprint Grid */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-accent-500/20 opacity-20 blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid lg:grid-cols-[1fr_min-content] gap-12 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="font-mono text-accent-500 mb-6 tracking-wider text-sm md:text-base border border-accent-500/20 bg-accent-500/5 inline-flex p-2 items-center px-4 rounded-full">
              <span className="w-2 h-2 rounded-full bg-accent-500 mr-3 animate-pulse" />
              SYSTEM.READY
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-tight mb-6">
              SURENDHER R.
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 font-light mb-4 max-w-2xl">
              Mechanical Engineer. Simulation. <br className="hidden md:block" />Embedded Systems. Builder.
            </p>
            
            <p className="font-mono text-white/50 text-sm md:text-base mb-10 max-w-2xl border-l-2 border-white/10 pl-4 py-1">
              "Pre-final Year B.Tech | VIT Chennai | CGPA 9.03"
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-20 md:mb-0">
              <a
                href="#projects"
                className="group relative inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 font-medium transition-all hover:bg-white/90 hover:scale-105 active:scale-95"
              >
                View Projects
                <ArrowDown size={18} className="group-hover:translate-y-1 transition-transform" />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Stats Column - Right aligned on large screens, row on mobile */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col gap-4 self-stretch justify-center"
        >
          {STATS.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
              className="bg-white/5 border border-white/5 backdrop-blur-md p-6 flex flex-col gap-2 min-w-[200px] hover:border-accent-500/30 transition-colors group"
            >
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs text-white/40 uppercase group-hover:text-white/60 transition-colors">{stat.label}</span>
                {stat.icon}
              </div>
              <span className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">{stat.value}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30"
      >
        <span className="font-mono text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white/30 to-transparent" />
      </motion.div>
    </section>
  );
}
