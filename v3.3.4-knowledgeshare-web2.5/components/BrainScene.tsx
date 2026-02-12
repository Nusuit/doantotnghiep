import React, { useRef, useMemo, Suspense, useLayoutEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Environment, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { TextureLoader } from 'three';

// --- CINEMATIC 3D ARTIFACTS ---

// 1. The Cosmic Cube
const CubeArtifact = () => {
    const coreRef = useRef<THREE.Mesh>(null);
    const cageRef = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if(coreRef.current) { coreRef.current.rotation.x = t * 0.5; coreRef.current.rotation.y = t * 0.3; }
        if(cageRef.current) { cageRef.current.rotation.x = -t * 0.3; cageRef.current.rotation.z = t * 0.2; }
    });
    return (
        <group rotation={[Math.random(), Math.random(), 0]}>
            <mesh><boxGeometry args={[0.8, 0.8, 0.8]} /><meshPhysicalMaterial roughness={0.05} transmission={0.95} thickness={1.5} ior={1.4} clearcoat={1} color="#eef" /></mesh>
            <mesh ref={coreRef} scale={[0.35, 0.35, 0.35]}><octahedronGeometry args={[1, 0]} /><meshStandardMaterial color="#00ffff" emissive="#0088ff" emissiveIntensity={3} toneMapped={false} /></mesh>
            <mesh ref={cageRef} scale={[0.5, 0.5, 0.5]}><boxGeometry /><meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} wireframe={true} /></mesh>
        </group>
    );
};

// 2. The Astrolabe
const AstrolabeArtifact = () => {
    const ring1 = useRef<THREE.Mesh>(null);
    const ring2 = useRef<THREE.Mesh>(null);
    const ring3 = useRef<THREE.Mesh>(null);
    const crystal = useRef<THREE.Mesh>(null);
    const brassMaterial = new THREE.MeshStandardMaterial({ color: "#B8860B", metalness: 0.9, roughness: 0.2 });

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if(ring1.current) ring1.current.rotation.x = t * 0.2;
        if(ring2.current) ring2.current.rotation.y = t * 0.3;
        if(ring3.current) ring3.current.rotation.z = t * 0.15;
        if(crystal.current) { crystal.current.rotation.y = -t; crystal.current.position.y = Math.sin(t * 2) * 0.05; }
    });

    return (
        <group rotation={[Math.random(), Math.random(), 0]}>
            <mesh ref={ring1}><torusGeometry args={[0.5, 0.015, 16, 64]} /><primitive object={brassMaterial} /></mesh>
            <mesh ref={ring2} rotation={[Math.PI/2, 0, 0]}><torusGeometry args={[0.4, 0.02, 16, 64]} /><primitive object={brassMaterial} /></mesh>
            <mesh ref={ring3} rotation={[0, Math.PI/2, 0]}><torusGeometry args={[0.3, 0.025, 16, 64]} /><primitive object={brassMaterial} /></mesh>
            <mesh ref={crystal}><octahedronGeometry args={[0.12, 0]} /><meshStandardMaterial color="#b0e0e6" emissive="#00ffff" emissiveIntensity={1} /></mesh>
        </group>
    );
};

// 3. The Ancient Map
const MapArtifact = () => {
    const mapTexture = useLoader(TextureLoader, 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (!meshRef.current?.geometry?.attributes?.position) return;
        const time = state.clock.getElapsedTime() * 0.8;
        const position = meshRef.current.geometry.attributes.position;
        // @ts-ignore
        if ('setZ' in position) {
            for (let i = 0; i < position.count; i++) {
                const x = position.getX(i); const y = position.getY(i);
                const wave = 0.1 * Math.sin(x * 2 + time) + 0.1 * Math.sin(y * 3 + time * 0.5);
                position.setZ(i, wave);
            }
            position.needsUpdate = true;
            meshRef.current.geometry.computeVertexNormals();
        }
    });
    return (
        <group rotation={[Math.random() * 0.2, Math.random() * Math.PI, 0]}>
            <mesh ref={meshRef}><planeGeometry args={[1.4, 0.9, 32, 32]} /><meshStandardMaterial map={mapTexture} side={THREE.DoubleSide} roughness={0.9} metalness={0.1} color="#e6dcc3" /></mesh>
        </group>
    );
};

// 4. The Scroll
const ScrollArtifact = () => (
    <group rotation={[0, 0, Math.random() * Math.PI]}>
        <mesh rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.1, 0.1, 0.7, 32]} /><meshStandardMaterial color="#F2E8C9" roughness={0.9} /></mesh>
        <mesh position={[0.4, 0, 0]} rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.04, 0.04, 0.15, 16]} /><meshStandardMaterial color="#5D4037" roughness={0.8} /></mesh>
        <mesh position={[0.48, 0, 0]} rotation={[0, 0, Math.PI/2]}><sphereGeometry args={[0.06, 16, 16]} /><meshStandardMaterial color="#3E2723" roughness={0.5} /></mesh>
        <mesh position={[-0.4, 0, 0]} rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.04, 0.04, 0.15, 16]} /><meshStandardMaterial color="#5D4037" roughness={0.8} /></mesh>
        <mesh position={[-0.48, 0, 0]} rotation={[0, 0, Math.PI/2]}><sphereGeometry args={[0.06, 16, 16]} /><meshStandardMaterial color="#3E2723" roughness={0.5} /></mesh>
        <mesh position={[0, 0.09, 0]}><cylinderGeometry args={[0.08, 0.09, 0.03, 16]} /><meshStandardMaterial color="#B71C1C" roughness={0.3} /></mesh>
        <mesh rotation={[0, 0, Math.PI/2]}><torusGeometry args={[0.105, 0.015, 16, 32]} /><meshStandardMaterial color="#B71C1C" roughness={0.8} /></mesh>
    </group>
);

// 5. The Gene Code (Improved DNA Double Helix)
const DNAArtifact = () => {
    const groupRef = useRef<THREE.Group>(null);
    
    useFrame((state) => { 
        if (groupRef.current) {
            const t = state.clock.elapsedTime;
            groupRef.current.rotation.y = t * 0.3; 
            // Slight tilt wobble to make it dynamic
            groupRef.current.rotation.z = Math.sin(t * 0.5) * 0.1;
        }
    });

    // Generate helical data points
    const count = 20; 
    const radius = 0.35;
    const height = 1.6;
    const turns = 1.5; 

    const dnaData = useMemo(() => {
        const data = [];
        for (let i = 0; i < count; i++) {
            const t = i / (count - 1);
            const angle = t * Math.PI * 2 * turns;
            const y = (t - 0.5) * height;
            
            data.push({
                y,
                angle: -angle, 
                // Alternating base pair colors (e.g. Cyan/Purple)
                colorA: i % 4 === 0 || i % 4 === 3 ? "#06b6d4" : "#a855f7", 
                colorB: i % 4 === 0 || i % 4 === 3 ? "#a855f7" : "#06b6d4",
            });
        }
        return data;
    }, []);

    return (
        <group ref={groupRef} rotation={[Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.5]}>
            {dnaData.map((d, i) => (
                <group key={i} position={[0, d.y, 0]} rotation={[0, d.angle, 0]}>
                    {/* The Connector (Hydrogen Bonds) */}
                    <mesh rotation={[0, 0, Math.PI/2]}>
                        <cylinderGeometry args={[0.02, 0.02, radius * 1.8, 8]} />
                        <meshStandardMaterial color="#e2e8f0" opacity={0.6} transparent />
                    </mesh>

                    {/* Nucleotide A (Strand 1) */}
                    <mesh position={[radius, 0, 0]}>
                        <sphereGeometry args={[0.08, 16, 16]} />
                        <meshStandardMaterial color={d.colorA} roughness={0.3} metalness={0.7} />
                    </mesh>

                    {/* Nucleotide B (Strand 2) */}
                    <mesh position={[-radius, 0, 0]}>
                        <sphereGeometry args={[0.08, 16, 16]} />
                        <meshStandardMaterial color={d.colorB} roughness={0.3} metalness={0.7} />
                    </mesh>
                </group>
            ))}
        </group>
    );
};

// --- ORBITING ITEM LOGIC ---
const FloatingKnowledgeItem: React.FC<{ index: number; count: number }> = ({ index, count }) => {
    const meshRef = useRef<THREE.Group>(null);
    
    // Cycle through remaining 5 items
    const typeKey = index % 5; 

    const { pos, axis, speed } = useMemo(() => {
        const phi = Math.acos(1 - 2 * (index + 0.5) / count);
        const theta = Math.PI * (1 + Math.sqrt(5)) * (index + 0.5);
        const r = 6.2 + Math.random() * 0.8; 
        return {
            pos: new THREE.Vector3(r * Math.cos(theta) * Math.sin(phi), r * Math.sin(theta) * Math.sin(phi), r * Math.cos(phi)),
            axis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
            speed: 0.015 + Math.random() * 0.02 
        };
    }, [index, count]);

    useLayoutEffect(() => {
        if (meshRef.current) {
            meshRef.current.position.copy(pos);
            meshRef.current.lookAt(0, 0, 0); 
        }
    }, [pos]);

    useFrame((state, delta) => {
        if (!meshRef.current) return;
        meshRef.current.position.applyAxisAngle(axis, speed * delta * 0.5);
        meshRef.current.rotation.z += delta * 0.05;
        meshRef.current.rotation.x += delta * 0.05;
    });

    return (
        <group ref={meshRef}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                {typeKey === 0 && <MapArtifact />}
                {typeKey === 1 && <CubeArtifact />}
                {typeKey === 2 && <AstrolabeArtifact />}
                {typeKey === 3 && <ScrollArtifact />}
                {typeKey === 4 && <DNAArtifact />}
            </Float>
        </group>
    );
};

const KnowledgeCloud = () => {
    const count = 18; 
    const items = useMemo(() => new Array(count).fill(0).map((_, i) => i), []);
    return <group>{items.map((i) => <FloatingKnowledgeItem key={i} index={i} count={count} />)}</group>;
};

// --- MAIN EARTH COMPONENT ---
const ToyEarth = () => {
  // Load textures for the Earth
  const [colorMap, normalMap, specularMap] = useLoader(TextureLoader, [
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
  ]);

  const earthRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (earthRef.current) earthRef.current.rotation.y = t * 0.08; // Earth rotates slowly
  });

  return (
    <group>
      {/* A. EARTH SURFACE */}
      <mesh ref={earthRef} rotation={[0, 0, 0.35]}> {/* Tilted axis */}
        <sphereGeometry args={[2.5, 128, 128]} /> {/* High poly for displacement details */}
        <meshStandardMaterial 
          map={colorMap}
          normalMap={normalMap}
          roughnessMap={specularMap}
          roughness={0.7}
          metalness={0.1}
          color="#ffffff"
          emissive="#001133" // Deep blue internal glow for vibrancy
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* B. ATMOSPHERE GLOW (Bright Rim) */}
      <mesh scale={[1.15, 1.15, 1.15]}>
        <sphereGeometry args={[2.5, 64, 64]} />
        <shaderMaterial 
            transparent
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
            depthWrite={false}
            uniforms={{
                glowColor: { value: new THREE.Color(0x00aaff) },
            }}
            vertexShader={`
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `}
            fragmentShader={`
                uniform vec3 glowColor;
                varying vec3 vNormal;
                void main() {
                    // Fresnel Effect calculation
                    float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 4.0);
                    gl_FragColor = vec4(glowColor, 1.0) * intensity * 2.0;
                }
            `}
        />
      </mesh>
    </group>
  );
}

const FallbackEarth = () => (
    <group>
         <mesh rotation={[0, 0, 0.2]}>
            <sphereGeometry args={[2.4, 32, 32]} />
            <meshStandardMaterial color="#2196F3" />
        </mesh>
    </group>
);

export const BrainScene = () => {
  return (
    <div className="w-full h-full min-h-[500px] relative">
      <Canvas camera={{ position: [0, 0, 14], fov: 40 }} gl={{ antialias: true, alpha: true }} dpr={[1, 2]}>
        
        <Environment preset="city" />

        {/* Lighting Setup for Vibrant Colors */}
        <ambientLight intensity={1.5} /> 
        <directionalLight position={[5, 5, 5]} intensity={2.0} color="#ffffff" castShadow />
        <directionalLight position={[-5, 5, 5]} intensity={1.0} color="#ffd1dc" /> {/* Warm fill */}
        
        {/* Rim Light for shape definition */}
        <spotLight position={[0, 10, -10]} intensity={2.5} color="#e0f7fa" angle={0.5} penumbra={1} />

        <Suspense fallback={<FallbackEarth />}>
            <ToyEarth />
        </Suspense>

        <Suspense fallback={null}>
            <KnowledgeCloud />
        </Suspense>
        
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={0.5} />
        
        <OrbitControls 
            enableZoom={false} 
            autoRotate 
            autoRotateSpeed={0.5} 
            enablePan={false} 
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  );
};