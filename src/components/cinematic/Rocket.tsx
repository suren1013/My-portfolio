import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';

function ExhaustParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const scroll = useScroll();
  const particleCount = 2500;

  const [positions, velocities, lifetimes] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);
    const life = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 3;
      pos[i * 3 + 1] = -11 - Math.random() * 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 3;
      
      vel[i * 3] = (Math.random() - 0.5) * 1.5;
      vel[i * 3 + 1] = -1 - Math.random() * 3;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
      
      life[i] = Math.random();
    }
    return [pos, vel, life];
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const t = scroll.offset;
    const isLiftingOff = t > 0.40 && t < 0.85;
    
    const positionsAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    
    for (let i = 0; i < particleCount; i++) {
      if (isLiftingOff) {
        lifetimes[i] -= delta * 1.5;
        if (lifetimes[i] <= 0) {
          lifetimes[i] = 1.0;
          positionsAttr.array[i * 3] = (Math.random() - 0.5) * 2;
          positionsAttr.array[i * 3 + 1] = -10.5;
          positionsAttr.array[i * 3 + 2] = (Math.random() - 0.5) * 2;
        }
        
        positionsAttr.array[i * 3] += velocities[i * 3] * delta * 25;
        positionsAttr.array[i * 3 + 1] += velocities[i * 3 + 1] * delta * 25;
        positionsAttr.array[i * 3 + 2] += velocities[i * 3 + 2] * delta * 25;
      } else {
        positionsAttr.array[i * 3 + 1] = 10000;
      }
    }
    positionsAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.8}
        color="#ffaa44"
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function VentingParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const scroll = useScroll();
  const particleCount = 200;

  const [positions, lifetimes] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const life = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = 1.0;
      pos[i * 3 + 1] = 2.0 + Math.random();
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
      life[i] = Math.random();
    }
    return [pos, life];
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const t = scroll.offset;
    const isVenting = t < 0.40;
    
    const positionsAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    
    for (let i = 0; i < particleCount; i++) {
      if (isVenting) {
        lifetimes[i] -= delta * 0.5;
        if (lifetimes[i] <= 0) {
          lifetimes[i] = 1.0;
          positionsAttr.array[i * 3] = 1.0;
          positionsAttr.array[i * 3 + 1] = 2.0 + Math.random();
          positionsAttr.array[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
        }
        
        positionsAttr.array[i * 3] += delta * 1.5; 
        positionsAttr.array[i * 3 + 1] -= delta * 0.5;
      } else {
        positionsAttr.array[i * 3 + 1] = 10000;
      }
    }
    positionsAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.3} color="#ffffff" transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

export function Rocket() {
  const rocketRef = useRef<THREE.Group>(null);
  const stage1Ref = useRef<THREE.Group>(null);
  const engineGlowRef = useRef<THREE.PointLight>(null);
  const scroll = useScroll();

  useFrame((state) => {
    if (!rocketRef.current) return;
    
    const t = scroll.offset;

    // Phase animations
    if (t > 0.40) {
      let targetY = 0;
      if (t < 0.55) {
         const liftoffProgress = (t - 0.40) / 0.15;
         targetY = Math.pow(liftoffProgress, 2) * 80;
      } else if (t < 0.80) {
         const ascentProgress = (t - 0.55) / 0.25;
         targetY = 80 + ascentProgress * 800;
      } else {
         targetY = 880;
      }
      rocketRef.current.position.y = THREE.MathUtils.lerp(
        rocketRef.current.position.y,
        targetY, 
        0.1
      );
    } else {
      rocketRef.current.position.y = THREE.MathUtils.lerp(rocketRef.current.position.y, 0, 0.1);
    }

    // Engine Glow & Vibration
    if (engineGlowRef.current) {
      const plumeMat = (engineGlowRef as any).plumeMat;
      const plumeCoreMat = (engineGlowRef as any).plumeCoreMat;
      const diamonds = (engineGlowRef as any).diamonds;
      
      let intensity = 0;
      let opacity = 0;

      if (t >= 0.30 && t < 0.40) {
        intensity = (t - 0.30) * 10;
        opacity = intensity * 0.8;
        engineGlowRef.current.intensity = intensity * 80;
        rocketRef.current.position.x = (Math.random() - 0.5) * 0.05 * intensity;
        rocketRef.current.position.z = (Math.random() - 0.5) * 0.05 * intensity;
      } else if (t >= 0.40 && t < 0.80) {
        engineGlowRef.current.intensity = 80 + Math.random() * 20;
        opacity = 0.8 + Math.random() * 0.2;
        rocketRef.current.position.x = 0;
        rocketRef.current.position.z = 0;
      } else {
        engineGlowRef.current.intensity = 0;
        opacity = 0;
      }
      
      if (plumeMat) plumeMat.opacity = opacity * 0.4;
      if (plumeCoreMat) plumeCoreMat.opacity = opacity * 0.9;
      if (diamonds) {
        diamonds.forEach((d: any) => {
          if (d) d.opacity = opacity * 0.9;
        });
      }
    }
    
    // Stage Separation
    if (stage1Ref.current) {
      const s2PlumeMat = (rocketRef as any).s2PlumeMat;
      if (t > 0.80) {
        const sepProgress = (t - 0.80) / 0.10;
        stage1Ref.current.position.y = THREE.MathUtils.lerp(stage1Ref.current.position.y, -20 - sepProgress * 100, 0.05);
        stage1Ref.current.rotation.z = THREE.MathUtils.lerp(stage1Ref.current.rotation.z, 0.5, 0.02);
        if (s2PlumeMat) s2PlumeMat.opacity = 0.8 + Math.random() * 0.2;
      } else {
        stage1Ref.current.position.y = 0;
        stage1Ref.current.rotation.z = 0;
        if (s2PlumeMat) s2PlumeMat.opacity = 0;
      }
    }
  });

  return (
    <group ref={rocketRef}>
      {/* --- UPPER STAGE (Stage 2 + Fairing) --- */}
      <group>
        {/* Fairing (Nose Cone) - Smooth Ogive */}
        <mesh castShadow receiveShadow position={[0, 9.5, 0]} scale={[1, 2.5, 1]}>
          <sphereGeometry args={[1.2, 64, 64, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial color="#ffffff" roughness={0.12} metalness={0.1} clearcoat={0.5} clearcoatRoughness={0.2} envMapIntensity={1.5} />
        </mesh>

        {/* Fairing Base */}
        <mesh castShadow receiveShadow position={[0, 8.5, 0]}>
          <cylinderGeometry args={[1.2, 1.2, 2, 64]} />
          <meshPhysicalMaterial color="#ffffff" roughness={0.12} metalness={0.1} clearcoat={0.5} clearcoatRoughness={0.2} envMapIntensity={1.5} />
        </mesh>

        {/* Fairing Separation Seam */}
        <mesh position={[0, 7.51, 0]}>
          <torusGeometry args={[1.2, 0.015, 32, 64]} />
          <meshStandardMaterial color="#222222" roughness={0.8} metalness={0.2} />
        </mesh>

        {/* Vertical Fairing Separation Seams */}
        <mesh position={[1.19, 8.5, 0]}>
          <boxGeometry args={[0.03, 2.0, 0.03]} />
          <meshStandardMaterial color="#333333" roughness={0.6} metalness={0.5} />
        </mesh>
        <mesh position={[-1.19, 8.5, 0]}>
          <boxGeometry args={[0.03, 2.0, 0.03]} />
          <meshStandardMaterial color="#333333" roughness={0.6} metalness={0.5} />
        </mesh>

        {/* Payload adapter / taper to stage 2 */}
        <mesh castShadow receiveShadow position={[0, 7.25, 0]}>
          <cylinderGeometry args={[1.2, 1.0, 0.5, 64]} />
          <meshPhysicalMaterial color="#e0e0e0" roughness={0.3} metalness={0.7} clearcoat={0.2} envMapIntensity={1.2} />
        </mesh>

        {/* Second Stage Fuselage */}
        <mesh castShadow receiveShadow position={[0, 6, 0]}>
          <cylinderGeometry args={[1.0, 1.0, 2, 64]} />
          <meshPhysicalMaterial color="#f0f0f0" roughness={0.2} metalness={0.2} clearcoat={0.3} envMapIntensity={1.2} />
        </mesh>

        {/* Second Stage Panel Lines */}
        {[5.2, 5.5, 6.0, 6.5, 6.8].map((y) => (
          <mesh key={`s2-seam-${y}`} position={[0, y, 0]}>
            <torusGeometry args={[1.0, 0.006, 8, 64]} />
            <meshStandardMaterial color="#888888" roughness={0.8} metalness={0.5} />
          </mesh>
        ))}

        {/* Second Stage Detail Rings */}
        <mesh castShadow receiveShadow position={[0, 6.5, 0]}>
          <torusGeometry args={[1.015, 0.02, 16, 64]} />
          <meshStandardMaterial color="#666666" roughness={0.5} metalness={0.8} envMapIntensity={2.0} />
        </mesh>

        {/* Vacuum Engine Bell (Stage 2) */}
        <mesh castShadow receiveShadow position={[0, 4.75, 0]}>
          <cylinderGeometry args={[0.6, 0.2, 0.8, 32]} />
          <meshPhysicalMaterial color="#1a1a1a" roughness={0.7} metalness={0.9} clearcoat={0.1} envMapIntensity={0.8} />
        </mesh>
        
        {/* Vacuum Engine inner glow */}
        <mesh position={[0, 4.6, 0]}>
          <cylinderGeometry args={[0.55, 0.18, 0.79, 32]} />
          <meshBasicMaterial color="#331100" />
        </mesh>

        {/* Stage 2 Plume */}
        <mesh castShadow receiveShadow position={[0, 4.0, 0]}>
          <coneGeometry args={[0.6, 2.5, 32]} />
          <meshBasicMaterial color="#00aaff" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} ref={(mat) => {
            if (mat) (rocketRef as any).s2PlumeMat = mat;
          }} />
        </mesh>
      </group>

      {/* --- FIRST STAGE (Stage 1 Booster) --- */}
      <group ref={stage1Ref}>
        
        {/* Interstage (Black carbon fiber look) */}
        <mesh castShadow receiveShadow position={[0, 3.75, 0]}>
          <cylinderGeometry args={[1.0, 1.0, 1.5, 64]} />
          <meshPhysicalMaterial color="#151515" roughness={0.4} metalness={0.7} clearcoat={0.4} clearcoatRoughness={0.3} envMapIntensity={1.0} />
        </mesh>

        {/* Grid Fins (Deployed on Interstage) */}
        {[0, 1, 2, 3].map((i) => (
          <group key={`gridfin-${i}`} rotation={[0, (i * Math.PI) / 2, 0]} position={[0, 4.0, 0]}>
            <mesh castShadow receiveShadow position={[1.08, 0, 0]} rotation={[0, 0, -Math.PI / 8]}>
              <boxGeometry args={[0.4, 0.7, 0.04]} />
              <meshPhysicalMaterial color="#333333" roughness={0.3} metalness={0.9} clearcoat={0.1} envMapIntensity={1.8} />
            </mesh>
            {/* Grid Fin Hinge */}
            <mesh castShadow receiveShadow position={[0.98, -0.15, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.15, 16]} rotation={[Math.PI/2, 0, 0]} />
              <meshStandardMaterial color="#222222" roughness={0.6} metalness={0.8} />
            </mesh>
          </group>
        ))}

        {/* First Stage Fuselage */}
        <mesh castShadow receiveShadow position={[0, -1.75, 0]}>
          <cylinderGeometry args={[1.0, 1.0, 9.5, 64]} />
          <meshPhysicalMaterial color="#f0f0f0" roughness={0.25} metalness={0.2} clearcoat={0.2} envMapIntensity={1.2} />
        </mesh>

        {/* First Stage Panel Lines */}
        {[-6, -5, -4, -3, -2, -1, 0, 1, 2].map((y) => (
          <mesh key={`s1-seam-${y}`} position={[0, y, 0]}>
            <torusGeometry args={[1.0, 0.005, 8, 64]} />
            <meshStandardMaterial color="#999999" roughness={0.8} metalness={0.5} />
          </mesh>
        ))}

        {/* Soot / Burn marks at the bottom of Stage 1 */}
        <mesh castShadow receiveShadow position={[0, -5.5, 0]}>
          <cylinderGeometry args={[1.005, 1.005, 3.0, 64]} />
          <meshPhysicalMaterial color="#1a1a1a" roughness={0.9} metalness={0.3} transparent opacity={0.65} depthWrite={false} envMapIntensity={0.3} />
        </mesh>
        
        {/* Gradual soot fade */}
        <mesh castShadow receiveShadow position={[0, -3.0, 0]}>
          <cylinderGeometry args={[1.002, 1.002, 2.0, 64]} />
          <meshPhysicalMaterial color="#1a1a1a" roughness={0.8} metalness={0.2} transparent opacity={0.3} depthWrite={false} />
        </mesh>

        {/* Raceway (Cable tunnel running down the side) */}
        <mesh castShadow receiveShadow position={[0.97, -1.75, 0]}>
          <boxGeometry args={[0.12, 9.4, 0.08]} />
          <meshPhysicalMaterial color="#dddddd" roughness={0.4} metalness={0.5} clearcoat={0.1} envMapIntensity={1.5} />
        </mesh>

        <mesh castShadow receiveShadow position={[-0.97, -1.75, 0]}>
          <boxGeometry args={[0.12, 9.4, 0.08]} />
          <meshPhysicalMaterial color="#dddddd" roughness={0.4} metalness={0.5} clearcoat={0.1} envMapIntensity={1.5} />
        </mesh>

        {/* Landing Legs (Folded flat against the fuselage) */}
        {[0, 1, 2, 3].map((i) => (
          <group key={`leg-${i}`} rotation={[0, (i * Math.PI) / 2 + Math.PI/4, 0]} position={[0, -5.0, 0]}>
            <mesh castShadow receiveShadow position={[1.03, 0, 0]} rotation={[0, 0, 0.015]}>
              <boxGeometry args={[0.12, 3.8, 0.35]} />
              {/* Carbon composite legs */}
              <meshPhysicalMaterial color="#0f0f0f" roughness={0.5} metalness={0.8} clearcoat={0.2} envMapIntensity={1.2} />
            </mesh>
            {/* Leg hinge */}
            <mesh castShadow receiveShadow position={[1.03, 1.8, 0]}>
              <boxGeometry args={[0.15, 0.2, 0.4]} />
              <meshStandardMaterial color="#222222" roughness={0.7} metalness={0.6} />
            </mesh>
          </group>
        ))}

        {/* Octaweb / Engine Mount Section (Thermal Shielding) */}
        <mesh castShadow receiveShadow position={[0, -6.75, 0]}>
          <cylinderGeometry args={[1.0, 1.15, 0.6, 64]} />
          <meshPhysicalMaterial color="#222222" roughness={0.9} metalness={0.3} clearcoat={0.0} envMapIntensity={0.6} />
        </mesh>
        <mesh position={[0, -7.05, 0]}>
          <cylinderGeometry args={[1.15, 1.15, 0.1, 64]} />
          <meshStandardMaterial color="#111111" roughness={0.8} metalness={0.8} />
        </mesh>

        {/* 9 Merlin Engines */}
        <group position={[0, -7.35, 0]}>
          {/* Center Engine */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.25, 0.12, 0.6, 32]} />
            <meshPhysicalMaterial color="#151515" roughness={0.6} metalness={0.9} clearcoat={0.1} envMapIntensity={1.2} />
          </mesh>
          {/* 8 Outer Engines */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const angle = (i * Math.PI * 2) / 8;
            const radius = 0.72;
            return (
              <mesh castShadow receiveShadow key={`engine-${i}`} position={[Math.cos(angle) * radius, 0.1, Math.sin(angle) * radius]} rotation={[Math.cos(angle)*0.15, 0, -Math.sin(angle)*0.15]}>
                <cylinderGeometry args={[0.22, 0.1, 0.5, 32]} />
                <meshPhysicalMaterial color="#151515" roughness={0.6} metalness={0.9} clearcoat={0.1} envMapIntensity={1.2} />
              </mesh>
            );
          })}
        </group>

        {/* Engine Glow Light */}
        <pointLight ref={engineGlowRef} position={[0, -9, 0]} color="#ffaa55" intensity={0} distance={80} decay={2} castShadow shadow-bias={-0.001} />
        
        {/* Complex Exhaust Plume (Stage 1) */}
        <group position={[0, -11, 0]}>
          {/* Outer Soft Plume */}
          <mesh>
            <coneGeometry args={[2.2, 9, 32]} />
            <meshBasicMaterial color="#ff5500" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} ref={(mat) => {
              if (mat) (engineGlowRef as any).plumeMat = mat;
            }} />
          </mesh>
          {/* Inner Bright Core */}
          <mesh position={[0, 1.5, 0]}>
            <coneGeometry args={[0.9, 6, 32]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} ref={(mat) => {
              if (mat) (engineGlowRef as any).plumeCoreMat = mat;
            }} />
          </mesh>
          {/* Shock Diamonds */}
          {[0, 1, 2, 3, 4].map(i => (
             <mesh key={`diamond-${i}`} position={[0, 2.5 - i * 1.2, 0]}>
               <sphereGeometry args={[0.35 - i*0.06, 16, 16]} />
               <meshBasicMaterial color="#ffffff" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} ref={(mat) => {
                 if (mat) {
                   if (!(engineGlowRef as any).diamonds) (engineGlowRef as any).diamonds = [];
                   (engineGlowRef as any).diamonds[i] = mat;
                 }
               }} />
             </mesh>
          ))}
        </group>
        
        <ExhaustParticles />
        <VentingParticles />

      </group>
    </group>
  );
}
