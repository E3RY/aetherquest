import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import { type Group } from "three";
import { type ThemeName } from "../store/theme";

interface OverworldMapProps {
  theme: ThemeName;
  markers?: { id: number; label: string; x: number; z: number }[];
}

const THEME_PALETTES: Record<ThemeName, { ground: string; accent: string; accent2: string; sky: string }> = {
  classic_fantasy: { ground: "#2a1e4d", accent: "#b794f6", accent2: "#f6e05e", sky: "#0e0a1c" },
  pirate: { ground: "#0f3a52", accent: "#e6b450", accent2: "#4fc3e6", sky: "#061520" },
  futuristic: { ground: "#101a36", accent: "#00f5ff", accent2: "#ff3df0", sky: "#050812" },
  post_apoc: { ground: "#2a1f12", accent: "#d97706", accent2: "#84cc16", sky: "#14100a" },
};

function Platform({ x, z, h, color }: { x: number; z: number; h: number; color: string }) {
  return (
    <mesh position={[x, h / 2 - 0.2, z]} castShadow receiveShadow>
      <boxGeometry args={[1.4, h, 1.4]} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  );
}

function ThemeProps({ theme, palette }: { theme: ThemeName; palette: typeof THEME_PALETTES["classic_fantasy"] }) {
  // Theme-specific decor objects.
  if (theme === "pirate") {
    return (
      <>
        {/* Ship: hull + masts */}
        <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
          <group position={[2.5, 0.4, 1.5]}>
            <mesh castShadow>
              <boxGeometry args={[1.2, 0.5, 0.5]} />
              <meshStandardMaterial color="#3b2310" />
            </mesh>
            <mesh position={[0, 0.7, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 1.4, 8]} />
              <meshStandardMaterial color="#888" />
            </mesh>
            <mesh position={[0, 0.85, 0]} castShadow>
              <planeGeometry args={[0.6, 0.5]} />
              <meshStandardMaterial color={palette.accent} side={2} />
            </mesh>
          </group>
        </Float>
        {/* Kraken tentacle: cylinder */}
        <mesh position={[-2.5, 0.6, -1.5]} rotation={[0, 0, Math.PI / 6]} castShadow>
          <cylinderGeometry args={[0.15, 0.05, 1.6, 8]} />
          <meshStandardMaterial color="#1d3e54" />
        </mesh>
      </>
    );
  }
  if (theme === "futuristic") {
    return (
      <>
        {/* Spire */}
        <mesh position={[2.5, 1.2, 1.5]} castShadow>
          <coneGeometry args={[0.25, 2.4, 6]} />
          <meshStandardMaterial color={palette.accent} emissive={palette.accent} emissiveIntensity={0.6} />
        </mesh>
        {/* Orbiting ring */}
        <mesh position={[-2, 1, -1.5]} rotation={[Math.PI / 2.6, 0.4, 0]}>
          <torusGeometry args={[0.6, 0.04, 8, 24]} />
          <meshStandardMaterial color={palette.accent2} emissive={palette.accent2} emissiveIntensity={0.5} />
        </mesh>
      </>
    );
  }
  if (theme === "post_apoc") {
    return (
      <>
        {/* Broken pillar */}
        <mesh position={[2.5, 0.7, 1.5]} rotation={[0, 0, 0.18]} castShadow>
          <cylinderGeometry args={[0.18, 0.22, 1.4, 6]} />
          <meshStandardMaterial color="#5a4a36" />
        </mesh>
        {/* Smoke (gray sphere) */}
        <mesh position={[-2, 0.6, -1.5]}>
          <sphereGeometry args={[0.4, 12, 12]} />
          <meshStandardMaterial color="#3a3025" transparent opacity={0.5} />
        </mesh>
      </>
    );
  }
  // classic_fantasy: floating crystals
  return (
    <>
      <Float speed={1} floatIntensity={0.6}>
        <mesh position={[2.5, 1.2, 1.5]} castShadow>
          <octahedronGeometry args={[0.4]} />
          <meshStandardMaterial color={palette.accent} emissive={palette.accent} emissiveIntensity={0.45} />
        </mesh>
      </Float>
      <Float speed={1.4} floatIntensity={0.5}>
        <mesh position={[-2.5, 1.0, -1.5]} castShadow>
          <octahedronGeometry args={[0.3]} />
          <meshStandardMaterial color={palette.accent2} emissive={palette.accent2} emissiveIntensity={0.45} />
        </mesh>
      </Float>
    </>
  );
}

function Marker({ x, z, color }: { x: number; z: number; color: string }) {
  const ref = useRef<Group>(null);
  useFrame((s) => {
    if (ref.current) ref.current.position.y = 1.6 + Math.sin(s.clock.elapsedTime * 2) * 0.08;
  });
  return (
    <group ref={ref} position={[x, 1.6, z]}>
      <mesh castShadow>
        <coneGeometry args={[0.15, 0.4, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

function Scene({ theme, markers }: { theme: ThemeName; markers: OverworldMapProps["markers"] }) {
  const palette = THEME_PALETTES[theme];
  // Generate a small grid of platforms with varied heights.
  const platforms = useMemo(() => {
    const result: { x: number; z: number; h: number }[] = [];
    for (let xi = -2; xi <= 2; xi++) {
      for (let zi = -2; zi <= 2; zi++) {
        if (Math.abs(xi) + Math.abs(zi) > 3) continue;
        const seed = (xi + 3) * 7 + (zi + 3) * 13;
        const h = 0.4 + ((seed % 7) / 7) * 0.9;
        result.push({ x: xi * 1.6, z: zi * 1.6, h });
      }
    }
    return result;
  }, []);

  return (
    <>
      <color attach="background" args={[palette.sky]} />
      <fog attach="fog" args={[palette.sky, 8, 22]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[6, 10, 4]} intensity={1.2} castShadow />
      <pointLight position={[-4, 4, -3]} intensity={0.6} color={palette.accent} />

      {platforms.map((p, i) => (
        <Platform key={i} x={p.x} z={p.z} h={p.h} color={palette.ground} />
      ))}

      <ThemeProps theme={theme} palette={palette} />

      {(markers ?? []).map((m) => (
        <Marker key={m.id} x={m.x} z={m.z} color={palette.accent2} />
      ))}

      <OrbitControls
        enablePan={false}
        minDistance={6}
        maxDistance={14}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.3}
      />
    </>
  );
}

export function OverworldMap({ theme, markers }: OverworldMapProps) {
  return (
    <div className="w-full h-72 md:h-96 rounded-2xl overflow-hidden border border-border bg-surface">
      <Canvas shadows camera={{ position: [6, 6, 8], fov: 42 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <Scene theme={theme} markers={markers} />
        </Suspense>
      </Canvas>
    </div>
  );
}
