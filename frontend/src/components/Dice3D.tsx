import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { type Group } from "three";

interface Dice3DProps {
  sides: number;
  /** When this changes, the dice will animate-roll to `result`. */
  rollKey: number;
  result: number | null;
  rolling: boolean;
}

/** Stylized rolling die. Not real physics — a tween that lands on the result. */
function Die({ result, rolling, sides }: { result: number | null; rolling: boolean; sides: number }) {
  const group = useRef<Group>(null);
  const targetRot = useRef({ x: 0, y: 0, z: 0 });
  const [displayValue, setDisplayValue] = useState<number | null>(result);

  useEffect(() => {
    if (rolling) {
      targetRot.current = {
        x: Math.random() * Math.PI * 12 + Math.PI * 6,
        y: Math.random() * Math.PI * 12 + Math.PI * 6,
        z: Math.random() * Math.PI * 12 + Math.PI * 6,
      };
      let tick = 0;
      const flick = window.setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * sides) + 1);
        tick++;
        if (tick > 16) {
          window.clearInterval(flick);
          setDisplayValue(result);
        }
      }, 70);
      return () => window.clearInterval(flick);
    } else {
      setDisplayValue(result);
    }
  }, [rolling, result, sides, /* rollKey indirectly via rolling toggling */ ]);

  useFrame((_, delta) => {
    if (!group.current) return;
    if (rolling) {
      group.current.rotation.x += delta * 6;
      group.current.rotation.y += delta * 7.5;
      group.current.rotation.z += delta * 4;
    } else {
      // Idle gentle wobble.
      group.current.rotation.x += delta * 0.2;
      group.current.rotation.y += delta * 0.3;
    }
  });

  const faceColor = "var(--accent)";

  return (
    <group ref={group}>
      <mesh castShadow>
        <boxGeometry args={[1.6, 1.6, 1.6]} />
        <meshStandardMaterial color="#1f1a3a" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* Edges */}
      <lineSegments>
        <edgesGeometry args={[undefined as never]} attach="geometry" />
      </lineSegments>
      {/* Number on the front face */}
      <Text
        position={[0, 0, 0.82]}
        fontSize={0.9}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04}
        outlineColor="#000"
      >
        {displayValue ?? "?"}
        <meshStandardMaterial attach="material" color={faceColor} emissive={faceColor} emissiveIntensity={0.6} />
      </Text>
      {/* Number on the back face (mirrored) */}
      <Text
        position={[0, 0, -0.82]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.9}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04}
        outlineColor="#000"
      >
        {displayValue ?? "?"}
        <meshStandardMaterial attach="material" color={faceColor} emissive={faceColor} emissiveIntensity={0.6} />
      </Text>
    </group>
  );
}

export function Dice3D({ sides, rollKey, result, rolling }: Dice3DProps) {
  // rollKey is included so React rerenders on every roll request.
  return (
    <div className="w-full aspect-square max-w-[200px] mx-auto" key={rollKey}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[-3, -2, -3]} intensity={0.6} color="#b794f6" />
        <Die result={result} rolling={rolling} sides={sides} />
      </Canvas>
    </div>
  );
}
