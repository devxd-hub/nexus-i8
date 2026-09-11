/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface LightTunnelProps {
  cableColor?: string;
  pulseColor?: string;
  tunnelColor?: string;
  tunnelOpacity?: number;
  speed?: number;
  flowDirection?: 'outward' | 'inward';
  pulseSpeed?: number;
  pulseLength?: number;
  pulseBlend?: number;
  pulseWidth?: number;
  cableCount?: number;
  thickness?: number;
  rimWidth?: number;
  waviness?: number;
  sway?: number;
  size?: number;
  centerX?: number;
  centerY?: number;
  glow?: number;
  fadeNear?: number;
  fadeFar?: number;
  brightness?: number;
  colorVariance?: boolean;
  grain?: boolean;
  grainIntensity?: number;
  opacity?: number;
  mouseInteraction?: boolean;
  mouseStrength?: number;
  scrollProgress?: number; // Scroll-driven z-depth and warp
  className?: string;
}

/**
 * LIGHT TUNNEL
 * WebGL / Three.js GPU-accelerated cyber-optic light tunnel.
 * Creates an immersive volumetric tunnel of undulating glowing fiber optic cables
 * with travelling light pulses, atmospheric fog, and reactive mouse/scroll depth physics.
 */
export const LightTunnel: React.FC<LightTunnelProps> = ({
  cableColor = '#F97316',
  pulseColor = '#F97316',
  tunnelColor = '#F97316',
  tunnelOpacity = 0,
  speed = 0.05,
  flowDirection = 'outward',
  pulseSpeed = 2.15,
  pulseLength = 0.38,
  pulseBlend = 1,
  pulseWidth = 1,
  cableCount = 13,
  thickness = 0.35,
  rimWidth = 0.52,
  waviness = 0.16,
  sway = 0.5,
  size = 2.5,
  centerX = 0.0,
  centerY = 0.0,
  glow = 2.2,
  fadeNear = 0.5,
  fadeFar = 2,
  brightness = 1.0,
  colorVariance = true,
  grain = true,
  grainIntensity = 0.05,
  opacity = 1.0,
  mouseInteraction = true,
  mouseStrength = 0.1,
  scrollProgress = 0,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    scroll: scrollProgress,
    time: 0,
  });

  // Sync scrollProgress into ref
  useEffect(() => {
    stateRef.current.scroll = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a09, 0.035);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      100
    );
    camera.position.set(centerX, centerY, 5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Group for mouse sway & depth
    const tunnelGroup = new THREE.Group();
    scene.add(tunnelGroup);

    // Cable Generation
    const baseColor = new THREE.Color(cableColor);
    const pulseCol = new THREE.Color(pulseColor);
    const bgCol = new THREE.Color(tunnelColor);

    const pointsPerCable = 120;
    const tunnelLength = 40;
    const radius = size * 1.6;

    const cableGeometries: THREE.BufferGeometry[] = [];
    const cableMaterials: THREE.ShaderMaterial[] = [];

    // Custom Vertex & Fragment Shader for the volumetric glowing cables with travelling pulses
    const vertexShader = `
      uniform float uTime;
      uniform float uSpeed;
      uniform float uWaviness;
      uniform float uSway;
      uniform float uScroll;
      uniform vec2 uMouse;
      uniform float uFlowDir;

      attribute float aPhase;
      attribute float aRadiusOffset;
      attribute float aCableIndex;

      varying vec2 vUv;
      varying float vProgress;
      varying float vPhase;
      varying float vCableIndex;

      void main() {
        vUv = uv;
        vProgress = position.z / 40.0;
        vPhase = aPhase;
        vCableIndex = aCableIndex;

        vec3 pos = position;

        // Undulation wave along the tunnel
        float wave = sin(pos.z * 0.35 - uTime * 1.5 + aPhase) * uWaviness;
        float wave2 = cos(pos.z * 0.25 + uTime * 1.2 + aPhase * 1.3) * uWaviness;

        pos.x += wave + uMouse.x * uSway * (pos.z * 0.02);
        pos.y += wave2 + uMouse.y * uSway * (pos.z * 0.02);

        // Scroll warp compression
        pos.z -= uScroll * 15.0;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      uniform vec3 uCableColor;
      uniform vec3 uPulseColor;
      uniform float uPulseSpeed;
      uniform float uPulseLength;
      uniform float uPulseWidth;
      uniform float uPulseBlend;
      uniform float uGlow;
      uniform float uBrightness;
      uniform float uTime;
      uniform float uOpacity;
      uniform float uFadeNear;
      uniform float uFadeFar;
      uniform float uFlowDir;
      uniform float uGrainIntensity;
      uniform bool uGrain;
      uniform bool uColorVariance;

      varying vec2 vUv;
      varying float vProgress;
      varying float vPhase;
      varying float vCableIndex;

      // Pseudo-random noise for subtle film grain
      float rand(vec2 co) {
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
      }

      void main() {
        // Calculate moving pulse position along the cable
        float dir = uFlowDir;
        float pulsePos = fract((vProgress * dir * 3.0) + (uTime * uPulseSpeed * 0.15) + (vPhase * 0.2));
        
        // Pulse intensity gaussian bell
        float distToPulse = abs(pulsePos - 0.5);
        float pulse = smoothstep(uPulseLength * 0.5, 0.0, distToPulse);
        pulse = pow(pulse, max(1.0 / uPulseWidth, 0.2));

        // Color mix
        vec3 finalColor = uCableColor;
        if (uColorVariance) {
          finalColor += vec3(sin(vCableIndex * 1.1) * 0.08, cos(vCableIndex * 0.8) * 0.04, 0.0);
        }

        vec3 glowColor = mix(finalColor, uPulseColor, pulse * uPulseBlend);
        glowColor *= (1.0 + pulse * uGlow) * uBrightness;

        // Depth distance fade
        float depthFade = smoothstep(-5.0, 10.0, 40.0 * vProgress);
        float cameraFade = smoothstep(0.0, uFadeNear * 5.0, 40.0 * vProgress);

        float alpha = uOpacity * depthFade * cameraFade;

        if (uGrain) {
          float noise = (rand(gl_FragCoord.xy + uTime) - 0.5) * uGrainIntensity;
          glowColor += noise;
        }

        gl_FragColor = vec4(glowColor, alpha);
      }
    `;

    const sharedUniforms = {
      uTime: { value: 0 },
      uSpeed: { value: speed },
      uWaviness: { value: waviness },
      uSway: { value: sway },
      uScroll: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uFlowDir: { value: flowDirection === 'outward' ? -1.0 : 1.0 },
      uCableColor: { value: baseColor },
      uPulseColor: { value: pulseCol },
      uPulseSpeed: { value: pulseSpeed },
      uPulseLength: { value: pulseLength },
      uPulseWidth: { value: pulseWidth },
      uPulseBlend: { value: pulseBlend },
      uGlow: { value: glow },
      uBrightness: { value: brightness },
      uOpacity: { value: opacity },
      uFadeNear: { value: fadeNear },
      uFadeFar: { value: fadeFar },
      uGrainIntensity: { value: grainIntensity },
      uGrain: { value: grain },
      uColorVariance: { value: colorVariance },
    };

    // Create helical cables around cylinder
    for (let c = 0; c < cableCount; c++) {
      const angle = (c / cableCount) * Math.PI * 2;
      const curvePoints: THREE.Vector3[] = [];

      for (let i = 0; i < pointsPerCable; i++) {
        const t = i / (pointsPerCable - 1);
        const z = t * tunnelLength;
        const currentRadius = radius + Math.sin(t * Math.PI * 2 + c) * 0.25;
        const spiralAngle = angle + (t * Math.PI * 1.5) * (c % 2 === 0 ? 1 : -1) * 0.4;

        const x = Math.cos(spiralAngle) * currentRadius;
        const y = Math.sin(spiralAngle) * currentRadius;

        curvePoints.push(new THREE.Vector3(x, y, z));
      }

      const curve = new THREE.CatmullRomCurve3(curvePoints);
      const tubeGeo = new THREE.TubeGeometry(curve, 100, thickness * 0.08, 8, false);

      // Attributes
      const vertexCount = tubeGeo.attributes.position.count;
      const aPhase = new Float32Array(vertexCount);
      const aRadiusOffset = new Float32Array(vertexCount);
      const aCableIndex = new Float32Array(vertexCount);

      for (let v = 0; v < vertexCount; v++) {
        aPhase[v] = (c / cableCount) * Math.PI * 2;
        aRadiusOffset[v] = (c % 3) * 0.15;
        aCableIndex[v] = c;
      }

      tubeGeo.setAttribute('aPhase', new THREE.BufferAttribute(aPhase, 1));
      tubeGeo.setAttribute('aRadiusOffset', new THREE.BufferAttribute(aRadiusOffset, 1));
      tubeGeo.setAttribute('aCableIndex', new THREE.BufferAttribute(aCableIndex, 1));

      const tubeMat = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: THREE.UniformsUtils.clone(sharedUniforms),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(tubeGeo, tubeMat);
      tunnelGroup.add(mesh);

      cableGeometries.push(tubeGeo);
      cableMaterials.push(tubeMat);
    }

    // Outer subtle atmospheric tunnel rim cylinder
    if (tunnelOpacity > 0 || rimWidth > 0) {
      const rimGeo = new THREE.CylinderGeometry(radius * 1.2, radius * 1.2, tunnelLength, 32, 1, true);
      rimGeo.rotateX(Math.PI / 2);
      rimGeo.translate(0, 0, tunnelLength / 2);

      const rimMat = new THREE.MeshBasicMaterial({
        color: bgCol,
        transparent: true,
        opacity: Math.max(0.04, tunnelOpacity),
        side: THREE.BackSide,
        wireframe: true,
      });

      const rimMesh = new THREE.Mesh(rimGeo, rimMat);
      tunnelGroup.add(rimMesh);
    }

    // Mouse movement listener
    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseInteraction) return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      stateRef.current.mouse.targetX = nx * mouseStrength * 2.5;
      stateRef.current.mouse.targetY = ny * mouseStrength * 2.5;
    };

    if (mouseInteraction) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (!prefersReducedMotion) {
        stateRef.current.time += delta * speed * 20;
      }

      // Smooth mouse lerp
      stateRef.current.mouse.x += (stateRef.current.mouse.targetX - stateRef.current.mouse.x) * 0.08;
      stateRef.current.mouse.y += (stateRef.current.mouse.targetY - stateRef.current.mouse.y) * 0.08;

      const currentScroll = stateRef.current.scroll;

      // Update uniforms for each cable
      for (const mat of cableMaterials) {
        mat.uniforms.uTime.value = stateRef.current.time;
        mat.uniforms.uScroll.value = currentScroll;
        mat.uniforms.uMouse.value.set(stateRef.current.mouse.x, stateRef.current.mouse.y);
        mat.uniforms.uBrightness.value = brightness * (1.0 + currentScroll * 0.5);
      }

      // Dynamic camera / group rotation based on scroll and mouse
      tunnelGroup.rotation.z = stateRef.current.time * 0.08 + currentScroll * Math.PI * 0.5;
      tunnelGroup.position.x = stateRef.current.mouse.x * 0.8;
      tunnelGroup.position.y = stateRef.current.mouse.y * 0.8;

      renderer.render(scene, camera);
    };

    animate(performance.now());

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (mouseInteraction) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      for (const geo of cableGeometries) {
        geo.dispose();
      }
      for (const mat of cableMaterials) {
        mat.dispose();
      }
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [
    cableColor,
    pulseColor,
    tunnelColor,
    tunnelOpacity,
    speed,
    flowDirection,
    pulseSpeed,
    pulseLength,
    pulseBlend,
    pulseWidth,
    cableCount,
    thickness,
    rimWidth,
    waviness,
    sway,
    size,
    centerX,
    centerY,
    glow,
    fadeNear,
    fadeFar,
    brightness,
    colorVariance,
    grain,
    grainIntensity,
    opacity,
    mouseInteraction,
    mouseStrength,
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    />
  );
};

export default LightTunnel;
