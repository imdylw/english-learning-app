import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uRayIntensity;
uniform float uRayCount;
uniform vec2 uMouse;

varying vec2 vUv;

float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i.x + i.y * 57.0);
  float b = hash(i.x + 1.0 + i.y * 57.0);
  float c = hash(i.x + i.y * 57.0 + 1.0);
  float d = hash(i.x + 1.0 + i.y * 57.0 + 1.0);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 5; i++) {
    sum += amp * noise(p * freq);
    amp *= 0.5;
    freq *= 2.0;
  }
  return sum;
}

float rayMarch(vec2 uv, vec2 origin, float angle, float width) {
  vec2 dir = vec2(cos(angle), sin(angle));
  vec2 perp = vec2(-dir.y, dir.x);
  float dist = abs(dot(uv - origin, perp));
  float along = dot(uv - origin, dir);
  return exp(-dist * dist / (width * width * 0.02)) * exp(-along * 0.3) * smoothstep(0.0, 0.1, along);
}

void main() {
  vec2 uv = vUv;
  uv.x *= (16.0 / 9.0);

  vec2 origin = vec2(0.5 * (16.0/9.0) + (uMouse.x - 0.5) * 0.3, 1.0 + (uMouse.y - 0.5) * 0.3);

  float rayIntensity = 0.0;
  for (float i = 0.0; i < 6.0; i++) {
    float angle = -1.57 + (i / 6.0 - 0.5) * 1.2 + sin(uTime * 0.15 + i) * 0.08;
    float width = 0.6 + sin(uTime * 0.2 + i * 1.3) * 0.15;
    rayIntensity += rayMarch(uv, origin, angle, width);
  }

  rayIntensity *= uRayIntensity / 6.0;

  float noiseVal = fbm(uv * 3.0 + vec2(uTime * 0.05, 0.0));
  float dust = fbm(uv * 5.0 + vec2(-uTime * 0.02, uTime * 0.03)) * 0.3;

  rayIntensity *= 0.7 + noiseVal * 0.6;
  rayIntensity += dust * 0.15 * uRayIntensity;

  vec3 col = mix(uColor2, uColor1, clamp(rayIntensity, 0.0, 1.0));

  float vignette = 1.0 - smoothstep(0.3, 1.2, length(uv - vec2(0.5 * (16.0/9.0), 0.5)));
  col *= 0.7 + vignette * 0.3;

  gl_FragColor = vec4(col, 1.0);
}
`;

function RayPlane({ className }: { className?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color("#d4a843") },
      uColor2: { value: new THREE.Color("#0a1628") },
      uRayIntensity: { value: 1.2 },
      uRayCount: { value: 6.0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    }),
    []
  );

  useFrame((state) => {
    const material = meshRef.current?.material as THREE.ShaderMaterial;
    if (!material) return;
    material.uniforms.uTime.value = state.clock.elapsedTime;
    mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
    mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;
    material.uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);
  });

  const handlePointerMove = (e: THREE.Event) => {
    const event = e as unknown as { uv?: THREE.Vector2 };
    if (event.uv) {
      mouseRef.current.targetX = event.uv.x;
      mouseRef.current.targetY = event.uv.y;
    }
  };

  return (
    <mesh ref={meshRef} position={[0, 0, -1]} onPointerMove={handlePointerMove}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function CrepuscularRays({}: { className?: string }) {
  return (
    <Canvas
      
      orthographic
      camera={{ zoom: 1, position: [0, 0, 1] }}
      style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}
      gl={{ alpha: false, antialias: false }}
    >
      <RayPlane />
    </Canvas>
  );
}
