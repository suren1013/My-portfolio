import React from 'react';
import { motion } from 'motion/react';
import { SectionHeader } from '../ui/SectionHeader';

const SKILLS = [
  {
    category: 'Simulation',
    items: ['ANSYS Workbench', 'FEA', 'Static Structural', 'Modal Analysis', 'Harmonic Response', 'Transient Thermal']
  },
  {
    category: 'CAD / Design',
    items: ['SolidWorks', 'AutoCAD']
  },
  {
    category: 'Embedded Systems',
    items: ['Arduino UNO', 'Relay Control', 'Solenoid Valves', 'TDS Sensors']
  },
  {
    category: 'Programming',
    items: ['Python', 'C/C++']
  },
  {
    category: 'Media Production',
    items: ['Adobe Premiere Pro', 'After Effects', 'CapCut']
  }
];

export function Skills() {
  return (
    <section id="skills" className="py-24 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeader title="Skills" subtitle="03. Technical Arsenal" />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {SKILLS.map((skillGroup, groupIdx) => (
            <motion.div
              key={groupIdx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: groupIdx * 0.1 }}
            >
              <h3 className="font-mono text-sm text-accent-500 uppercase tracking-widest mb-6 border-b border-white/10 pb-4">
                {skillGroup.category}
              </h3>
              
              <ul className="flex flex-col gap-3">
                {skillGroup.items.map((item, idx) => (
                  <li key={idx} className="group flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-white/20 group-hover:bg-accent-500 group-hover:scale-150 transition-all font-mono" />
                    <span className="text-white/70 group-hover:text-white transition-colors">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
