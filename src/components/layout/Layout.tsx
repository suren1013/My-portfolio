import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { CursorGlow } from '../ui/CursorGlow';

const NAV_LINKS = [
  { name: 'About', href: '#about' },
  { name: 'Projects', href: '#projects' },
  { name: 'Skills', href: '#skills' },
  { name: 'Experience', href: '#education' },
  { name: 'Contact', href: '#contact' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-accent-500/30 selection:text-accent-200">
      <CursorGlow />
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-accent-500 origin-left z-50 pointer-events-none"
        style={{ scaleX }}
      />
      
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-40 transition-all duration-300 border-b border-white/0",
          isScrolled ? "bg-background/80 backdrop-blur-md border-white/5 py-4" : "bg-transparent py-6"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <a href="#" className="font-display font-bold text-xl tracking-tighter text-white group relative z-50">
            SR.
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-accent-500 transition-all duration-200 ease-out group-hover:w-full" />
          </a>
          
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-mono text-white/60 hover:text-white transition-colors relative group py-1"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent-500 transition-all duration-200 ease-out group-hover:w-full" />
              </a>
            ))}
          </nav>

          <button
            className="md:hidden relative z-50 text-white/80 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-background/95 backdrop-blur-xl transition-all duration-500 md:hidden flex items-center justify-center",
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <nav className="flex flex-col items-center gap-8">
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="font-display text-3xl font-bold text-white/80 hover:text-white hover:scale-105 transition-all"
              style={{
                transitionDelay: mobileMenuOpen ? `${i * 50}ms` : '0ms',
                transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(20px)',
                opacity: mobileMenuOpen ? 1 : 0
              }}
            >
              {link.name}
            </a>
          ))}
        </nav>
      </div>

      <main>{children}</main>

      <footer className="border-t border-white/5 py-12 text-center">
        <p className="text-white/60 text-sm">© 2026 Surendher R. All rights reserved.</p>
        <p className="font-mono text-xs text-white/30 mt-2">Built with React & Framer Motion.</p>
      </footer>
    </div>
  );
}
