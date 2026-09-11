/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';

export interface ColorBendsProps {
  colors?: string[];
  rotation?: number;
  speed?: number;
  scale?: number;
  frequency?: number;
  warpStrength?: number;
  mouseInfluence?: number;
  noise?: number;
  parallax?: number;
  iterations?: number;
  intensity?: number;
  bandWidth?: number;
  transparent?: boolean;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

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

const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = (a_position + 1.0) * 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;
varying vec2 v_uv;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_rotation;
uniform float u_speed;
uniform float u_scale;
uniform float u_frequency;
uniform float u_warpStrength;
uniform float u_mouseInfluence;
uniform float u_noise;
uniform float u_parallax;
uniform float u_iterations;
uniform float u_intensity;
uniform float u_bandWidth;
uniform float u_transparent;

uniform vec3 u_color0;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;
uniform vec3 u_color4;
uniform vec3 u_accentColor;
uniform float u_numColors;

// Simplex-style 2D hash & noise
vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise2D(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
        dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
        dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
    u.y
  );
}

vec3 getPaletteColor(float t) {
  float count = max(2.0, u_numColors);
  float normT = fract(t);
  float scaled = normT * count;
  float idx = floor(scaled);
  float f = smoothstep(0.0, 1.0, fract(scaled));

  vec3 cA = u_color0;
  vec3 cB = u_color1;

  if (idx < 0.5) {
    cA = u_color0;
    cB = u_color1;
  } else if (idx < 1.5) {
    cA = u_color1;
    cB = (count > 2.5) ? u_color2 : u_color0;
  } else if (idx < 2.5) {
    cA = u_color2;
    cB = (count > 3.5) ? u_color3 : u_color0;
  } else if (idx < 3.5) {
    cA = u_color3;
    cB = (count > 4.5) ? u_color4 : u_color0;
  } else {
    cA = u_color4;
    cB = u_color0;
  }

  return mix(cA, cB, f);
}

void main() {
  vec2 st = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);

  // Parallax shift from smooth cursor
  vec2 mouseDelta = (u_mouse - 0.5) * u_parallax * u_mouseInfluence;
  st += mouseDelta;

  // Rotation
  float rad = u_rotation * 0.017453292519943295;
  mat2 rot = mat2(cos(rad), -sin(rad), sin(rad), cos(rad));
  vec2 uvRot = rot * st * u_scale;

  float t = u_time * u_speed;

  // Domain warping across iterations
  vec2 q = uvRot;
  for (float iter = 0.0; iter < 4.0; iter += 1.0) {
    if (iter >= u_iterations) break;
    float n1 = noise2D(q * (1.5 + iter * 0.5) + vec2(t * 0.4, -t * 0.3)) * u_noise * 3.0;
    float n2 = noise2D(q * (2.0 + iter * 0.4) - vec2(t * 0.3, t * 0.5)) * u_noise * 3.0;
    q.x += (sin(q.y * u_frequency * 3.14159 + t + n1) * 0.35 + n1) * u_warpStrength;
    q.y += (cos(q.x * u_frequency * 3.14159 - t * 0.8 + n2) * 0.35 + n2) * u_warpStrength;
  }

  // Calculate ribbon coordinate
  float ribbonCoord = (q.x * 0.6 + q.y * 0.8) * (u_bandWidth * 0.35) + t * 0.2;
  float ribbonWave = sin(ribbonCoord * 3.14159) * 0.5 + 0.5;

  // Multi-stop generative color blending
  vec3 baseColor = getPaletteColor(ribbonCoord * 0.25);
  vec3 accent = u_accentColor;

  // Accent highlight lines
  float accentLine = pow(ribbonWave, 4.0) * 0.7;
  vec3 finalColor = mix(baseColor, accent, accentLine);

  // Apply intensity
  finalColor *= u_intensity;

  if (u_transparent > 0.5) {
    // Elegant organic transparency that lets the background breathe
    float alpha = smoothstep(0.02, 0.45, length(finalColor)) * clamp(u_intensity * 0.65, 0.0, 0.85);
    // Soft vignette at borders
    vec2 borderD = abs(v_uv - 0.5) * 2.0;
    float vignette = 1.0 - smoothstep(0.85, 1.0, max(borderD.x, borderD.y));
    alpha *= vignette;
    gl_FragColor = vec4(finalColor, alpha);
  } else {
    gl_FragColor = vec4(finalColor, 1.0);
  }
}
`;

export const ColorBends: React.FC<ColorBendsProps> = ({
  colors = ['#EF5A2A', '#F26504', '#2A2421', '#D94A1F', '#FAF6F0'],
  rotation = 90,
  speed = 0.2,
  scale = 1,
  frequency = 1,
  warpStrength = 1,
  mouseInfluence = 1,
  noise = 0.15,
  parallax = 0.5,
  iterations = 1,
  intensity = 1.5,
  bandWidth = 6,
  transparent = true,
  color = '#EF5A2A',
  className = '',
  style = {},
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const rafRef = useRef<number | null>(null);

  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Smooth mouse inertia tracking
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0.5,
    y: 0.5,
    targetX: 0.5,
    targetY: 0.5,
  });

  // Reduced motion support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // IntersectionObserver to pause rendering when off-screen
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.05 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Pause when tab is inactive
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handleVisChange = () => {
      setIsVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisChange);
    return () => document.removeEventListener('visibilitychange', handleVisChange);
  }, []);

  // Pointer movement tracking
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = 1.0 - (e.clientY - rect.top) / rect.height;
    mouseRef.current.targetX = nx;
    mouseRef.current.targetY = ny;
  };

  // WebGL Pipeline Initialization
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    });

    if (!gl) return;
    glRef.current = gl;

    function createShader(type: number, source: string): WebGLShader | null {
      if (!gl) return null;
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('ColorBends Shader error:', gl.getShaderInfoLog(shader));
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
      console.error('ColorBends Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    programRef.current = program;
    gl.useProgram(program);

    // Full screen quad
    const quadVertices = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ]);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    // Uniform Locations
    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uRotation = gl.getUniformLocation(program, 'u_rotation');
    const uSpeed = gl.getUniformLocation(program, 'u_speed');
    const uScale = gl.getUniformLocation(program, 'u_scale');
    const uFrequency = gl.getUniformLocation(program, 'u_frequency');
    const uWarpStrength = gl.getUniformLocation(program, 'u_warpStrength');
    const uMouseInfluence = gl.getUniformLocation(program, 'u_mouseInfluence');
    const uNoise = gl.getUniformLocation(program, 'u_noise');
    const uParallax = gl.getUniformLocation(program, 'u_parallax');
    const uIterations = gl.getUniformLocation(program, 'u_iterations');
    const uIntensity = gl.getUniformLocation(program, 'u_intensity');
    const uBandWidth = gl.getUniformLocation(program, 'u_bandWidth');
    const uTransparent = gl.getUniformLocation(program, 'u_transparent');

    const uColor0 = gl.getUniformLocation(program, 'u_color0');
    const uColor1 = gl.getUniformLocation(program, 'u_color1');
    const uColor2 = gl.getUniformLocation(program, 'u_color2');
    const uColor3 = gl.getUniformLocation(program, 'u_color3');
    const uColor4 = gl.getUniformLocation(program, 'u_color4');
    const uAccentColor = gl.getUniformLocation(program, 'u_accentColor');
    const uNumColors = gl.getUniformLocation(program, 'u_numColors');

    // Parse Palette Colors
    const paletteRgb = colors.slice(0, 5).map(hexToRgb);
    const accentRgb = hexToRgb(color);

    const c0 = paletteRgb[0] || [0.937, 0.353, 0.165];
    const c1 = paletteRgb[1] || [0.949, 0.396, 0.016];
    const c2 = paletteRgb[2] || [0.165, 0.141, 0.129];
    const c3 = paletteRgb[3] || [0.851, 0.290, 0.122];
    const c4 = paletteRgb[4] || [0.980, 0.965, 0.941];

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 400;

    function resize() {
      if (!canvas || !container || !gl) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    resize();
    window.addEventListener('resize', resize);

    const startTime = performance.now();

    function render(now: number) {
      if (!gl || !program) return;

      const elapsed = (now - startTime) * 0.001;
      const effectiveSpeed = prefersReducedMotion ? 0.02 : speed;

      // Mouse lerp inertia
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06;

      gl.useProgram(program);

      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);
      gl.uniform1f(uTime, elapsed);
      gl.uniform1f(uRotation, rotation);
      gl.uniform1f(uSpeed, effectiveSpeed);
      gl.uniform1f(uScale, scale);
      gl.uniform1f(uFrequency, frequency);
      gl.uniform1f(uWarpStrength, warpStrength);
      gl.uniform1f(uMouseInfluence, mouseInfluence);
      gl.uniform1f(uNoise, noise);
      gl.uniform1f(uParallax, parallax);
      gl.uniform1f(uIterations, iterations);
      gl.uniform1f(uIntensity, intensity);
      gl.uniform1f(uBandWidth, bandWidth);
      gl.uniform1f(uTransparent, transparent ? 1.0 : 0.0);

      gl.uniform3f(uColor0, c0[0], c0[1], c0[2]);
      gl.uniform3f(uColor1, c1[0], c1[1], c1[2]);
      gl.uniform3f(uColor2, c2[0], c2[1], c2[2]);
      gl.uniform3f(uColor3, c3[0], c3[1], c3[2]);
      gl.uniform3f(uColor4, c4[0], c4[1], c4[2]);
      gl.uniform3f(uAccentColor, accentRgb[0], accentRgb[1], accentRgb[2]);
      gl.uniform1f(uNumColors, paletteRgb.length);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (isVisible) {
        rafRef.current = requestAnimationFrame(render);
      }
    }

    if (isVisible) {
      rafRef.current = requestAnimationFrame(render);
    }

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (gl) {
        if (vertexBuffer) gl.deleteBuffer(vertexBuffer);
        if (vs) gl.deleteShader(vs);
        if (fs) gl.deleteShader(fs);
        if (program) gl.deleteProgram(program);
      }
    };
  }, [
    colors,
    rotation,
    speed,
    scale,
    frequency,
    warpStrength,
    mouseInfluence,
    noise,
    parallax,
    iterations,
    intensity,
    bandWidth,
    transparent,
    color,
    isVisible,
    prefersReducedMotion,
  ]);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      className={`relative w-full h-full overflow-hidden select-none ${className}`}
      style={style}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none block"
      />
    </div>
  );
};

export default ColorBends;
