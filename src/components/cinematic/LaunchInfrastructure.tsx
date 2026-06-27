import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';

export function LaunchInfrastructure({ padLightRef }: { padLightRef: React.RefObject<THREE.PointLight> }) {
  // Generate procedural textures for the infrastructure to add surface detail (seams, weathering)
  const { towerMat, padMat, armMat, pipeMat, darkMetalMat } = useMemo(() => {
    const createNoiseTexture = (baseColor: string, type: 'tower' | 'pad') => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d')!;
      
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, 1024, 1024);

      // Micro surface noise
      for (let i = 0; i < 40000; i++) {
        const val = Math.random();
        ctx.fillStyle = `rgba(0,0,0,${val * (type === 'pad' ? 0.08 : 0.04)})`;
        ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 2);
      }

      // Panels and engineered seams
      ctx.lineWidth = 2;
      ctx.strokeStyle = `rgba(0,0,0,0.25)`;
      for (let i = 0; i < 32; i++) {
        // Vertical structural lines
        ctx.beginPath();
        ctx.moveTo((i * 1024) / 32, 0);
        ctx.lineTo((i * 1024) / 32, 1024);
        ctx.stroke();
        
        // Horizontal structural lines
        ctx.beginPath();
        ctx.moveTo(0, (i * 1024) / 32);
        ctx.lineTo(1024, (i * 1024) / 32);
        ctx.stroke();

        // Bolt heads along seams
        for (let j = 0; j < 32; j++) {
          if (Math.random() > 0.3) {
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.beginPath();
            ctx.arc((i * 1024) / 32 + 4, (j * 1024) / 32 + 4, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.arc((i * 1024) / 32 + 4, (j * 1024) / 32 + 5, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Warning labels & utility markings
      if (type === 'pad') {
        for (let i = 0; i < 20; i++) {
          ctx.fillStyle = Math.random() > 0.5 ? '#ccaa00' : '#cc3300';
          const x = Math.random() * 1024;
          const y = Math.random() * 1024;
          ctx.fillRect(x, y, 40, 10);
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fillRect(x + 2, y + 2, 36, 6);
        }
        
        // Drain channels
        ctx.strokeStyle = 'rgba(0,0,0,0.6)';
        ctx.lineWidth = 8;
        for (let i = 0; i < 5; i++) {
           ctx.beginPath();
           ctx.moveTo(Math.random() * 1024, 0);
           ctx.lineTo(Math.random() * 1024, 1024);
           ctx.stroke();
        }
      }

      if (type === 'tower') {
        // Conduits / piping
        ctx.strokeStyle = '#556677';
        ctx.lineWidth = 4;
        for (let i = 0; i < 15; i++) {
           const x = (Math.random() * 1024);
           ctx.beginPath();
           ctx.moveTo(x, 0);
           ctx.lineTo(x, 1024);
           ctx.stroke();
           // Brackets
           for (let j = 0; j < 10; j++) {
              ctx.fillStyle = '#222';
              ctx.fillRect(x - 4, j * 100, 12, 6);
           }
        }
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2, 2); // Increased texture scaling for micro-detail
      tex.anisotropy = 4;
      return tex;
    };

    const padTex = createNoiseTexture('#2a2a2a', 'pad');
    const towerTex = createNoiseTexture('#404245', 'tower'); // Slightly lighter grey for steel tower

    return {
      towerMat: new THREE.MeshStandardMaterial({
        color: '#404245',
        map: towerTex,
        roughness: 0.8,
        metalness: 0.2,
        side: THREE.FrontSide,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      }),
      padMat: new THREE.MeshStandardMaterial({
        color: '#1f1f1f',
        map: padTex,
        roughness: 0.95,
        metalness: 0.1,
        side: THREE.FrontSide,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      }),
      armMat: new THREE.MeshStandardMaterial({
        color: '#aa3333', // Industrial red for umbilical arms
        roughness: 0.7,
        metalness: 0.1,
        side: THREE.FrontSide,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      }),
      pipeMat: new THREE.MeshStandardMaterial({
        color: '#b0b5b9',
        roughness: 0.6,
        metalness: 0.2, // Low metalness to eliminate intense specular reflections
        side: THREE.FrontSide,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      }),
      darkMetalMat: new THREE.MeshStandardMaterial({
        color: '#151515',
        roughness: 0.9,
        metalness: 0.1, // Low metalness to eliminate intense specular reflections
        side: THREE.FrontSide,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      })
    };
  }, []);

  const vaporRef = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const arm1Ref = useRef<THREE.Group>(null);
  const arm2Ref = useRef<THREE.Group>(null);
  const arm3Ref = useRef<THREE.Group>(null);
  const hydraulicRef1 = useRef<THREE.Mesh>(null);
  const hydraulicRef2 = useRef<THREE.Mesh>(null);
  const hydraulicRef3 = useRef<THREE.Mesh>(null);
  const beaconsRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (vaporRef.current) {
      vaporRef.current.rotation.y = clock.getElapsedTime() * 0.02;
      vaporRef.current.children.forEach((child, i) => {
        child.position.y += Math.sin(clock.getElapsedTime() * 0.5 + i) * 0.005;
      });
    }
    
    // Blinking beacons
    if (beaconsRef.current) {
      const blink = (clock.getElapsedTime() % 2.0) < 0.1 ? 2.0 : 0.2;
      beaconsRef.current.children.forEach((child) => {
        const light = child.children[1] as THREE.PointLight;
        if (light) light.intensity = blink;
      });
    }

    const t = scroll.offset;
    
    // Retract arms slightly before liftoff (0.40)
    const isRetracted = t >= 0.38;
    
    // Spring-damped retraction targeting -75 degrees
    const targetAngle = isRetracted ? Math.PI / -2.5 : 0;
    
    if (arm1Ref.current) {
      arm1Ref.current.rotation.y = THREE.MathUtils.lerp(arm1Ref.current.rotation.y, targetAngle, 0.08);
      if (hydraulicRef1.current) hydraulicRef1.current.position.x = 1.0 - (arm1Ref.current.rotation.y / (Math.PI / -2.5)) * 0.3;
    }
    if (arm2Ref.current) {
      arm2Ref.current.rotation.y = THREE.MathUtils.lerp(arm2Ref.current.rotation.y, targetAngle, 0.08);
      if (hydraulicRef2.current) hydraulicRef2.current.position.x = 1.0 - (arm2Ref.current.rotation.y / (Math.PI / -2.5)) * 0.3;
    }
    if (arm3Ref.current) {
      arm3Ref.current.rotation.y = THREE.MathUtils.lerp(arm3Ref.current.rotation.y, targetAngle, 0.08);
      if (hydraulicRef3.current) hydraulicRef3.current.position.x = 1.0 - (arm3Ref.current.rotation.y / (Math.PI / -2.5)) * 0.3;
    }
  });

  return (
    <group>
      {/* ---------------- GROUND SUPPORT & PAD ---------------- */}
      <mesh receiveShadow position={[0, -8, 0]}>
        <boxGeometry args={[35, 2, 35]} />
        <primitive object={padMat} attach="material" />
      </mesh>
      
      <pointLight ref={padLightRef} position={[0, -8, 0]} color="#ff8800" distance={80} intensity={0} decay={2} />
      
      {/* Flame Trench area */}
      <mesh receiveShadow position={[0, -6.89, 0]}>
        <boxGeometry args={[8, 0.2, 20]} />
        <meshPhysicalMaterial color="#0a0a0a" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Water Suppression Pipes */}
      {[2, -2].map(x => (
        <group key={`water-${x}`} position={[x, -6.8, 0]}>
          <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 20, 16]} />
            <primitive object={pipeMat} attach="material" />
          </mesh>
          {/* Small nozzles */}
          {[-8, -4, 0, 4, 8].map(z => (
            <mesh key={`nozzle-${z}`} position={[x > 0 ? -0.4 : 0.4, 0, z]} castShadow rotation={[0, 0, x > 0 ? Math.PI/2 : -Math.PI/2]}>
              <cylinderGeometry args={[0.1, 0.05, 0.4, 8]} />
              <primitive object={darkMetalMat} attach="material" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Base Clamps / Hold-down Interfaces */}
      {[1.5, -1.5].map(x => (
        <group key={`clamp-${x}`} position={[x, -6.5, 0]} rotation={[0, 0, x > 0 ? 0.2 : -0.2]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1, 2.5, 1]} />
            <primitive object={darkMetalMat} attach="material" />
          </mesh>
          {/* Hydraulic pistons */}
          <mesh position={[x > 0 ? -0.6 : 0.6, 0.5, 0]} rotation={[0, 0, x > 0 ? Math.PI/4 : -Math.PI/4]}>
            <cylinderGeometry args={[0.1, 0.1, 1.5, 8]} />
            <primitive object={pipeMat} attach="material" />
          </mesh>
        </group>
      ))}
      {[1.5, -1.5].map(z => (
        <group key={`clamp-z-${z}`} position={[0, -6.5, z]} rotation={[z > 0 ? -0.2 : 0.2, 0, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1, 2.5, 1]} />
            <primitive object={darkMetalMat} attach="material" />
          </mesh>
        </group>
      ))}

      {/* Cryogenic feed lines routing to tower */}
      <mesh position={[-5, -6.5, -8]} castShadow receiveShadow rotation={[0, 0, Math.PI/2]}>
         <cylinderGeometry args={[0.4, 0.4, 15, 16]} />
         <primitive object={pipeMat} attach="material" />
      </mesh>
      
      {/* Ground Support Vapor (ambient cryogenic boil-off) */}
      <group ref={vaporRef} position={[0, -6.5, 0]}>
        {[...Array(8)].map((_, i) => (
          <mesh key={`ground-vapor-${i}`} position={[(Math.random() - 0.5) * 10, Math.random() * 2, (Math.random() - 0.5) * 10]}>
            <sphereGeometry args={[1.5 + Math.random() * 2, 8, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.03} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
        {/* Heat shimmer near base plumbing */}
        <mesh position={[2, 0, 0]}>
          <cylinderGeometry args={[1, 1.5, 3, 16, 1, true]} />
          <meshPhysicalMaterial transmission={1} ior={1.02} roughness={0.2} thickness={0.5} transparent opacity={1} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-2, 0, 0]}>
          <cylinderGeometry args={[1, 1.5, 3, 16, 1, true]} />
          <meshPhysicalMaterial transmission={1} ior={1.02} roughness={0.2} thickness={0.5} transparent opacity={1} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* ---------------- LAUNCH TOWER ---------------- */}
      <group position={[-6.5, -2, 0]}>
        {/* Main core structure */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[4, 28, 4]} />
          <primitive object={towerMat} attach="material" />
        </mesh>
        
        {/* Cross-braced Steel Trusses (Visual approximation with multiple intersecting thin boxes) */}
        {[...Array(6)].map((_, i) => {
          const yPos = -12 + i * 4.5;
          return (
            <group key={`truss-${i}`} position={[0, yPos, 0]}>
              {/* Horizontal support */}
              <mesh castShadow receiveShadow position={[0, 2.25, 0]}>
                <boxGeometry args={[4.2, 0.2, 4.2]} />
                <primitive object={darkMetalMat} attach="material" />
              </mesh>
              {/* X-bracing on sides with proper beams and slight offsets to prevent z-fighting */}
              {/* Right Face (x = 2.05) - YZ plane, rotate around X */}
              <mesh castShadow receiveShadow position={[2.05, 0, 0.02]} rotation={[Math.PI / 4, 0, 0]}>
                <boxGeometry args={[0.15, 6.5, 0.15]} />
                <primitive object={darkMetalMat} attach="material" />
              </mesh>
              <mesh castShadow receiveShadow position={[2.05, 0, -0.02]} rotation={[-Math.PI / 4, 0, 0]}>
                <boxGeometry args={[0.15, 6.5, 0.15]} />
                <primitive object={darkMetalMat} attach="material" />
              </mesh>
              {/* Left Face (x = -2.05) - YZ plane, rotate around X */}
              <mesh castShadow receiveShadow position={[-2.05, 0, 0.02]} rotation={[Math.PI / 4, 0, 0]}>
                <boxGeometry args={[0.15, 6.5, 0.15]} />
                <primitive object={darkMetalMat} attach="material" />
              </mesh>
              <mesh castShadow receiveShadow position={[-2.05, 0, -0.02]} rotation={[-Math.PI / 4, 0, 0]}>
                <boxGeometry args={[0.15, 6.5, 0.15]} />
                <primitive object={darkMetalMat} attach="material" />
              </mesh>
              {/* Front Face (z = 2.05) - XY plane, rotate around Z */}
              <mesh castShadow receiveShadow position={[0.02, 0, 2.05]} rotation={[0, 0, Math.PI / 4]}>
                <boxGeometry args={[0.15, 6.5, 0.15]} />
                <primitive object={darkMetalMat} attach="material" />
              </mesh>
              <mesh castShadow receiveShadow position={[-0.02, 0, 2.05]} rotation={[0, 0, -Math.PI / 4]}>
                <boxGeometry args={[0.15, 6.5, 0.15]} />
                <primitive object={darkMetalMat} attach="material" />
              </mesh>
              {/* Back Face (z = -2.05) - XY plane, rotate around Z */}
              <mesh castShadow receiveShadow position={[0.02, 0, -2.05]} rotation={[0, 0, Math.PI / 4]}>
                <boxGeometry args={[0.15, 6.5, 0.15]} />
                <primitive object={darkMetalMat} attach="material" />
              </mesh>
              <mesh castShadow receiveShadow position={[-0.02, 0, -2.05]} rotation={[0, 0, -Math.PI / 4]}>
                <boxGeometry args={[0.15, 6.5, 0.15]} />
                <primitive object={darkMetalMat} attach="material" />
              </mesh>
            </group>
          )
        })}

        {/* Service Platforms */}
        {[10, 4, -2, -8].map((y) => (
          <group key={`platform-${y}`} position={[2, y, 0]}>
             {/* Walkway floor (disable receiveShadow to eliminate shadow acne / self-shadowing) */}
             <mesh castShadow position={[1, 0, 0]}>
               <boxGeometry args={[3, 0.2, 4.5]} />
               <primitive object={darkMetalMat} attach="material" />
             </mesh>
             {/* Non-overlapping, coplanar-free Railings (with micro-gap offset to completely prevent Z-fighting) */}
             <mesh castShadow position={[2.45, 0.701, 0]}>
               <boxGeometry args={[0.1, 1.2, 4.5]} />
               <primitive object={pipeMat} attach="material" />
             </mesh>
             <mesh castShadow position={[0.95, 0.701, 2.2]}>
               <boxGeometry args={[2.9, 1.2, 0.1]} />
               <primitive object={pipeMat} attach="material" />
             </mesh>
             <mesh castShadow position={[0.95, 0.701, -2.2]}>
               <boxGeometry args={[2.9, 1.2, 0.1]} />
               <primitive object={pipeMat} attach="material" />
             </mesh>
             
             {/* Cool white service lights under platform */}
             <pointLight position={[1, -0.5, 0]} color="#e0f0ff" distance={8} intensity={0.8} decay={2} />
          </group>
        ))}

        {/* Service Elevator shaft */}
        <mesh position={[1.8, 0.1, 1.5]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 28.2, 1.5]} />
          <meshPhysicalMaterial color="#111111" roughness={0.7} metalness={0.5} />
        </mesh>
        
        {/* Cryo fuel vertical pipes & Conduits */}
        <mesh position={[2.1, 0.2, -1.2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.25, 0.25, 28.4, 16]} />
          <primitive object={pipeMat} attach="material" />
        </mesh>
        {/* Pipe Brackets */}
        {[...Array(14)].map((_, i) => (
          <mesh key={`pipe-bracket-${i}`} position={[2.1, -13 + i * 2, -1.2]} castShadow>
            <boxGeometry args={[0.6, 0.1, 0.6]} />
            <primitive object={darkMetalMat} attach="material" />
          </mesh>
        ))}
        
        <mesh position={[2.2, 0.15, -0.6]} castShadow receiveShadow>
          <cylinderGeometry args={[0.15, 0.15, 28.3, 16]} />
          <primitive object={pipeMat} attach="material" />
        </mesh>
        
        {/* Cable Tray */}
        <mesh position={[-2.1, 0.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.3, 28.1, 1.5]} />
          <primitive object={darkMetalMat} attach="material" />
        </mesh>

        {/* Lightning Mast / Antenna on top */}
        <mesh position={[0, 15, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.3, 4, 8]} />
          <primitive object={pipeMat} attach="material" />
        </mesh>
        <mesh position={[0, 17, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
        {/* Aviation obstruction lights - Red glow */}
        <pointLight position={[0, 17, 0]} color="#ff0000" distance={15} intensity={2} decay={2} />
        <pointLight position={[2, 14, 2]} color="#ff0000" distance={8} intensity={1} decay={2} />
        <pointLight position={[-2, 14, -2]} color="#ff0000" distance={8} intensity={1} decay={2} />
        <mesh position={[0, 17.5, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.05, 3, 8]} />
          <primitive object={pipeMat} attach="material" />
        </mesh>
        
        {/* Warning Beacons (Red aircraft obstruction lights) */}
        <group ref={beaconsRef}>
          {[17.5, 12, 6, 0, -6, -12].map(y => (
             <group key={`warn-${y}`} position={[2.1, y, 2.1]}>
               <mesh>
                 <sphereGeometry args={[0.15]} />
                 <meshBasicMaterial color="#ff1111" />
               </mesh>
               <pointLight color="#ff0000" distance={10} intensity={0.5} decay={2} />
             </group>
          ))}
        </group>
      </group>
      
      {/* ---------------- UMBILICAL ARMS ---------------- */}
      
      {/* Upper Umbilical (Crew/Payload Access & Venting) */}
      <group position={[-4.5, 9, 0]} ref={arm1Ref}>
        {/* Main support arm (disable receiveShadow to eliminate self-shadowing acne) */}
        <mesh castShadow position={[1.5, 0, 0]}>
          <boxGeometry args={[4.5, 0.8, 1.5]} />
          <primitive object={armMat} attach="material" />
        </mesh>
        {/* Flexible hose assembly */}
        <mesh castShadow position={[3.5, -0.6, 0]}>
           <cylinderGeometry args={[0.15, 0.15, 1.5, 12]} />
           <meshPhysicalMaterial color="#111111" roughness={0.9} />
        </mesh>
        {/* Hydraulic hinge details */}
        <mesh castShadow position={[-0.5, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 1.8, 16]} />
          <primitive object={darkMetalMat} attach="material" />
        </mesh>
        <mesh ref={hydraulicRef1} position={[1.0, -0.5, 0.6]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.1, 0.1, 1.5, 8]} />
          <primitive object={pipeMat} attach="material" />
        </mesh>
      </group>

      {/* Mid Umbilical (Interstage / Second Stage) */}
      <group position={[-4.5, 3, 0]} ref={arm2Ref}>
        {/* Main support arm (disable receiveShadow to eliminate self-shadowing acne) */}
        <mesh castShadow position={[1.5, 0, 0]}>
          <boxGeometry args={[4.5, 0.6, 1.2]} />
          <primitive object={armMat} attach="material" />
        </mesh>
        {/* Multiple connector lines */}
        {[-0.3, 0, 0.3].map(z => (
          <mesh key={`mid-hose-${z}`} castShadow position={[3.5, -0.5, z]} rotation={[0, 0, -0.2]}>
             <cylinderGeometry args={[0.08, 0.08, 1.2, 8]} />
             <meshPhysicalMaterial color="#333333" roughness={0.8} />
          </mesh>
        ))}
        <mesh castShadow position={[-0.5, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 1.5, 16]} />
          <primitive object={darkMetalMat} attach="material" />
        </mesh>
        <mesh ref={hydraulicRef2} position={[1.0, -0.4, 0.5]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.1, 0.1, 1.5, 8]} />
          <primitive object={pipeMat} attach="material" />
        </mesh>
      </group>

      {/* Lower Umbilical (First Stage / Main Propellant) */}
      <group position={[-4.5, -3.5, 0]} ref={arm3Ref}>
        {/* Main support arm (disable receiveShadow to eliminate self-shadowing acne) */}
        <mesh castShadow position={[1.5, 0, 0]}>
          <boxGeometry args={[4.5, 1.0, 1.8]} />
          <primitive object={armMat} attach="material" />
        </mesh>
        {/* Massive quick-disconnect plates */}
        <mesh castShadow position={[3.8, 0, 0]}>
           <boxGeometry args={[0.4, 1.5, 2.0]} />
           <primitive object={darkMetalMat} attach="material" />
        </mesh>
        {/* Large cryogenic feed pipes on the arm */}
        <mesh castShadow position={[1.5, 0.6, 0.5]} rotation={[0, 0, Math.PI/2]}>
           <cylinderGeometry args={[0.2, 0.2, 4.5, 16]} />
           <primitive object={pipeMat} attach="material" />
        </mesh>
        <mesh castShadow position={[1.5, 0.6, -0.5]} rotation={[0, 0, Math.PI/2]}>
           <cylinderGeometry args={[0.2, 0.2, 4.5, 16]} />
           <primitive object={pipeMat} attach="material" />
        </mesh>
        <mesh ref={hydraulicRef3} position={[1.0, -0.6, 0.8]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.1, 0.1, 1.5, 8]} />
          <primitive object={pipeMat} attach="material" />
        </mesh>
      </group>

    </group>
  );
}
