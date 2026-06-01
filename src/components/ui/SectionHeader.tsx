import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export function SectionHeader({ title, subtitle, className }: { title: string; subtitle?: string; className?: string }) {
  return (
    <div className={cn("mb-12 md:mb-20", className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4 mb-4"
      >
        <div className="h-[1px] w-8 md:w-16 bg-accent-500/50" />
        <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-white uppercase">
          {title}
        </h2>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-accent-500/20 to-transparent" />
      </motion.div>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-white/60 font-mono text-sm md:text-base md:ml-12 md:pl-8 max-w-2xl"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
