"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const CURVE_POINTS = [
  new THREE.Vector3(-4, -2, 0),
  new THREE.Vector3(-1.5, 1, 1),
  new THREE.Vector3(1, -1, -1),
  new THREE.Vector3(3.5, 2, 0.5),
  new THREE.Vector3(5, -0.5, 0),
];

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    float t = vUv.x + sin(uTime * 0.15) * 0.05;
    vec3 color = t < 0.5
      ? mix(uColorA, uColorB, t * 2.0)
      : mix(uColorB, uColorC, (t - 0.5) * 2.0);

    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
    color += fresnel * 0.15;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function RibbonMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(CURVE_POINTS);
    return new THREE.TubeGeometry(curve, 128, 0.6, 24, false);
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color("#533afd") }, // brand indigo
      uColorB: { value: new THREE.Color("#8b7bff") }, // light tint
      uColorC: { value: new THREE.Color("#0ea5b7") }, // brand teal replacing berry for continuity
    }),
    []
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (materialRef.current) materialRef.current.uniforms.uTime.value = t;
    if (meshRef.current) {
      // gentle idle sway
      meshRef.current.rotation.y = Math.sin(t * 0.08) * 0.15;
      meshRef.current.rotation.x = Math.cos(t * 0.06) * 0.08;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function HeroWave() {
  return (
    <div className="hero-wave-canvas" aria-hidden="true" style={{ width: "100%", height: "100%" }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]}>
        <RibbonMesh />
      </Canvas>
    </div>
  );
}
