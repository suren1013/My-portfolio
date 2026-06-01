import React from 'react';
import { motion } from 'motion/react';
import { SectionHeader } from '../ui/SectionHeader';

const PROJECTS = [
  {
    category: 'SIMULATION',
    title: 'Vibration Isolation Mount',
    description: "Designed a vibration isolation mount using re-entrant auxetic (negative Poisson's ratio) geometry. Full ANSYS simulation chain: Static Structural → Pre-stressed Modal → Harmonic Response. Demonstrated measurable transmissibility reduction vs conventional mounts.",
    tags: ['ANSYS Workbench', 'FEA', 'Metamaterials']
  },
  {
    category: 'EMBEDDED SYSTEMS',
    title: 'Industrial Smart Water Routing System',
    description: 'Arduino-based embedded control system using TDS sensors, relays, and solenoid valves to auto-segregate industrial effluent by dissolved solids concentration. Low-TDS streams rerouted for reuse, cutting treatment load. Journal publication in preparation. Patent applicability under review.',
    tags: ['Arduino', 'Embedded C', 'TDS Sensors', 'IoT']
  },
  {
    category: 'SIMULATION',
    title: 'Riser Optimisation Study',
    description: 'Simulated casting solidification across multiple riser configurations using ANSYS Transient Thermal. Validated directional solidification principles — optimised riser placement extends solidification time within riser relative to casting body.',
    tags: ['ANSYS', 'Transient Thermal', 'Manufacturing']
  },
  {
    category: 'AI + ENGINEERING',
    title: 'AI-Powered Metal Casting Assistant',
    description: 'Web tool where users input casting dimensions and receive optimised riser configurations as output. Combines mechanical engineering domain knowledge with AI implementation. Bridges core engineering and AI',
    tags: ['Python', 'AI', 'Mechanical Engineering', 'Web App']
  },
  {
    category: 'WEB APP',
    title: 'Tamil Nadu Elections Live Dashboard',
    description: 'Real-time web application that tracked and updated winning seat counts for all parties during the Tamil Nadu elections. End-to-end product: data pipeline, dynamic UI, live deployment.',
    tags: ['React', 'Data Pipeline', 'Live Dashboard', 'Web Dev']
  },
  {
    category: 'MOBILE APP CONCEPT',
    title: 'Road Pulse — Pothole Detection App',
    description: 'Mobile application concept using smartphone accelerometers to detect potholes and generate geospatial heatmaps for road quality mapping. Proposed data pipelines to mapping platforms and municipal departments.',
    tags: ['Mobile', 'Accelerometer', 'Geospatial', 'Concept']
  }
];

export function Projects() {
  return (
    <section id="projects" className="py-24 md:py-32 px-6 bg-[#030303]">
      <div className="max-w-7xl mx-auto">
        <SectionHeader title="Projects" subtitle="02. Core Engineering & Dev" />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECTS.map((project, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative flex flex-col items-start p-8 border border-white/10 bg-[#0a0a0a] hover:bg-[#111] transition-colors"
            >
              {/* Subtle hover glow */}
              <div className="absolute inset-0 z-0 bg-gradient-to-b from-accent-500/0 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 w-full">
                <div className="flex justify-between items-start mb-6">
                  <span className="font-mono text-xs text-accent-500 tracking-wider">
                    [{project.category}]
                  </span>
                </div>
                
                <h3 className="font-display text-2xl font-bold text-white mb-4 group-hover:text-accent-50 transition-colors">
                  {project.title}
                </h3>
                
                <p className="text-white/60 text-sm leading-relaxed mb-10 font-light flex-grow">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mt-auto">
                  {project.tags.map(tag => (
                    <span key={tag} className="font-mono text-[10px] uppercase px-2 py-1 bg-white/5 border border-white/10 text-white/50">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
