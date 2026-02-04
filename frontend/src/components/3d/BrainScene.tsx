"use client";

import React, { useRef, useMemo, useState, useEffect, forwardRef, useImperativeHandle, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';
import { TextureLoader } from 'three';

// --- Constants & Colors ---
const SOLANA_GREEN = "#14F195";
const SOLANA_PURPLE = "#9945FF";
const GOLD = "#FFEA00"; // Brighter Yellow Gold
const EMISSIVE_GOLD = "#FBBF24"; // Lighter Amber for glow
const EMISSIVE_FLASH = "#FFFFFF"; // Pure White for the "Minting Flash"

// --- Geometries (Visuals) ---

const KnowledgeCube = () => (
    <mesh>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial
            color="#E0F2FE"
            emissive="#0EA5E9"
            emissiveIntensity={0.5}
            roughness={0.2}
        />
    </mesh>
);

// --- Particle Logic ---

interface ParticleProps {
    id: string;
    onComplete: (id: string) => void;
    onMint: () => void; // Callback to trigger main block effect
}

const ParticleLifecycle: React.FC<ParticleProps> = ({ id, onComplete, onMint }) => {
    const groupRef = useRef<THREE.Group>(null);
    const coinRef = useRef<THREE.Group>(null);
    const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

    // State to track phase
    const [isCoin, setIsCoin] = useState(false);
    // Track time since became coin for physics calculations
    const coinTimeRef = useRef(0);

    // 1. Spawn Location: Random point on a sphere radius 16
    const startPos = useMemo(() => {
        const r = 16;
        const theta = Math.random() * Math.PI * 2; // Azimuth
        const phi = Math.acos((Math.random() * 2) - 1); // Inclination

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        return new THREE.Vector3(x, y, z);
    }, []);

    // Vector pointing towards center (normalized) - Input Direction
    const directionIn = useMemo(() => {
        return new THREE.Vector3(0, 0, 0).sub(startPos).normalize();
    }, [startPos]);

    // Output Direction (Random Scatter)
    const directionOut = useMemo(() => {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.sin(phi) * Math.sin(theta);
        const z = Math.cos(phi);
        return new THREE.Vector3(x, y, z).normalize();
    }, []);

    // Input Speed
    const speedIn = 5;

    // Generate positions for the "Beaded Ring" (small dots around the coin)
    const beads = useMemo(() => {
        const items = [];
        const count = 16;
        const radius = 0.45;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            items.push({
                x: Math.cos(angle) * radius,
                z: Math.sin(angle) * radius // using z because cylinder is rotated
            });
        }
        return items;
    }, []);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        const dt = delta || 0.016; // Safety fallback
        const currentPos = groupRef.current.position;

        if (!isCoin) {
            // --- Phase 1: Input (Knowledge) ---
            // Move towards center
            const moveStep = directionIn.clone().multiplyScalar(speedIn * dt);
            currentPos.add(moveStep);

            // Rotate cube slowly
            groupRef.current.rotation.x += dt;
            groupRef.current.rotation.y += dt;

            // Check distance to center (Transformation Trigger)
            // Trigger slightly earlier for Earth since it's bigger (Radius ~2.4)
            if (currentPos.distanceTo(new THREE.Vector3(0, 0, 0)) < 2.8) {
                setIsCoin(true);
                onMint(); // Trigger the main block effect

                // Reset rotation group to 0
                groupRef.current.rotation.set(0, 0, 0);
                coinTimeRef.current = 0;
            }

        } else {
            // --- Phase 2: Output (Coin - The Minting Effect) ---
            coinTimeRef.current += dt;
            const t = coinTimeRef.current;

            // A. Movement: Controlled Impulse Burst + Smooth Drag
            // Ejection speed reduced from 35.0 to 12.0 for a more visible transition
            // Decay factor reduced from -6.0 to -3.0 for a smoother slow-down
            // Stabilizes at 0.5 drift speed for easy viewing
            const burstSpeed = 12.0 * Math.exp(-3.0 * t);
            const constantDrift = 0.5;
            const currentSpeed = constantDrift + burstSpeed;

            // Move outwards using random scatter direction
            const moveStep = directionOut.clone().multiplyScalar(currentSpeed * dt);
            currentPos.add(moveStep);

            // B. Rotation: The "Coin Toss" (Spin) - GENTLER SPIN
            if (coinRef.current) {
                // Spin reduced from 80.0 to 20.0 radians/sec
                const spinSpeed = 0.5 + (20.0 * Math.exp(-2.5 * t));
                coinRef.current.rotation.x += spinSpeed * dt;
                coinRef.current.rotation.y += (spinSpeed * 0.8) * dt;
                coinRef.current.rotation.z += (spinSpeed * 0.5) * dt;
            }

            // C. Scale: The "Elastic Pop"
            if (coinRef.current) {
                let s = 1;
                if (t < 0.4) {
                    // Elastic Out function approximation
                    const p = t / 0.4;
                    s = Math.sin(-13 * (p + 1) * Math.PI / 2) * Math.pow(2, -10 * p) + 1;
                    s = s * 1.5; // Max scale multiplier (bigger pop)
                } else {
                    s = 1.0;
                }
                coinRef.current.scale.setScalar(Math.max(0, s));
            }

            // D. Visuals: The "White Flash"
            if (materialRef.current) {
                const flashDuration = 0.3;
                const flashFactor = Math.max(0, 1 - (t / flashDuration));

                const cWhite = new THREE.Color(EMISSIVE_FLASH);
                // Lerp towards Gold
                materialRef.current.emissive.lerpColors(new THREE.Color(EMISSIVE_GOLD), cWhite, flashFactor);
                // Base intensity 0.4 + Flash
                materialRef.current.emissiveIntensity = 0.5 + (flashFactor * 8.0);
            }

            // Despawn when far away
            if (currentPos.distanceTo(new THREE.Vector3(0, 0, 0)) > 20) {
                onComplete(id);
            }
        }
    });

    // Reuse material for performance - UPDATED FOR BRIGHTNESS
    const goldMaterial = useMemo(() => (
        <meshPhysicalMaterial
            ref={materialRef}
            color={GOLD}
            metalness={1.0}
            roughness={0.15} // Shinier (was 0.25)
            clearcoat={1.0} // More polish
            clearcoatRoughness={0.05}
            emissive={EMISSIVE_GOLD}
            emissiveIntensity={0.5} // Higher base glow (was 0.1)
        />
    ), []);

    // Pass position as array to avoid read-only assignment issues in R3F reconciliation
    const posArray: [number, number, number] = [startPos.x, startPos.y, startPos.z];

    return (
        <group ref={groupRef} position={posArray}>
            {!isCoin ? (
                <KnowledgeCube />
            ) : (
                // Removed fixed rotation to allow full tumbling
                <group ref={coinRef}>

                    {/* --- THE PHYSICAL COIN DESIGN --- */}

                    {/* 1. Main Cylinder Body (The Core) */}
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.65, 0.65, 0.1, 64]} />
                        {goldMaterial}
                    </mesh>

                    {/* 2. The Faces (Front & Back Detail) */}
                    {[1, -1].map((side) => (
                        <group key={side} position={[0, 0, side * 0.051]} rotation={[side === 1 ? 0 : Math.PI, 0, 0]}>

                            {/* A. The Rim (Raised Torus flattened) */}
                            <mesh scale={[1, 1, 0.5]}>
                                <torusGeometry args={[0.6, 0.04, 16, 64]} />
                                {goldMaterial}
                            </mesh>

                            {/* C. The Central Pedestal (Hexagon Base) */}
                            <mesh position={[0, 0, 0.01]} rotation={[Math.PI / 2, Math.PI / 2, 0]}>
                                <cylinderGeometry args={[0.35, 0.35, 0.02, 6]} />
                                <meshPhysicalMaterial
                                    color={GOLD}
                                    metalness={1.0}
                                    roughness={0.3}
                                    emissive={EMISSIVE_GOLD}
                                    emissiveIntensity={0.3}
                                />
                            </mesh>

                            {/* D. The Gem Symbol (Embedded Value) */}
                            <mesh position={[0, 0, 0.03]} rotation={[0, 0, Math.PI / 4]}>
                                <octahedronGeometry args={[0.22, 0]} />
                                <meshStandardMaterial
                                    color="#FFFFE0"
                                    emissive={side === 1 ? SOLANA_GREEN : SOLANA_PURPLE}
                                    emissiveIntensity={2.0} // Brighter Gem
                                    toneMapped={false}
                                />
                            </mesh>
                        </group>
                    ))}
                </group>
            )}
        </group>
    );
};

interface ParticleSystemProps {
    onMintTrigger: () => void;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ onMintTrigger }) => {
    const [particles, setParticles] = useState<{ id: string }[]>([]);
    const lastSpawnTime = useRef(0);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        // Spawn Rate: Every 1.5 seconds (Faster)
        if (time - lastSpawnTime.current > 1.5) {
            lastSpawnTime.current = time;
            setParticles(prev => [...prev, { id: Math.random().toString(36).substr(2, 9) }]);
        }
    });

    const removeParticle = useCallback((id: string) => {
        setParticles(prev => prev.filter(p => p.id !== id));
    }, []);

    return (
        <>
            {particles.map(p => (
                <ParticleLifecycle
                    key={p.id}
                    id={p.id}
                    onComplete={removeParticle}
                    onMint={onMintTrigger}
                />
            ))}
        </>
    );
};

// --- Central Processor (The Earth) ---

interface NetworkNodeHandle {
    triggerMintEffect: () => void;
}

const NetworkNode = forwardRef<NetworkNodeHandle, {}>((props, ref) => {
    // Load Earth Textures
    const [colorMap, normalMap, specularMap, cloudsMap] = useLoader(TextureLoader, [
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'
    ]);

    const earthGroupRef = useRef<THREE.Group>(null);
    const earthMeshRef = useRef<THREE.Mesh>(null);
    const cloudsMeshRef = useRef<THREE.Mesh>(null);
    const earthMaterialRef = useRef<THREE.MeshPhongMaterial>(null);

    // Physics State for the Block
    const impulseRef = useRef(0);
    // Scroll tracking
    const scrollY = useRef(0);

    // Track scroll position
    useEffect(() => {
        const onScroll = () => {
            scrollY.current = window.scrollY;
        };
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Expose the trigger method to parent
    useImperativeHandle(ref, () => ({
        triggerMintEffect: () => {
            // Set impulse to 1.0 (Kick)
            impulseRef.current = 1.0;
        }
    }));

    useFrame((state, delta) => {
        const dt = delta || 0.016;
        const time = state.clock.getElapsedTime();

        // Decay the impulse (Damping)
        // Lerp impulse towards 0
        impulseRef.current = THREE.MathUtils.lerp(impulseRef.current, 0, dt * 5);

        // Rotation Logic: Base Rotation + Scroll Influence
        // 0.005 factor creates a noticeable spin when scrolling
        const scrollRotationOffset = scrollY.current * 0.005;

        if (earthMeshRef.current) {
            // Earth auto-rotates slowly (time * 0.1) and adds scroll offset
            earthMeshRef.current.rotation.y = (time * 0.1) + scrollRotationOffset;
        }
        if (cloudsMeshRef.current) {
            // Clouds rotate slightly faster than earth
            cloudsMeshRef.current.rotation.y = (time * 0.12) + scrollRotationOffset;
        }

        if (earthGroupRef.current) {
            // RECOIL / BEAT
            // Scale expands slightly (1.0 -> 1.05) based on impulse
            const scaleBump = 1.0 + (impulseRef.current * 0.03);
            earthGroupRef.current.scale.setScalar(scaleBump);
        }

        if (earthMaterialRef.current) {
            // FLASH EFFECT on Emissive
            // Flash color: #4F46E5 (Indigo/Blue)
            const flashColor = new THREE.Color("#4F46E5");
            const black = new THREE.Color("#000000");

            earthMaterialRef.current.emissive.lerpColors(black, flashColor, impulseRef.current * 0.8);
            earthMaterialRef.current.emissiveIntensity = impulseRef.current * 2.0;
        }
    });

    return (
        <group ref={earthGroupRef}>
            {/* Earth Sphere */}
            <mesh ref={earthMeshRef} rotation={[0, 0, 0.2]}> {/* Slight tilt */}
                <sphereGeometry args={[2.4, 64, 64]} />
                <meshPhongMaterial
                    ref={earthMaterialRef}
                    map={colorMap}
                    normalMap={normalMap}
                    specularMap={specularMap}
                    shininess={25}
                />
            </mesh>

            {/* Clouds Sphere */}
            <mesh ref={cloudsMeshRef} rotation={[0, 0, 0.2]}>
                <sphereGeometry args={[2.43, 64, 64]} />
                <meshStandardMaterial
                    map={cloudsMap}
                    transparent={true}
                    opacity={0.8}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* Atmosphere Halo */}
            <mesh scale={[1.15, 1.15, 1.15]}>
                <sphereGeometry args={[2.4, 64, 64]} />
                <meshBasicMaterial
                    color="#4F46E5"
                    transparent
                    opacity={0.15}
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </group>
    );
});
NetworkNode.displayName = "NetworkNode";

export const BrainScene = () => {
    const nodeRef = useRef<NetworkNodeHandle>(null);

    const handleMintTrigger = useCallback(() => {
        // Pass the signal to the Node
        if (nodeRef.current) {
            nodeRef.current.triggerMintEffect();
        }
    }, []);

    return (
        <div className="w-full h-full min-h-[500px] relative">
            <Canvas camera={{ position: [0, 0, 18], fov: 35 }}>

                {/* Cinematic Lighting Strategy */}

                {/* 1. Low Ambient: Ensures shadows are dark (black space) */}
                <ambientLight intensity={0.1} />

                {/* 2. Main Light (The Sun): Strong, from Front-Left. 
            Illuminates 2/3 of the Earth, leaving 1/3 in shadow. 
            Position: Left (-20), Up (5), Front (20) relative to Earth at (0,0,0) */}
                <directionalLight
                    position={[-20, 5, 20]}
                    intensity={4.5}
                    color="#ffffff"
                />

                {/* 3. Rim Light: Subtle back-light for edge definition, but kept low to maintain shadow contrast */}
                <spotLight
                    position={[10, 0, -10]}
                    angle={0.5}
                    penumbra={1}
                    intensity={1.0}
                    color="#4F46E5"
                />

                {/* Central Node (Earth) - Wrapped in Suspense for textures */}
                <Suspense fallback={null}>
                    <NetworkNode ref={nodeRef} />
                </Suspense>

                {/* The Manufacturing Loop */}
                <ParticleSystem onMintTrigger={handleMintTrigger} />

                <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />

                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
        </div>
    );
};

