import React from 'react';
import { motion } from 'motion/react';
import { SectionHeader } from '../ui/SectionHeader';
import { Mail, MapPin } from 'lucide-react';

export function Contact() {
  return (
    <section id="contact" className="py-24 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeader title="Establish Link" subtitle="05. Contact" className="mb-12" />
        
        <p className="text-xl text-white/70 font-light max-w-2xl mb-16">
          Currently open for internship opportunities, collaborations, and engineering discussions.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.a 
            href="https://mail.google.com/mail/?view=cm&fs=1&to=rsurendher35@gmail.com" 
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0 }}
            className="group flex flex-col p-8 bg-[#0a0a0a] border border-white/5 hover:border-accent-500/30 transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-500/0 to-transparent group-hover:via-accent-500/50 transition-all duration-500" />
            <div className="w-12 h-12 mb-6 rounded-full border border-white/10 flex items-center justify-center bg-white/5 group-hover:bg-accent-500/10 group-hover:border-accent-500/30 transition-all">
              <Mail size={20} className="group-hover:text-accent-500 transition-colors" />
            </div>
            <span className="font-mono text-xs uppercase tracking-widest text-white/40 mb-2">Email</span>
            <span className="font-display text-base md:text-lg text-white/80 group-hover:text-white transition-colors truncate">rsurendher35@gmail.com</span>
          </motion.a>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group flex flex-col p-8 bg-[#0a0a0a] border border-white/5 hover:border-white/20 transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/0 to-transparent group-hover:via-white/50 transition-all duration-500" />
            <div className="w-12 h-12 mb-6 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
              <MapPin size={20} className="text-white/60 group-hover:text-white transition-colors" />
            </div>
            <span className="font-mono text-xs uppercase tracking-widest text-white/40 mb-2">Base</span>
            <span className="font-display text-base md:text-lg text-white/80 group-hover:text-white transition-colors">Chennai, Tamil Nadu</span>
          </motion.div>

          <motion.a 
            href="https://linkedin.com/in/surendher-r" 
            target="_blank" 
            rel="noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group flex flex-col p-8 bg-[#0a0a0a] border border-white/5 hover:border-[#0077b5]/50 transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#0077b5]/0 to-transparent group-hover:via-[#0077b5]/50 transition-all duration-500" />
            <div className="w-12 h-12 mb-6 rounded-full border border-white/10 flex items-center justify-center bg-white/5 group-hover:bg-[#0077b5]/10 group-hover:border-[#0077b5]/30 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60 group-hover:text-[#0077b5] transition-colors"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </div>
            <span className="font-mono text-xs uppercase tracking-widest text-white/40 mb-2">LinkedIn</span>
            <span className="font-display text-base md:text-lg text-white/80 group-hover:text-white transition-colors truncate">linkedin.com/in/surendher-r</span>
          </motion.a>
        </div>
      </div>
    </section>
  );
}
