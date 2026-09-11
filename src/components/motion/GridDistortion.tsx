/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';

export interface GridDistortionProps {
  imageSrc: string;
  grid?: number;
  mouse?: number;
  strength?: number;
  relaxation?: number;
  className?: string;
  lightColor?: string;
  darkColor?: string;
  tintColor?: string;
  onInteraction?: () => void;
  onClick?: () => void;
  alt?: string;
}

const VERTEX_SHADER = `
attribute vec2 a_position;
attribute vec2 a_uv;
varying vec2 v_uv;
varying float v_distortion;

uniform float u_aspect;

void main() {
  v_uv = a_uv;
  // Calculate normalized displacement magnitude from rest UV
  vec2 restPos = (a_uv * 2.0 - 1.0);
  v_distortion = length(a_position - restPos);
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;
varying vec2 v_uv;
varying float v_distortion;

uniform sampler2D u_image;
uniform vec3 u_lightColor;
uniform vec3 u_darkColor;
uniform vec3 u_tintColor;
uniform float u_interactionIntensity;

void main() {
  // Sample texture with subtle chromatic dispersion on high deformation areas
  float distShift = v_distortion * 0.015;
  vec4 colorR = texture2D(u_image, v_uv + vec2(distShift, 0.0));
  vec4 colorG = texture2D(u_image, v_uv);
  vec4 colorB = texture2D(u_image, v_uv - vec2(distShift * 0.5, 0.0));

  vec3 rgb = vec3(colorR.r, colorG.g, colorB.b);

  // Subtle contrast and warm tonal lift matching NEXUS editorial palette
  rgb = (rgb - 0.5) * 1.04 + 0.5;

  // Subtle warm amber sheen along wave crests when disturbed
  float sheen = smoothstep(0.01, 0.12, v_distortion) * 0.18 * u_interactionIntensity;
  rgb += u_tintColor * sheen;

  gl_FragColor = vec4(clamp(rgb, 0.0, 1.0), 1.0);
}
`;

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16) / 255;
    const g = parseInt(clean[1] + clean[1], 16) / 255;
    const b = parseInt(clean[2] + clean[2], 16) / 255;
    return [r, g, b];
  }
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return [isNaN(r) ? 1 : r, isNaN(g) ? 1 : g, isNaN(b) ? 1 : b];
}

/**
 * GridDistortion
 *
 * Distinctive interactive image distortion effect representing ideas taking form and physical touch.
 * Deforms a spring-mass 2D grid reacting directly to cursor pressure and inertia.
 */
export const GridDistortion: React.FC<GridDistortionProps> = ({
  imageSrc,
  grid = 12,
  mouse = 0.08,
  strength = 0.10,
  relaxation = 0.92,
  className = '',
  lightColor = '#F3EEE5',
  darkColor = '#0A0A09',
  tintColor = '#EF5A2A',
  onInteraction,
  onClick,
  alt = 'NEXUS Interactive Visual Exhibit',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const textureRef = useRef<WebGLTexture | null>(null);
  const posBufferRef = useRef<WebGLBuffer | null>(null);
  const rafRef = useRef<number | null>(null);

  // Interaction & Visibility State
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Physics Simulation Grid State
  const simGridRef = useRef<{
    cols: number;
    rows: number;
    numNodes: number;
    restX: Float32Array;
    restY: Float32Array;
    posX: Float32Array;
    posY: Float32Array;
    velX: Float32Array;
    velY: Float32Array;
    vertexBufferData: Float32Array;
    indicesCount: number;
  } | null>(null);

  const prevPointerRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const pointerVelRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isLoopRunningRef = useRef<boolean>(false);

  // Check Reduced Motion
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // IntersectionObserver to pause rendering when offscreen
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Initialize Spring Grid Geometry
  const initGridData = useCallback((gridCols: number, gridRows: number) => {
    const numCols = Math.max(4, Math.min(32, gridCols));
    const numRows = Math.max(4, Math.min(32, gridRows));
    const totalNodes = (numCols + 1) * (numRows + 1);

    const restX = new Float32Array(totalNodes);
    const restY = new Float32Array(totalNodes);
    const posX = new Float32Array(totalNodes);
    const posY = new Float32Array(totalNodes);
    const velX = new Float32Array(totalNodes);
    const velY = new Float32Array(totalNodes);

    for (let r = 0; r <= numRows; r++) {
      for (let c = 0; c <= numCols; c++) {
        const idx = r * (numCols + 1) + c;
        const u = c / numCols;
        const v = r / numRows;
        restX[idx] = u;
        restY[idx] = v;
        // Map [0,1] to clip space [-1, 1], flipping Y for standard texture coords
        posX[idx] = u * 2.0 - 1.0;
        posY[idx] = (1.0 - v) * 2.0 - 1.0;
        velX[idx] = 0;
        velY[idx] = 0;
      }
    }

    // Build Triangle Mesh Indices (2 triangles per quad cell = 6 indices)
    const numQuads = numCols * numRows;
    const indices = new Uint16Array(numQuads * 6);
    let ptr = 0;

    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        const i0 = r * (numCols + 1) + c;
        const i1 = i0 + 1;
        const i2 = (r + 1) * (numCols + 1) + c;
        const i3 = i2 + 1;

        // Quad triangles: (i0, i2, i1) and (i1, i2, i3)
        indices[ptr++] = i0;
        indices[ptr++] = i2;
        indices[ptr++] = i1;

        indices[ptr++] = i1;
        indices[ptr++] = i2;
        indices[ptr++] = i3;
      }
    }

    // Interleaved Vertex Buffer: [posX, posY, u, v] per node
    const vertexBufferData = new Float32Array(totalNodes * 4);
    for (let i = 0; i < totalNodes; i++) {
      vertexBufferData[i * 4 + 0] = posX[i];
      vertexBufferData[i * 4 + 1] = posY[i];
      vertexBufferData[i * 4 + 2] = restX[i];
      vertexBufferData[i * 4 + 3] = restY[i];
    }

    simGridRef.current = {
      cols: numCols,
      rows: numRows,
      numNodes: totalNodes,
      restX,
      restY,
      posX,
      posY,
      velX,
      velY,
      vertexBufferData,
      indicesCount: indices.length,
    };

    return { indices };
  }, []);

  // WebGL Pipeline Setup
  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: true,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    });

    if (!gl) {
      setWebglFailed(true);
      return;
    }
    glRef.current = gl;

    // Helper: Compile Shader
    function createShader(type: number, source: string): WebGLShader | null {
      if (!gl) return null;
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('GridDistortion Shader error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('GridDistortion Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    programRef.current = program;
    gl.useProgram(program);

    // Initialize Geometry
    const { indices } = initGridData(grid, Math.round(grid * 0.75));

    // Create Index Buffer
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    // Create Vertex Attribute Buffer
    const posBuffer = gl.createBuffer();
    posBufferRef.current = posBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    if (simGridRef.current) {
      gl.bufferData(gl.ARRAY_BUFFER, simGridRef.current.vertexBufferData, gl.DYNAMIC_DRAW);
    }

    const aPosition = gl.getAttribLocation(program, 'a_position');
    const aUv = gl.getAttribLocation(program, 'a_uv');

    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0);

    gl.enableVertexAttribArray(aUv);
    gl.vertexAttribPointer(
      aUv,
      2,
      gl.FLOAT,
      false,
      4 * Float32Array.BYTES_PER_ELEMENT,
      2 * Float32Array.BYTES_PER_ELEMENT
    );

    // Load Texture
    const texture = gl.createTexture();
    textureRef.current = texture;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      if (!glRef.current || !textureRef.current) return;
      gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      renderStaticFrame();
    };

    // Set Uniforms
    const uLightColor = gl.getUniformLocation(program, 'u_lightColor');
    const uDarkColor = gl.getUniformLocation(program, 'u_darkColor');
    const uTintColor = gl.getUniformLocation(program, 'u_tintColor');
    const uIntensity = gl.getUniformLocation(program, 'u_interactionIntensity');

    const lightRgb = hexToRgb(lightColor);
    const darkRgb = hexToRgb(darkColor);
    const tintRgb = hexToRgb(tintColor);

    gl.uniform3f(uLightColor, lightRgb[0], lightRgb[1], lightRgb[2]);
    gl.uniform3f(uDarkColor, darkRgb[0], darkRgb[1], darkRgb[2]);
    gl.uniform3f(uTintColor, tintRgb[0], tintRgb[1], tintRgb[2]);
    gl.uniform1f(uIntensity, 1.0);

    function renderStaticFrame() {
      if (!gl || !program || !simGridRef.current) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.04, 0.04, 0.035, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawElements(gl.TRIANGLES, simGridRef.current.indicesCount, gl.UNSIGNED_SHORT, 0);
    }

    renderStaticFrame();

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (gl) {
        if (texture) gl.deleteTexture(texture);
        if (posBuffer) gl.deleteBuffer(posBuffer);
        if (indexBuffer) gl.deleteBuffer(indexBuffer);
        if (vs) gl.deleteShader(vs);
        if (fs) gl.deleteShader(fs);
        if (program) gl.deleteProgram(program);
      }
      isLoopRunningRef.current = false;
    };
  }, [imageSrc, grid, lightColor, darkColor, tintColor, prefersReducedMotion, initGridData]);

  // Main Physics Simulation Step & Render Frame
  const stepAndRender = useCallback(() => {
    const gl = glRef.current;
    const canvas = canvasRef.current;
    const sim = simGridRef.current;
    const posBuffer = posBufferRef.current;

    if (!gl || !canvas || !sim || !posBuffer) return false;

    let totalEnergy = 0;
    const kSpring = (1.0 - relaxation) * 0.72; // Spring restore stiffness
    const damp = Math.max(0.85, Math.min(0.98, relaxation));

    for (let i = 0; i < sim.numNodes; i++) {
      const restClipX = sim.restX[i] * 2.0 - 1.0;
      const restClipY = (1.0 - sim.restY[i]) * 2.0 - 1.0;

      // Spring displacement vector towards rest position
      const dx = restClipX - sim.posX[i];
      const dy = restClipY - sim.posY[i];

      // Physical spring acceleration + damping
      sim.velX[i] = (sim.velX[i] + dx * kSpring) * damp;
      sim.velY[i] = (sim.velY[i] + dy * kSpring) * damp;

      sim.posX[i] += sim.velX[i];
      sim.posY[i] += sim.velY[i];

      // Update vertex buffer data
      sim.vertexBufferData[i * 4 + 0] = sim.posX[i];
      sim.vertexBufferData[i * 4 + 1] = sim.posY[i];

      totalEnergy += Math.abs(sim.velX[i]) + Math.abs(sim.velY[i]) + Math.abs(dx) + Math.abs(dy);
    }

    // Upload updated vertex coordinates to GPU
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, sim.vertexBufferData);

    // Draw mesh
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.drawElements(gl.TRIANGLES, sim.indicesCount, gl.UNSIGNED_SHORT, 0);

    // Return true if simulation is still active
    return totalEnergy > 0.0002 || isHovered;
  }, [relaxation, isHovered]);

  // Animation Loop Management with Idle Sleeping
  const startLoopIfNeeded = useCallback(() => {
    if (isLoopRunningRef.current || !isVisible || prefersReducedMotion) return;

    isLoopRunningRef.current = true;

    function loop() {
      const stillActive = stepAndRender();
      if (stillActive) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        // Sleep state — zero CPU/GPU overhead when settled!
        isLoopRunningRef.current = false;
        rafRef.current = null;
      }
    }

    rafRef.current = requestAnimationFrame(loop);
  }, [isVisible, prefersReducedMotion, stepAndRender]);

  // Pointer Interaction Handlers
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;

    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const nx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const ny = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    const now = performance.now();
    let vx = 0;
    let vy = 0;

    if (prevPointerRef.current) {
      const dt = Math.max(8, now - prevPointerRef.current.time);
      vx = (nx - prevPointerRef.current.x) / (dt * 0.06);
      vy = (ny - prevPointerRef.current.y) / (dt * 0.06);
    }

    prevPointerRef.current = { x: nx, y: ny, time: now };
    pointerVelRef.current = { x: vx, y: vy };

    // Apply impulse to nearby spring nodes
    const sim = simGridRef.current;
    if (sim) {
      const radius = Math.max(0.04, Math.min(0.25, mouse));
      const str = Math.max(0.02, Math.min(0.35, strength));

      for (let i = 0; i < sim.numNodes; i++) {
        const u = sim.restX[i];
        const v = sim.restY[i];

        const distSq = (u - nx) * (u - nx) + (v - ny) * (v - ny);
        const rSq = radius * radius;

        if (distSq < rSq) {
          const dist = Math.sqrt(distSq);
          const falloff = Math.pow(1.0 - dist / radius, 2.0);

          // Combined tangential velocity impulse + gentle radial displacement
          const pushX = (vx * 0.6 + (u - nx) * 0.4) * str * falloff;
          const pushY = (-vy * 0.6 + (v - ny) * 0.4) * str * falloff;

          sim.velX[i] += pushX;
          sim.velY[i] += pushY;
        }
      }
    }

    if (!hasInteracted) {
      setHasInteracted(true);
      onInteraction?.();
    }

    startLoopIfNeeded();
  };

  const handlePointerEnter = () => {
    setIsHovered(true);
    startLoopIfNeeded();
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    prevPointerRef.current = null;
    startLoopIfNeeded();
  };

  return (
    <div
      ref={containerRef}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={onClick}
      className={`relative w-full h-full select-none overflow-hidden touch-none ${
        onClick ? 'cursor-pointer' : 'cursor-crosshair'
      } ${className}`}
      role="img"
      aria-label={alt}
    >
      {/* WebGL Accelerated Canvas Surface */}
      {!webglFailed && !prefersReducedMotion ? (
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none block"
          aria-hidden="true"
        />
      ) : (
        /* Accessible Static Image Fallback */
        <img
          src={imageSrc}
          alt={alt}
          className="w-full h-full object-cover pointer-events-none block filter contrast-[1.04]"
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
};

export default GridDistortion;
