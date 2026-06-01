import React from 'react';
import { motion } from 'motion/react';
import { SectionHeader } from '../ui/SectionHeader';

const EXPERIENCES = [
  {
    type: 'edu',
    title: 'B.Tech Mechanical Engineering',
    org: 'VIT Chennai',
    period: '2024–Present',
    stats: 'CGPA: 9.03'
  },
  {
    type: 'edu',
    title: 'Class XII CBSE',
    org: 'Bharathi Vidyalaya Sr. Sec. School',
    period: '2024',
    stats: '90.6% | Python: 100/100'
  },
  {
    type: 'edu',
    title: 'Class X CBSE',
    org: 'Bharathi Vidyalaya Sr. Sec. School',
    period: '2022',
    stats: '93%'
  }
];

const CERTIFICATIONS = [
  'NPTEL: Introduction to Aerospace Engineering — 68/100 (2025)',
  'German Language A1 — Grade A | VIT Chennai (2025–26)',
  'Control Systems Lab (Arduino) — VIT Chennai (2026)',
  '3D CAD Modelling — VIT Chennai (2026)'
];

export function Education() {
  return (
    <section id="education" className="py-24 md:py-32 px-6 bg-[#030303] relative">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20">
        <div>
          <SectionHeader title="Education" subtitle="04. Academic Background" className="mb-12" />
          
          <div className="relative border-l border-white/10 ml-3 md:ml-4 space-y-12 pb-8">
            {EXPERIENCES.map((exp, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative pl-8"
              >
                {/* Timeline node */}
                <span className="absolute -left-[5px] top-1 w-[10px] h-[10px] rounded-full bg-[#030303] border-2 border-accent-500" />
                
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-2">
                  <h3 className="font-display text-xl font-bold text-white">{exp.title}</h3>
                  <span className="font-mono text-xs text-accent-500">{exp.period}</span>
                </div>
                
                <h4 className="text-white/60 mb-3">{exp.org}</h4>
                <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 text-white/80 font-mono text-sm">
                  {exp.stats}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <SectionHeader title="Integrations" subtitle="Certifications & Clearances" className="mb-12" />
          
          <div className="flex flex-col gap-4">
            {CERTIFICATIONS.map((cert, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="group relative overflow-hidden bg-white/5 border border-white/10 p-6 hover:border-accent-500/50 transition-colors"
              >
                {/* Glowing edge effect on hover */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom" />
                
                <p className="font-mono text-sm text-white/80 group-hover:text-white transition-colors relative z-10 leading-relaxed">
                  {cert}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
