
import React, { useRef, useMemo, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

// Workaround for missing React Three Fiber JSX type definitions in the current environment
// We augment the global JSX namespace to ensure compatibility
declare global {
    namespace JSX {
        interface IntrinsicElements {
            mesh: any;
            boxGeometry: any;
            meshStandardMaterial: any;
            group: any;
            cylinderGeometry: any;
            pointLight: any;
            ambientLight: any;
            spotLight: any;
            icosahedronGeometry: any;
            octahedronGeometry: any;
            torusGeometry: any;
            meshPhysicalMaterial: any;
            meshBasicMaterial: any;
            sphereGeometry: any;
            primitive: any;
            // Catch-all for standard HTML elements (div, span, etc.) and any others
            [elemName: string]: any;
        }
    }
}

// --- Constants & Colors ---
const SOLANA_GREEN = "#14F195";
const SOLANA_PURPLE = "#9945FF";
const GOLD = "#FFEA00"; // Brighter Yellow Gold
const GOLD_DARK = "#B45309";
const EMISSIVE_GOLD = "#FBBF24"; // Lighter Amber for glow
const EMISSIVE_FLASH = "#FFFFFF"; // Pure White for the "Minting Flash"

// --- Geometries (Visuals) ---

const KnowledgeCube = () => (
    <mesh>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial
            color="#E0F2FE"
            emissive="#0EA5E9"
            emissiveIntensity={0.2}
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

    // Shared material instance for the entire coin to ensure unified flashing and ref safety
    const coinMaterial = useMemo(() => {
        const mat = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(GOLD),
            metalness: 1.0,
            roughness: 0.15,
            clearcoat: 1.0,
            clearcoatRoughness: 0.05,
            emissive: new THREE.Color(EMISSIVE_GOLD),
            emissiveIntensity: 0.4
        });
        return mat;
    }, []);

    // Cleanup material on unmount
    useEffect(() => {
        return () => {
            coinMaterial.dispose();
        };
    }, [coinMaterial]);

    // State to track phase
    const [isCoin, setIsCoin] = useState(false);
    // Track time since became coin for physics calculations
    const coinTimeRef = useRef(0);

    // 1. Spawn Location: Random point on a sphere radius 14
    const startPos = useMemo(() => {
        const r = 14;
        const theta = Math.random() * Math.PI * 2; // Azimuth
        const phi = Math.acos((Math.random() * 2) - 1); // Inclination

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        return new THREE.Vector3(x, y, z);
    }, []);

    // Vector pointing towards center (normalized)
    const direction = useMemo(() => {
        return new THREE.Vector3(0, 0, 0).sub(startPos).normalize();
    }, [startPos]);

    // Input Speed
    const speedIn = 4;

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

        const currentPos = groupRef.current.position;

        if (!isCoin) {
            // --- Phase 1: Input (Knowledge) ---
            // Move towards center
            const moveStep = direction.clone().multiplyScalar(speedIn * delta);
            currentPos.add(moveStep);

            // Rotate cube slowly
            groupRef.current.rotation.x += delta;
            groupRef.current.rotation.y += delta;

            // Check distance to center (Transformation Trigger)
            if (currentPos.distanceTo(new THREE.Vector3(0, 0, 0)) < 0.2) {
                setIsCoin(true);
                onMint(); // Trigger the main block effect
                // Reset rotation for the coin to look neat
                groupRef.current.rotation.set(0, 0, 0);
                coinTimeRef.current = 0;
            }

        } else {
            // --- Phase 2: Output (Coin - The Minting Effect) ---
            coinTimeRef.current += delta;
            const t = coinTimeRef.current;

            // A. Movement: High Impulse Burst + Heavy Drag
            const burstSpeed = 25.0 * Math.exp(-8.0 * t);
            const driftSpeed = 1.5; // Slow drift after burst
            const currentSpeed = driftSpeed + burstSpeed;

            // Move outwards (same direction vector continuing through center)
            const moveStep = direction.clone().multiplyScalar(currentSpeed * delta);
            currentPos.add(moveStep);

            // B. Rotation: The "Coin Toss" (Spin)
            if (coinRef.current) {
                // Spin very fast initially (35.0), then slow down
                const spinSpeed = 2.0 + (35.0 * Math.exp(-4.0 * t));
                coinRef.current.rotation.z += spinSpeed * delta; // Main spin axis
                coinRef.current.rotation.x += (spinSpeed * 0.5) * delta; // Tumble
            }

            // C. Scale: The "Elastic Pop"
            if (coinRef.current) {
                let s = 1;
                if (t < 0.3) {
                    // Elastic Out function approximation
                    const p = t / 0.3;
                    s = Math.sin(-13 * (p + 1) * Math.PI / 2) * Math.pow(2, -10 * p) + 1;
                    s = s * 1.2; // Max scale multiplier
                } else {
                    s = 1.0;
                }
                coinRef.current.scale.setScalar(Math.max(0, s));
            }

            // D. Visuals: The "White Flash" on the shared material
            if (coinMaterial) {
                const flashDuration = 0.3;
                const flashFactor = Math.max(0, 1 - (t / flashDuration));

                const cWhite = new THREE.Color(EMISSIVE_FLASH);
                const cGold = new THREE.Color(EMISSIVE_GOLD);

                // Lerp towards Gold
                coinMaterial.emissive.lerpColors(cGold, cWhite, flashFactor);
                // Base intensity 0.4 + Flash
                coinMaterial.emissiveIntensity = 0.4 + (flashFactor * 5.0);
            }

            // Despawn when far away
            if (currentPos.distanceTo(new THREE.Vector3(0, 0, 0)) > 16) {
                onComplete(id);
            }
        }
    });

    return (
        // Pass position as array to prevent R3F/Three version mismatch treating Vector3 as read-only prop assignment
        <group ref={groupRef} position={[startPos.x, startPos.y, startPos.z]}>
            {!isCoin ? (
                <KnowledgeCube />
            ) : (
                <group ref={coinRef} rotation={[Math.PI / 2, 0, 0]}>

                    {/* --- THE PHYSICAL COIN DESIGN --- */}
                    {/* Using primitive to share the material instance across all parts */}

                    {/* 1. Main Cylinder Body (The Core) */}
                    <mesh>
                        <cylinderGeometry args={[0.58, 0.58, 0.08, 64]} />
                        <primitive object={coinMaterial} attach="material" />
                    </mesh>

                    {/* 2. The Reeded Edge (Simulated by a slightly larger cylinder) */}
                    <mesh rotation={[0, 0, 0]}>
                        <cylinderGeometry args={[0.6, 0.6, 0.06, 64]} />
                        <primitive object={coinMaterial} attach="material" />
                    </mesh>

                    {/* 3. The Faces (Front & Back Detail) */}
                    {[1, -1].map((side) => (
                        <group key={side} position={[0, side * 0.041, 0]} rotation={[side === 1 ? 0 : Math.PI, 0, 0]}>

                            {/* A. The Rim (Raised Torus flattened) */}
                            <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.5]}>
                                <torusGeometry args={[0.55, 0.03, 16, 64]} />
                                <primitive object={coinMaterial} attach="material" />
                            </mesh>

                            {/* B. The Beaded Ring (Small dots around the edge) */}
                            {beads.map((bead, idx) => (
                                <mesh key={idx} position={[bead.x, 0.01, bead.z]}>
                                    <sphereGeometry args={[0.03, 8, 8]} />
                                    <primitive object={coinMaterial} attach="material" />
                                </mesh>
                            ))}

                            {/* C. The Central Pedestal (Hexagon Base) */}
                            <mesh position={[0, 0.01, 0]} rotation={[0, Math.PI / 2, 0]}>
                                <cylinderGeometry args={[0.3, 0.3, 0.02, 6]} />
                                <meshPhysicalMaterial
                                    color={GOLD}
                                    metalness={1.0}
                                    roughness={0.3}
                                    emissive={EMISSIVE_GOLD}
                                    emissiveIntensity={0.2}
                                />
                            </mesh>

                            {/* D. The Gem Symbol (Embedded Value) */}
                            <mesh position={[0, 0.03, 0]} rotation={[0, Math.PI / 4, 0]}>
                                <octahedronGeometry args={[0.2, 0]} />
                                <meshStandardMaterial
                                    color="#FFFFE0"
                                    emissive={side === 1 ? SOLANA_GREEN : SOLANA_PURPLE}
                                    emissiveIntensity={1.0} // Brighter Gem
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
        // Spawn Rate: Every 2.0 seconds
        if (time - lastSpawnTime.current > 2.0) {
            lastSpawnTime.current = time;
            setParticles(prev => [...prev, { id: Math.random().toString(36).substr(2, 9) }]);
        }
    });

    const removeParticle = (id: string) => {
        setParticles(prev => prev.filter(p => p.id !== id));
    };

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

// --- Central Processor (The Block) ---

interface NetworkNodeHandle {
    triggerMintEffect: () => void;
}

const NetworkNode = forwardRef<NetworkNodeHandle, {}>((props, ref) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
    const lightRef = useRef<THREE.PointLight>(null);

    // Physics State for the Block
    const impulseRef = useRef(0);

    // Expose the trigger method to parent
    useImperativeHandle(ref, () => ({
        triggerMintEffect: () => {
            // Set impulse to 1.0 (Kick)
            impulseRef.current = 1.0;
        }
    }));

    useFrame((state, delta) => {
        // Decay the impulse (Damping)
        // Lerp impulse towards 0
        impulseRef.current = THREE.MathUtils.lerp(impulseRef.current, 0, delta * 8);

        if (meshRef.current) {
            // RECOIL / JIGGLE
            // Scale expands slightly (1.0 -> 1.1) based on impulse
            const scaleBump = 1.0 + (impulseRef.current * 0.15);
            meshRef.current.scale.setScalar(scaleBump);

            // Jiggle Rotation (Random vibration based on impulse)
            // Only vibrate when impulse is high
            if (impulseRef.current > 0.01) {
                meshRef.current.rotation.x += (Math.random() - 0.5) * impulseRef.current * 0.1;
                meshRef.current.rotation.y += (Math.random() - 0.5) * impulseRef.current * 0.1;
            }
        }

        if (materialRef.current) {
            // COLOR FLASH
            // Flash the block's transmission/color when hit
            // Normal color: #1e1b4b (Dark Blue)
            // Flash color: #14F195 (Solana Green)

            const normalColor = new THREE.Color("#1e1b4b");
            const flashColor = new THREE.Color(SOLANA_GREEN);

            materialRef.current.color.lerpColors(normalColor, flashColor, impulseRef.current * 0.8);
            materialRef.current.emissive.lerpColors(new THREE.Color("#000000"), flashColor, impulseRef.current * 0.5);
            materialRef.current.emissiveIntensity = impulseRef.current * 2;
        }

        if (lightRef.current) {
            // LIGHT PULSE
            // Inner light gets very bright
            lightRef.current.intensity = 3 + (impulseRef.current * 10);
            lightRef.current.distance = 8 + (impulseRef.current * 5);
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
            <group>
                {/* Core Polyhedron - Holographic/Glassy */}
                <mesh ref={meshRef}>
                    <icosahedronGeometry args={[2.2, 0]} />
                    <meshPhysicalMaterial
                        ref={materialRef}
                        color="#1e1b4b" // Deep Blue
                        transmission={0.6}
                        thickness={2}
                        roughness={0.1}
                        metalness={0.8}
                        clearcoat={1}
                        transparent
                        opacity={0.9}
                    />
                </mesh>

                {/* Inner Glow Core */}
                <pointLight ref={lightRef} intensity={3} color={SOLANA_GREEN} distance={8} decay={2} />

                {/* Energy Lines - Static outer shell, doesn't need to recoil as much */}
                <mesh scale={[1.05, 1.05, 1.05]}>
                    <icosahedronGeometry args={[2.2, 0]} />
                    <meshBasicMaterial color={SOLANA_GREEN} wireframe transparent opacity={0.3} />
                </mesh>

                {/* Energy Lines - Purple (Rotated) */}
                <mesh scale={[1.08, 1.08, 1.08]} rotation={[Math.PI / 3, Math.PI / 4, 0]}>
                    <icosahedronGeometry args={[2.2, 0]} />
                    <meshBasicMaterial color={SOLANA_PURPLE} wireframe transparent opacity={0.2} />
                </mesh>
            </group>
        </Float>
    );
});

// Explicitly set the display name for the forwardRef component
NetworkNode.displayName = 'NetworkNode';

export const BrainScene = () => {
    const nodeRef = useRef<NetworkNodeHandle>(null);

    const handleMintTrigger = () => {
        // Pass the signal to the Node
        if (nodeRef.current) {
            nodeRef.current.triggerMintEffect();
        }
    };

    return (
        <div className="w-full h-full min-h-[500px] relative">
            <Canvas camera={{ position: [0, 0, 18], fov: 35 }}>

                {/* Cinematic Lighting */}
                <ambientLight intensity={0.4} />
                <pointLight position={[-10, 10, 10]} intensity={1.5} color="#ffffff" />
                <spotLight
                    position={[15, 0, 10]}
                    angle={0.3}
                    penumbra={1}
                    intensity={3}
                    color={SOLANA_PURPLE}
                    castShadow
                />
                <spotLight
                    position={[-15, 0, -10]}
                    angle={0.3}
                    penumbra={1}
                    intensity={3}
                    color={SOLANA_GREEN}
                />

                {/* Central Node with Ref to receive triggers */}
                <NetworkNode ref={nodeRef} />

                {/* The Manufacturing Loop */}
                <ParticleSystem onMintTrigger={handleMintTrigger} />

                <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />

                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
        </div>
    );
};

export default BrainScene;
