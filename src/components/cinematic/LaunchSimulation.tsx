import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, invalidate } from '@react-three/fiber';
import { ScrollControls, Scroll, useScroll, Stars, Environment, Html, useProgress } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import { create } from 'zustand';
import { Rocket } from './Rocket';
import { LaunchInfrastructure } from './LaunchInfrastructure';

export const useQualityStore = create<{
  isMobile: boolean;
  isTablet: boolean;
  dpr: number;
  quality: 'high' | 'medium' | 'low';
}>((set) => {
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const isTablet = typeof window !== 'undefined' ? (window.innerWidth >= 768 && window.innerWidth < 1024) : false;
  return {
    isMobile,
    isTablet,
    dpr: typeof window !== 'undefined' ? (isMobile ? Math.min(1.25, window.devicePixelRatio || 1) : isTablet ? Math.min(1.5, window.devicePixelRatio || 1) : window.devicePixelRatio || 1) : 1,
    quality: isMobile ? 'low' : isTablet ? 'medium' : 'high',
  };
});

function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.matchMedia('(hover: hover) and (pointer: fine)').matches);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    // Add global style to hide native cursor
    const style = document.createElement('style');
    style.innerHTML = `* { cursor: none !important; }`;
    document.head.appendChild(style);

    let activeHoverType = 'none';
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      let nextTargetX = e.clientX;
      let nextTargetY = e.clientY;
      const target = e.target as HTMLElement | null;
      
      const link = target?.closest('a');
      const btn = target?.closest('button');
      const isPointer = target && window.getComputedStyle(target).cursor === 'pointer';
      
      activeHoverType = 'none';
      if (btn) {
        activeHoverType = 'button';
        // magnetic pull
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        nextTargetX = nextTargetX + (centerX - nextTargetX) * 0.15;
        nextTargetY = nextTargetY + (centerY - nextTargetY) * 0.15;
      } else if (link) {
        activeHoverType = 'link';
      } else if (isPointer) {
        activeHoverType = 'pointer';
      }

      targetX = nextTargetX;
      targetY = nextTargetY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      // Fast but smooth interpolation
      currentX += (targetX - currentX) * 0.35;
      currentY += (targetY - currentY) * 0.35;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
        
        if (activeHoverType === 'button') {
          cursorRef.current.style.width = '24px';
          cursorRef.current.style.height = '24px';
          cursorRef.current.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
          cursorRef.current.style.borderColor = 'rgba(255, 255, 255, 0.9)';
          cursorRef.current.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.2)';
        } else if (activeHoverType === 'link' || activeHoverType === 'pointer') {
          cursorRef.current.style.width = '20px';
          cursorRef.current.style.height = '20px';
          cursorRef.current.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          cursorRef.current.style.borderColor = 'rgba(255, 255, 255, 0.7)';
          cursorRef.current.style.boxShadow = 'none';
        } else {
          cursorRef.current.style.width = '12px';
          cursorRef.current.style.height = '12px';
          cursorRef.current.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
          cursorRef.current.style.borderColor = 'rgba(255, 255, 255, 0.6)';
          cursorRef.current.style.boxShadow = 'none';
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      document.head.removeChild(style);
    };
  }, [isDesktop]);

  if (!isDesktop) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      <div 
        ref={cursorRef}
        className="absolute top-0 left-0 rounded-full border transition-[width,height,background-color,border-color,box-shadow] duration-200 ease-out flex items-center justify-center"
        style={{
          width: '12px',
          height: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderColor: 'rgba(255, 255, 255, 0.6)',
        }}
      />
    </div>
  );
}

function GlassTextPill({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`relative inline-block bg-[#1a1a1a]/40 backdrop-blur-sm md:backdrop-blur-[16px] border border-white/[0.15] rounded-[10px] px-5 py-2 shadow-[0_4px_16px_rgba(0,0,0,0.3)] overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-40 pointer-events-none" />
      <div className="absolute inset-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] rounded-[10px] pointer-events-none" />
      <span className="relative z-10" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
        {children}
      </span>
    </div>
  );
}

function FadeBlock({ children, topVH }: { children: React.ReactNode, topVH: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = useScroll();
  
  useFrame(() => {
    if (!ref.current) return;
    const t = scroll.offset;
    const elementCenterT = topVH / 2400; 
    const dist = t - elementCenterT;
    
    let opacity = 0;
    let yOffset = 0;
    
    const visibleHalfWidth = 0.045; // slightly wider than 1 viewport to ensure readability
    const fadeRange = 0.015;
    
    const absDist = Math.abs(dist);
    
    if (absDist < visibleHalfWidth) {
      if (absDist > visibleHalfWidth - fadeRange) {
         // Fading region
         const fadeProgress = (visibleHalfWidth - absDist) / fadeRange; // 0 to 1
         opacity = fadeProgress * fadeProgress * (3 - 2 * fadeProgress); // ease in out
         
         if (dist < 0) {
            yOffset = (1 - fadeProgress) * 50; 
         } else {
            yOffset = -(1 - fadeProgress) * 50;
         }
      } else {
         // Fully solid
         opacity = 1;
         yOffset = 0;
      }
    }
    
    ref.current.style.opacity = opacity.toString();
    ref.current.style.transform = `translate3d(0, ${yOffset}px, 0)`;
  });

  return (
    <div ref={ref} className="w-full" style={{ opacity: 0, transform: 'translate3d(0, 50px, 0)', willChange: 'opacity, transform' }}>
      {children}
    </div>
  );
}

function LoadingScreen() {
  const { progress, active } = useProgress();
  const [show, setShow] = useState(true);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (progress === 100) {
      const t1 = setTimeout(() => setOpacity(0), 500);
      const t2 = setTimeout(() => setShow(false), 1500);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [progress]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-[#020611] flex flex-col items-center justify-center transition-opacity duration-1000" style={{ opacity }}>
      <div className="text-white/80 font-mono text-sm tracking-widest mb-6">INITIALIZING MISSION...</div>
      <div className="w-64 h-[2px] bg-white/10 overflow-hidden relative rounded-full">
        <div className="absolute top-0 left-0 h-full bg-white transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-6 font-mono text-xs tracking-wider text-white/50 h-4">
        {progress < 100 ? (
          progress < 40 ? 'Loading Flight Systems...' :
          progress < 80 ? 'Loading Vehicle Geometry...' : 'Calibrating Navigation...'
        ) : 'Mission Ready.'}
      </div>
    </div>
  );
}

import { create } from 'zustand';

const useAudioStore = create<{
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  showButton: boolean;
  setShowButton: (show: boolean) => void;
}>((set) => ({
  enabled: false,
  setEnabled: (enabled) => set({ enabled }),
  showButton: false,
  setShowButton: (show) => set({ showButton: show }),
}));

function AmbientAudio() {
  const enabled = useAudioStore((s) => s.enabled);
  const setShowButton = useAudioStore((s) => s.setShowButton);
  const audioCtx = useRef<AudioContext | null>(null);
  const rumbleGain = useRef<GainNode | null>(null);
  const windGain = useRef<GainNode | null>(null);
  const scroll = useScroll();

  useEffect(() => {
    if (!enabled) {
      if (audioCtx.current) {
        audioCtx.current.suspend();
      }
      return;
    }

    if (!audioCtx.current) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtx.current = ctx;

      const master = ctx.createGain();
      master.gain.value = 0.8;
      master.connect(ctx.destination);

      // Rumble (Brown noise)
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.05 * white) / 1.05;
        lastOut = output[i];
        output[i] *= 3.5;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 150;
      const rGain = ctx.createGain();
      rGain.gain.value = 0.1; // initial pre-launch
      rumbleGain.current = rGain;
      noise.connect(filter).connect(rGain).connect(master);
      noise.start();

      // Wind (Pink noise)
      const windBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const windOut = windBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        windOut[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        windOut[i] *= 0.11;
        b6 = white * 0.115926;
      }
      const windNoise = ctx.createBufferSource();
      windNoise.buffer = windBuffer;
      windNoise.loop = true;
      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.value = 800;
      const wGain = ctx.createGain();
      wGain.gain.value = 0.1;
      windGain.current = wGain;
      windNoise.connect(windFilter).connect(wGain).connect(master);
      windNoise.start();
    }
    
    if (audioCtx.current.state === 'suspended') {
      audioCtx.current.resume();
    }
  }, [enabled]);

  const lastProgress = useRef(0);

  useFrame(() => {
    const progress = scroll.offset;
    // Filter out sudden jumps (e.g. if scroll.offset bounces to 0 for a single frame during transitions)
    let isJump = false;
    if (Math.abs(progress - lastProgress.current) > 0.2 && lastProgress.current !== 0) {
      isJump = true;
    }
    
    if (!isJump) {
      if (progress < 0.08) {
         setShowButton(true);
      } else {
         setShowButton(false);
      }
      lastProgress.current = progress;
    }

    if (!enabled || !audioCtx.current) return;
      
    if (rumbleGain.current && windGain.current) {
       if (progress < 0.35) {
         rumbleGain.current.gain.setTargetAtTime(0.05, audioCtx.current.currentTime, 0.5);
         windGain.current.gain.setTargetAtTime(0.05, audioCtx.current.currentTime, 0.5);
       } else if (progress < 0.55) {
         rumbleGain.current.gain.setTargetAtTime(1.0, audioCtx.current.currentTime, 0.5);
         windGain.current.gain.setTargetAtTime(0.2, audioCtx.current.currentTime, 0.5);
       } else if (progress < 0.8) {
         rumbleGain.current.gain.setTargetAtTime(0.6, audioCtx.current.currentTime, 1.0);
         windGain.current.gain.setTargetAtTime(0.5, audioCtx.current.currentTime, 1.0);
       } else {
         rumbleGain.current.gain.setTargetAtTime(0.0, audioCtx.current.currentTime, 2.0);
         windGain.current.gain.setTargetAtTime(0.0, audioCtx.current.currentTime, 2.0);
       }
    }
  });

  return null;
}

function DynamicStarfield() {
  const bgRef = useRef<THREE.Group>(null);
  const midRef = useRef<THREE.Group>(null);
  const fgRef = useRef<THREE.Group>(null);
  const dustRef = useRef<THREE.Group>(null);
  const { quality } = useQualityStore();

  const getStarCount = (base: number) => {
    if (quality === 'low') return Math.floor(base * 0.4);
    if (quality === 'medium') return Math.floor(base * 0.7);
    return base;
  };

  useFrame((state) => {
    // Parallax effect: The closer the layer, the less it follows the camera perfectly (so it moves relative to camera)
    if (bgRef.current) bgRef.current.position.y = state.camera.position.y * 0.999;
    if (midRef.current) midRef.current.position.y = state.camera.position.y * 0.995;
    if (fgRef.current) fgRef.current.position.y = state.camera.position.y * 0.985;
    if (dustRef.current) dustRef.current.position.y = state.camera.position.y * 0.997;
  });

  return (
    <>
      {/* Background: Very distant, almost no motion */}
      <group ref={bgRef}>
        <Stars radius={800} depth={200} count={getStarCount(5000)} factor={3} saturation={0.8} speed={0.05} fade />
      </group>
      {/* Mid: Slower motion */}
      <group ref={midRef}>
        <Stars radius={400} depth={150} count={getStarCount(2500)} factor={5} saturation={0.6} speed={0.15} fade />
      </group>
      {/* Foreground: Tiny nearby stars, slightly more motion */}
      <group ref={fgRef}>
        <Stars radius={200} depth={100} count={getStarCount(1000)} factor={2.5} saturation={0.4} speed={0.3} fade />
      </group>
      
      {/* Faint Nebula Dust / Milky Way band */}
      <group ref={dustRef}>
        <mesh rotation={[Math.PI / 4, 0, Math.PI / 6]}>
          <sphereGeometry args={[450, 32, 32]} />
          <meshBasicMaterial color="#1a0b2e" transparent opacity={0.15} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh rotation={[-Math.PI / 6, Math.PI / 3, 0]}>
          <sphereGeometry args={[460, 32, 32]} />
          <meshBasicMaterial color="#0b1a2e" transparent opacity={0.15} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>
    </>
  );
}

function AtmosphereColor() {
  const scroll = useScroll();
  const colorDawn = useMemo(() => new THREE.Color('#040e1f'), []);
  const colorSpace = useMemo(() => new THREE.Color('#000000'), []);
  
  useFrame((state) => {
    const t = scroll.offset;
    if (state.scene.background && (state.scene.background as THREE.Color).isColor) {
      const bgColor = state.scene.background as THREE.Color;
      if (t < 0.25) {
        bgColor.copy(colorDawn); // Dawn deep blue
      } else if (t < 0.6) {
        const progress = (t - 0.25) / 0.35;
        // Exponential fade to black for space transition
        const eased = Math.pow(progress, 1.5);
        bgColor.lerpColors(colorDawn, colorSpace, eased);
      } else {
        bgColor.copy(colorSpace);
      }
    }
  });
  return null;
}

// Scene components
function LaunchEnvironment() {
  const scroll = useScroll();
  const earthRef = useRef<THREE.Mesh>(null);
  const padLightRef = useRef<THREE.PointLight>(null);
  const cameraTarget = useRef(new THREE.Vector3(0, 0, 0));
  const targetCamPos = useMemo(() => new THREE.Vector3(), []);
  const targetLook = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const t = scroll.offset;

    // Pad Ignition Light (30-40%)
    if (padLightRef.current) {
      if (t >= 0.30 && t < 0.40) {
        const intensityProgress = (t - 0.30) / 0.10;
        padLightRef.current.intensity = intensityProgress * 800; // Increased intensity for better lighting
        padLightRef.current.position.y = -8 + (Math.random() - 0.5); // flickers slightly
      } else if (t >= 0.40 && t < 0.50) {
        // Fade out
        const fadeProgress = (0.50 - t) / 0.10;
        padLightRef.current.intensity = fadeProgress * 800;
      } else {
        padLightRef.current.intensity = 0;
      }
    }

    let camX = 0;
    let camY = 2;
    let camZ = 15;
    let lookY = 2;

    if (t < 0.15) {
      // Pad, pan up slightly with slow acceleration
      // Start low to make the rocket feel massive
      const progress = t / 0.15;
      camY = 0 + Math.pow(progress, 2) * 4;
      lookY = 8 + Math.pow(progress, 2) * 2;
      camZ = 22 - progress * 4;
    } else if (t < 0.40) {
      // Pre-launch & Ignition, orbit slightly and slow framing
      const progress = (t - 0.15) / 0.25;
      camY = 4 + Math.sin(progress * Math.PI) * 1;
      lookY = 6;
      camZ = 18 + Math.cos(progress * Math.PI * 0.5) * 6;
      camX = Math.sin(progress * Math.PI * 0.5) * 8;
    } else if (t < 0.55) {
      // Liftoff - low angle tracking shot
      camX = THREE.MathUtils.lerp(state.camera.position.x, 0, 0.05);
      const liftoffProgress = (t - 0.40) / 0.15;
      camY = 4 + Math.pow(liftoffProgress, 1.5) * 78;
      lookY = 6 + Math.pow(liftoffProgress, 1.5) * 85;
      camZ = 24 - liftoffProgress * 8; 
    } else if (t < 0.80) {
      // Ascent, Max-Q, Stage Sep - dramatic wide tracking
      const ascentProgress = (t - 0.55) / 0.25;
      camY = 82 + ascentProgress * 800;
      lookY = 91 + ascentProgress * 800;
      camZ = 16 + Math.sin(ascentProgress * Math.PI) * 12;
    } else {
      // Orbit - slow graceful drift
      const orbitProgress = (t - 0.80) / 0.20;
      camY = 882;
      lookY = 891;
      camZ = 16 - orbitProgress * 10;
      camX = Math.sin(orbitProgress * Math.PI * 0.2) * 6;
    }

    // Subtle camera orbiting controlled by mouse movement
    const mouseX = state.pointer.x * 2;
    const mouseY = state.pointer.y * 2;

    // Camera shake effects
    let shakeX = 0;
    let shakeY = 0;
    let shakeZ = 0;
    
    // Pre-ignition rumble (35-40%)
    if (t > 0.35 && t < 0.40) {
      const shakeIntensity = 0.02 * ((t - 0.35) / 0.05);
      shakeX = (Math.random() - 0.5) * shakeIntensity;
      shakeY = (Math.random() - 0.5) * shakeIntensity;
      shakeZ = (Math.random() - 0.5) * shakeIntensity;
    }

    // Liftoff shake (40-55%)
    if (t >= 0.40 && t < 0.55) {
      const shakeIntensity = 0.1 * Math.sin(((t - 0.40) / 0.15) * Math.PI);
      shakeX = (Math.random() - 0.5) * shakeIntensity;
      shakeY = (Math.random() - 0.5) * shakeIntensity;
      shakeZ = (Math.random() - 0.5) * shakeIntensity;
    }
    // Max-Q shake (70-80%)
    if (t > 0.70 && t < 0.80) {
      const shakeIntensity = 0.15 * Math.sin(((t - 0.70) / 0.10) * Math.PI);
      shakeX = (Math.random() - 0.5) * shakeIntensity;
      shakeY = (Math.random() - 0.5) * shakeIntensity;
      shakeZ = (Math.random() - 0.5) * shakeIntensity;
    }

    // Tiny natural camera drift
    const driftX = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    const driftY = Math.cos(state.clock.elapsedTime * 0.15) * 0.1;

    // Cinematic stabilization (inertial damping)
    targetCamPos.set(camX + mouseX + shakeX + driftX, camY + mouseY + shakeY + driftY, camZ + shakeZ);
    state.camera.position.lerp(targetCamPos, 0.03);
    targetLook.set(0, lookY, 0);
    cameraTarget.current.lerp(targetLook, 0.04);
    state.camera.lookAt(cameraTarget.current);

    // Imperceptible focus breathing
    if (state.camera instanceof THREE.PerspectiveCamera) {
      const targetFov = 45 + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, targetFov, 0.05);
      state.camera.updateProjectionMatrix();
    }

    // Earth curvature appearing higher up
    if (earthRef.current) {
      if (t > 0.7) {
        earthRef.current.position.y = THREE.MathUtils.lerp(earthRef.current.position.y, camY - 200, 0.05);
      } else {
        earthRef.current.position.y = -2000;
      }
    }

    // Dynamic Atmosphere & Fog
    if (state.scene.fog) {
      const fog = state.scene.fog as THREE.Fog;
      if (t < 0.25) {
        fog.near = 15;
        fog.far = 150;
      } else if (t < 0.6) {
        const progress = (t - 0.25) / 0.35;
        fog.near = 15 + progress * 200;
        fog.far = 150 + progress * 1000;
      } else {
        fog.near = 1000;
        fog.far = 2000;
      }
    }
  });

  return (
    <>
      <fog attach="fog" color="#040e1f" near={15} far={150} />
      <Environment preset="city" background={false} environmentIntensity={0.8} />
      {/* Soft global GI & natural ambient fill */}
      <ambientLight intensity={0.5} color="#b4d4ff" />
      
      {/* Primary Sunlight (Golden Hour / Dawn) - Softer highlights */}
      <directionalLight 
        position={[30, 40, 20]} 
        intensity={3.8} 
        color="#ffe3cc" 
        castShadow 
        shadow-bias={-0.0015} 
        shadow-normalBias={0.08}
        shadow-mapSize={[2048, 2048]} 
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-near={1}
        shadow-camera-far={120}
      />
      
      {/* Secondary Fill (Sky reflection) */}
      <directionalLight position={[-20, 10, -20]} intensity={1.5} color="#88bbee" />
      
      {/* Indirect bounce lighting from the pad */}
      <directionalLight position={[0, -10, 0]} intensity={0.8} color="#4466aa" />
      
      {/* Strong Cinematic Rim Light */}
      <directionalLight position={[-10, 20, -30]} intensity={4.2} color="#ffffff" />
      
      {/* Background Stars - Dynamic component that follows camera */}
      <DynamicStarfield />

      {/* Earth Curvature */}
      <mesh receiveShadow ref={earthRef} position={[0, -2000, 0]}>
        <sphereGeometry args={[250, 128, 128]} />
        <meshPhysicalMaterial 
          color="#000e2b" 
          emissive="#001844" 
          emissiveIntensity={0.4} 
          roughness={0.4} 
          metalness={0.3} 
          clearcoat={0.3}
          clearcoatRoughness={0.2} 
        />
      </mesh>

      {/* Launch Infrastructure (Pad, Tower, GSE) */}
      <LaunchInfrastructure padLightRef={padLightRef} />
    </>
  );
}

// HTML Overlay Content
function MissionOverlay() {
  const sectionStyle = "w-full h-screen flex flex-col justify-center px-[5vw] md:px-[10vw]";
  
  return (
    <Scroll html style={{ width: '100%', height: '100%' }}>
      <div className="h-[2500vh] w-full relative">
        
        {/* 01 LAUNCH PAD (Page 1) */}
        <div className="w-full h-screen flex flex-col justify-end md:justify-center pt-[15vh] md:pt-0 px-[4vw] md:px-[5vw] absolute top-[0vh]">
          <div className="absolute inset-x-0 top-0 h-[60vh] bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none -z-10" />
          <FadeBlock topVH={0}>
            <div className="w-full max-w-[92vw] sm:max-w-2xl lg:max-w-3xl text-white relative z-10 ml-auto mr-0 mt-[25vh] xl:mt-0">
              <div className="backdrop-blur-lg md:backdrop-blur-[40px] bg-gradient-to-b from-[#2a2d36]/70 to-[#1a1c23]/80 md:from-[#2a2d36]/50 md:to-[#1a1c23]/60 border border-white/[0.15] p-6 sm:p-8 md:p-10 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.6)] relative overflow-hidden transition-all duration-700 hover:bg-[#2a2d36]/80 md:hover:bg-[#2a2d36]/60 ring-1 ring-white/10 before:absolute before:inset-0 before:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyIvPjwvc3ZnPg==')] before:opacity-50">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.12] via-transparent to-black/50 pointer-events-none" />
                <div className="absolute inset-0 shadow-[inset_0_1px_2px_rgba(255,255,255,0.5),inset_0_-1px_2px_rgba(0,0,0,0.5)] pointer-events-none rounded-2xl" />
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 text-white/60 font-mono text-xs mb-4 md:mb-6 tracking-widest">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_12px_#4ade80]" />
                    T-MINUS 10:00:00
                  </div>
                  <h1 className="text-[clamp(2rem,9vw,6rem)] whitespace-nowrap font-black mb-4 md:mb-5 uppercase tracking-tighter drop-shadow-xl text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 leading-none">SURENDHER R</h1>
                  <div className="flex flex-col items-start gap-3 mb-6 md:mb-8">
                    <GlassTextPill className="text-lg md:text-2xl text-white/90 font-light tracking-wide">
                      Mechanical Engineering Student
                    </GlassTextPill>
                  </div>
                  
                  <div className="font-mono text-[9px] sm:text-[10px] md:text-xs text-white/70 flex justify-between sm:justify-start sm:gap-6 md:gap-8 border-t border-white/10 pt-5 md:pt-6 mt-4 w-full">
                    <div className="flex flex-col whitespace-nowrap">
                      <span className="text-white/40 mb-1">VEHICLE</span>
                      <span className="tracking-widest">HEAVY-LIFT ORBITAL</span>
                    </div>
                    <div className="flex flex-col border-l border-white/10 pl-3 sm:pl-6 md:pl-8 whitespace-nowrap">
                      <span className="text-white/40 mb-1">STATUS</span>
                      <span className="text-green-400 tracking-widest drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">NOMINAL</span>
                    </div>
                    <div className="flex flex-col border-l border-white/10 pl-3 sm:pl-6 md:pl-8 whitespace-nowrap">
                      <span className="text-white/40 mb-1">ACADEMIC</span>
                      <span className="tracking-widest font-bold text-white">CGPA 9.06</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeBlock>
        </div>

        {/* 02 PRE-LAUNCH (Page 4.75) */}
        <div className={`${sectionStyle} absolute top-[375vh] items-end text-right`}>
          <FadeBlock topVH={375}>
            <div className="max-w-md text-white inline-block">
              <span className="font-mono text-sm tracking-widest text-blue-400 mb-2 block drop-shadow-md">02 / PROPELLANT LOADING</span>
              <h2 className="text-4xl font-black mb-6 uppercase border-b border-white/20 pb-4 drop-shadow-lg">Foundation</h2>
              <div className="font-mono text-xs uppercase bg-[#1a1c23]/80 md:bg-[#1a1c23]/60 border border-white/10 p-6 backdrop-blur-md md:backdrop-blur-xl text-left shadow-2xl">
                <div className="mb-4">
                   <div className="text-white/50">Core System</div>
                   <div className="text-lg text-white">B.Tech Mechanical Engineering</div>
                   <div className="text-green-400">VIT Chennai / 2024-Present</div>
                </div>
                <div>
                   <div className="text-white/50">Auxiliary</div>
                   <div className="text-lg text-white">Intro to Aerospace Engineering</div>
                   <div className="text-green-400">NPTEL / Score: 68/100</div>
                </div>
              </div>
            </div>
          </FadeBlock>
        </div>

        {/* 03 IGNITION (Page 8.5) */}
        <div className={`${sectionStyle} absolute top-[750vh]`}>
          <FadeBlock topVH={750}>
            <div className="max-w-md text-white">
              <span className="font-mono text-sm tracking-widest text-orange-500 mb-2 block animate-pulse drop-shadow-md">03 / ENGINE IGNITION</span>
              <h2 className="text-4xl font-black mb-6 uppercase border-b border-white/20 pb-4 drop-shadow-lg">Onboard Systems</h2>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs shadow-2xl">
                {['ANSYS Workbench', 'SolidWorks', 'MATLAB', 'Python', 'Arduino', 'C/C++'].map(sys => (
                  <div key={sys} className="border border-orange-500/30 bg-orange-900/40 p-3 flex justify-between items-center backdrop-blur-md md:backdrop-blur-xl">
                    {sys}
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_10px_#f97316]" />
                  </div>
                ))}
              </div>
            </div>
          </FadeBlock>
        </div>

        {/* 04 LIFTOFF (Page 11.5) */}
        <div className={`${sectionStyle} absolute top-[1050vh] items-end text-right`}>
          <FadeBlock topVH={1050}>
            <div className="max-w-md text-white inline-block">
              <span className="font-mono text-sm tracking-widest text-white/50 mb-2 block drop-shadow-md">04 / LIFTOFF</span>
              <h2 className="text-4xl font-black mb-6 uppercase border-b border-white/20 pb-4 drop-shadow-lg">Clear the Tower</h2>
              <div className="font-mono text-xs uppercase bg-[#1a1c23]/80 md:bg-[#1a1c23]/60 border border-white/10 p-6 backdrop-blur-md md:backdrop-blur-xl text-left relative overflow-hidden shadow-2xl">
                 <div className="text-lg text-white mb-2 font-bold relative z-10">Ascent Profile</div>
                 <p className="text-white/70 normal-case mb-4 tracking-normal relative z-10">Pitch and roll program initiated. Vehicle clearing launch pad structures.</p>
                 <div className="text-green-400 relative z-10">SYSTEMS NOMINAL</div>
              </div>
            </div>
          </FadeBlock>
        </div>

        {/* 05 ASCENT (Page 14.75) */}
        <div className={`${sectionStyle} absolute top-[1375vh] items-end text-right`}>
          <FadeBlock topVH={1375}>
            <div className="max-w-md text-white inline-block">
              <span className="font-mono text-sm tracking-widest text-white/50 mb-2 block drop-shadow-md">05 / ASCENT PHASE</span>
              <h2 className="text-4xl font-black mb-6 uppercase border-b border-white/20 pb-4 drop-shadow-lg">Mission: Metamaterials</h2>
              <div className="font-mono text-xs uppercase bg-black/60 border border-white/10 p-6 backdrop-blur-md md:backdrop-blur-xl text-left relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-2 text-white/10 text-6xl font-black">M1</div>
                <div className="text-lg text-white mb-2 font-bold relative z-10">Vibration Isolation Mount</div>
                <p className="text-white/70 normal-case mb-4 tracking-normal relative z-10">Designing re-entrant auxetic geometry requiring complex structural analysis to reduce transmissibility.</p>
                <div className="text-blue-300 relative z-10">FEA • ANSYS • METAMATERIALS</div>
              </div>
            </div>
          </FadeBlock>
        </div>

        {/* 06 MAX-Q (Page 18.5) */}
        <div className={`${sectionStyle} absolute top-[1750vh]`}>
          <FadeBlock topVH={1750}>
            <div className="max-w-md text-white">
              <span className="font-mono text-sm tracking-widest text-red-500 mb-2 block animate-pulse drop-shadow-md">06 / MAX-Q (DYNAMIC PRESSURE)</span>
              <h2 className="text-4xl font-black mb-6 uppercase border-b border-white/20 pb-4 drop-shadow-lg">Mission: Thermal</h2>
              <div className="font-mono text-xs uppercase bg-black/60 border border-red-500/30 p-6 backdrop-blur-md md:backdrop-blur-xl relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-2 text-red-500/10 text-6xl font-black">M2</div>
                <div className="text-lg text-white mb-2 font-bold relative z-10">Riser Optimisation</div>
                <p className="text-white/70 normal-case mb-4 tracking-normal relative z-10">Simulating transient thermal casting solidification accurately to extend solidification time within riser.</p>
                <div className="text-red-300 relative z-10">TRANSIENT THERMAL • MANUFACTURING</div>
              </div>
            </div>
          </FadeBlock>
        </div>

        {/* 07 STAGE SEP (Page 21) */}
        <div className={`${sectionStyle} absolute top-[2000vh] items-end`}>
          <FadeBlock topVH={2000}>
            <div className="max-w-md text-white text-right">
              <span className="font-mono text-sm tracking-widest text-white/50 mb-2 block drop-shadow-md">07 / STAGE SEPARATION</span>
              <h2 className="text-4xl font-black mb-6 uppercase border-b border-white/20 pb-4 drop-shadow-lg">Mission: IoT</h2>
              <div className="font-mono text-xs uppercase bg-black/60 border border-white/10 p-6 backdrop-blur-md md:backdrop-blur-xl text-left relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 p-2 text-white/10 text-6xl font-black">M3</div>
                 <div className="text-lg text-white mb-2 font-bold relative z-10">Smart Water Routing</div>
                 <p className="text-white/70 normal-case mb-4 tracking-normal relative z-10">Auto-segregate industrial effluent by TDS concentration. Patent applicability under review.</p>
                 <div className="text-blue-300 relative z-10">HARDWARE • IOT • SENSORS</div>
              </div>
            </div>
          </FadeBlock>
        </div>

        {/* 09 ORBIT (Page 23.5) */}
        <div className={`${sectionStyle} absolute top-[2250vh] items-center text-center`}>
          <FadeBlock topVH={2250}>
            <div className="max-w-2xl text-white inline-block">
              <span className="font-mono text-sm tracking-widest text-green-400 mb-4 block drop-shadow-md">09 / PAYLOAD DEPLOYMENT</span>
              <h2 className="text-5xl md:text-7xl font-black mb-8 uppercase drop-shadow-lg">Satellites in Orbit</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-12 shadow-2xl">
                <div className="bg-black/60 backdrop-blur-md md:backdrop-blur-xl p-6 border border-white/20 relative overflow-hidden">
                   <div className="absolute top-2 right-2 text-xs font-mono text-white/20">PAYLOAD-A</div>
                   <h3 className="text-xl font-bold mb-2 font-mono uppercase relative z-10">AI Casting Assistant</h3>
                   <p className="text-sm text-white/70 font-light relative z-10">Bridging mechanical engineering with AI. Outputs optimised riser configurations.</p>
                </div>
                <div className="bg-black/60 backdrop-blur-md md:backdrop-blur-xl p-6 border border-white/20 relative overflow-hidden">
                   <div className="absolute top-2 right-2 text-xs font-mono text-white/20">PAYLOAD-B</div>
                   <h3 className="text-xl font-bold mb-2 font-mono uppercase relative z-10">Portfolio Engine</h3>
                   <p className="text-sm text-white/70 font-light relative z-10">Deployed fully interactive 3D spaceflight simulation for technical demonstration.</p>
                </div>
              </div>
            </div>
          </FadeBlock>
        </div>

        {/* 10 DEEP SPACE (Page 25) */}
        <div className={`${sectionStyle} absolute top-[2400vh] items-center text-center`}>
          <FadeBlock topVH={2400}>
            <div className="max-w-3xl text-white inline-block">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl whitespace-nowrap font-black mb-5 uppercase tracking-tighter drop-shadow-xl text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">SURENDHER R</h1>
            <div className="flex flex-col items-center gap-3 mb-10">
              <GlassTextPill className="text-xl md:text-2xl text-white/90 font-light tracking-wide">
                Mechanical Engineering Student
              </GlassTextPill>
            </div>

            <div className="flex justify-center mb-12 relative">
              {/* Radial vignette behind the tagline area */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] h-[300%] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.3)_0%,transparent_75%)] pointer-events-none -z-10" />
              
              <div className="relative font-mono text-sm text-white bg-[#1a1a1a]/30 backdrop-blur-md md:backdrop-blur-[18px] border border-white/[0.12] rounded-[14px] px-8 py-4 shadow-[0_8px_24px_rgba(0,0,0,0.2)] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-30 pointer-events-none" />
                <div className="absolute inset-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] rounded-[14px] pointer-events-none" />
                <span 
                  className="relative z-10 tracking-[0.2em] font-semibold"
                  style={{ textShadow: '0 2px 12px rgba(0,0,0,0.45)' }}
                >
                  SEEKING NEXT GENERATION AEROSPACE OPPORTUNITIES
                </span>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-center gap-6">
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=rsurendher35@gmail.com" target="_blank" rel="noreferrer" className="px-8 py-4 bg-white text-black font-bold font-mono text-sm uppercase tracking-wider hover:bg-gray-200 transition-colors pointer-events-auto">
                Establish Comms Link
              </a>
              <a href="https://linkedin.com/in/surendher-r" target="_blank" rel="noreferrer" className="px-8 py-4 border border-white/30 bg-black/40 backdrop-blur-md text-white font-bold font-mono text-sm uppercase tracking-wider hover:bg-white/10 transition-colors pointer-events-auto">
                View Telemetry (LinkedIn)
              </a>
            </div>
          </div>
          </FadeBlock>
        </div>

      </div>
    </Scroll>
  );
}

function GlobalUI() {
  const enabled = useAudioStore((s) => s.enabled);
  const setEnabled = useAudioStore((s) => s.setEnabled);
  const showButton = useAudioStore((s) => s.showButton);
  const { progress } = useProgress();
  const [hasLoaded, setHasLoaded] = useState(false);
  
  useEffect(() => {
    if (progress === 100) {
      const t = setTimeout(() => setHasLoaded(true), 2000); // Wait for loading screen to fade
      return () => clearTimeout(t);
    }
  }, [progress]);

  const isVisible = hasLoaded && showButton;

  return (
    <button 
      onClick={() => setEnabled(!enabled)}
      className={`fixed top-8 right-8 z-[200] w-12 h-12 rounded-full bg-white/5 border border-white/20 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-opacity duration-700 pointer-events-auto ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      aria-label="Toggle Sound"
    >
      {enabled ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
      )}
    </button>
  );
}

export default function LaunchSimulation() {
  const { quality, dpr } = useQualityStore();
  return (
    <div className="w-full h-screen bg-black overflow-hidden cursor-none relative">
      <CustomCursor />
      <LoadingScreen />
      <GlobalUI />
      <Canvas 
        shadows={quality === 'high'}
        dpr={dpr}
        frameloop="demand"
        camera={{ position: [0, 2, 15], fov: 45, near: 0.5, far: 3000 }} 
        gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0, antialias: quality !== 'low', logarithmicDepthBuffer: false }}
      >
        <color attach="background" args={['#040e1f']} />
        
        <ScrollControls pages={25} damping={0.25}>
          <AmbientAudio />
          <AtmosphereColor />
          <LaunchEnvironment />
          <Rocket />
          <MissionOverlay />
        </ScrollControls>
        
        <EffectComposer enableNormalPass={false} multisampling={quality === 'high' ? 4 : quality === 'medium' ? 2 : 0}>
          <Bloom luminanceThreshold={1.2} mipmapBlur={quality === 'high'} intensity={1.5} resolutionScale={quality === 'low' ? 0.5 : 1} />
          {quality !== 'low' && <Noise opacity={0.03} />}
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
          {quality === 'high' && <ChromaticAberration offset={new THREE.Vector2(0.0005, 0.0005)} radialModulation={false} modulationOffset={0} />}
        </EffectComposer>
      </Canvas>
      
      {/* Scroll indicator */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 text-white/30 font-mono text-xs uppercase tracking-widest animate-pulse pointer-events-none">
        Scroll to launch
      </div>
    </div>
  );
}
