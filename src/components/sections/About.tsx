import React from 'react';
import { motion } from 'motion/react';
import { SectionHeader } from '../ui/SectionHeader';
import { Box, Cpu, Video } from 'lucide-react';

const TOOLS = [
  { name: 'ANSYS Workbench', icon: <Box size={24} className="group-hover:text-engineering-orange transition-colors" /> },
  { name: 'SolidWorks', icon: <Box size={24} className="group-hover:text-red-500 transition-colors" /> },
  { name: 'Arduino', icon: <Cpu size={24} className="group-hover:text-teal-500 transition-colors" /> },
  { name: 'Adobe Premiere Pro', icon: <Video size={24} className="group-hover:text-purple-500 transition-colors" /> },
];

export function About() {
  return (
    <section id="about" className="py-24 md:py-32 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHeader title="About" subtitle="01. Who I am" />

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl font-light">
              I'm a Mechanical Engineering student at VIT Chennai with a focus on{" "}
              <span className="text-white font-medium">FEA simulation</span>,{" "}
              <span className="text-white font-medium">CAD design</span>, and{" "}
              <span className="text-white font-medium">embedded systems</span>. 
              <br /><br />
              I build things that sit at the intersection of engineering fundamentals and real-world problem solving — from ANSYS simulations on metamaterial structures to Arduino-based industrial control systems.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-4"
          >
            {TOOLS.map((tool, idx) => (
              <div 
                key={idx}
                className="group relative flex flex-col items-center justify-center gap-4 p-6 border border-white/5 bg-[#0a0a0a] hover:bg-white/5 hover:border-white/10 transition-all cursor-crosshair"
              >
                <div className="text-white/40 mb-2">
                  {tool.icon}
                </div>
                <span className="font-mono text-xs text-center text-white/60 group-hover:text-white transition-colors">
                  {tool.name}
                </span>
                
                {/* Decorative corners */}
                <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
