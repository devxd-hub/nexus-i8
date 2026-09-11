/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';

export interface PixelBlastProps {
  variant?: 'circle' | 'square' | 'diamond';
  pixelSize?: number;
  color?: string;
  secondaryColor?: string;
  patternScale?: number;
  patternDensity?: number;
  pixelSizeJitter?: number;
  enableRipples?: boolean;
  rippleSpeed?: number;
  rippleThickness?: number;
  rippleIntensityScale?: number;
  liquid?: boolean;
  liquidStrength?: number;
  liquidRadius?: number;
  liquidWobbleSpeed?: number;
  speed?: number;
  edgeFade?: number;
  transparent?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /**
   * Normalized center of the quiet zone [0..1, 0..1], default [0.5, 0.45]
   */
  quietZoneCenter?: { x: number; y: number };
  /**
   * Normalized radius of the quiet zone { rx, ry }, default { rx: 0.18, ry: 0.15 }
   */
  quietZoneRadius?: { rx: number; ry: number };
  /**
   * Feather softness factor [0.1 .. 1.0], default 0.65
   */
  quietZoneFeather?: number;
  /**
   * Global intensity / opacity multiplier (e.g. 0.25 for refined light theme)
   */
  intensity?: number;
  /**
   * Enable scroll reactive parallax and fluid displacement
   */
  scrollReactive?: boolean;
  scrollParallax?: number;
  /**
   * Enable cursor reactive localized displacement and excitation
   */
  cursorReactive?: boolean;
  cursorInfluence?: number;
  cursorRadius?: number;
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
  return [isNaN(r) ? 0.937 : r, isNaN(g) ? 0.353 : g, isNaN(b) ? 0.165 : b];
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
precision mediump float;
varying vec2 v_uv;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_pixelSize;
uniform float u_patternScale;
uniform float u_patternDensity;
uniform float u_pixelSizeJitter;
uniform float u_enableRipples;
uniform float u_rippleSpeed;
uniform float u_rippleThickness;
uniform float u_rippleIntensity;
uniform float u_liquid;
uniform float u_liquidStrength;
uniform float u_liquidRadius;
uniform float u_liquidWobbleSpeed;
uniform float u_speed;
uniform float u_edgeFade;
uniform float u_transparent;
uniform float u_intensity;
uniform int u_variant; // 0: circle, 1: square, 2: diamond

// Scroll & Cursor Reactivity uniforms
uniform float u_scrollProgress;
uniform float u_scrollVelocity;
uniform float u_scrollParallax;
uniform float u_cursorInfluence;
uniform float u_cursorRadius;

uniform vec3 u_color;
uniform vec3 u_secondaryColor;

// Quiet zone uniforms
uniform vec2 u_quietCenter;
uniform vec2 u_quietRadius;
uniform float u_quietFeather;

// Ripple wave uniform states (up to 3 concurrent disturbances)
uniform vec4 u_ripple0; // xy: pos, z: startTime, w: amplitude
uniform vec4 u_ripple1;
uniform vec4 u_ripple2;

// Fast pseudo-random hash
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}

// Optimized 2D Perlin-style noise
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash12(i + vec2(0.0, 0.0)), hash12(i + vec2(1.0, 0.0)), u.x),
    mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

// 2-Octave Fast FBM
float fbm(vec2 p) {
  float v = 0.0;
  v += 0.6 * noise(p);
  v += 0.4 * noise(p * 2.0 + vec2(15.2, 33.7));
  return v;
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  vec2 uv = v_uv;
  
  // 1. EARLY DISCARD FOR QUIET ZONE CORE (Zero computation overhead for protected central X)
  vec2 quietOffset = (uv - u_quietCenter) / max(vec2(0.01), u_quietRadius);
  float distToQuietCenter = length(quietOffset);

  if (distToQuietCenter < 0.45) {
    gl_FragColor = vec4(0.0);
    return;
  }

  // Soft progressive feather: 0.0 inside core, smoothly climbs to 1.0 outside
  float quietMask = smoothstep(0.85, 0.85 + u_quietFeather, distToQuietCenter);
  float innerCore = smoothstep(0.4, 0.85, distToQuietCenter);
  float finalQuietZoneFactor = quietMask * innerCore;

  float minRes = min(u_resolution.x, u_resolution.y);
  float t = u_time * u_speed;
  vec2 warpedUv = uv;

  // 2. SCROLL REACTIVITY: PARALLAX & VERTICAL FLUID DRIFT
  if (u_scrollProgress > 0.001 || abs(u_scrollVelocity) > 0.001) {
    vec2 scrollDisplacement = vec2(
      sin(uv.y * 3.14159 + t) * u_scrollVelocity * 0.015,
      -u_scrollProgress * u_scrollParallax * 0.25 + u_scrollVelocity * 0.04
    );
    warpedUv += scrollDisplacement * finalQuietZoneFactor;
  }

  // 3. CURSOR REACTIVITY: LOCALIZED TACTILE DISPLACEMENT & PRESSURE FIELD
  float distMouse = length((uv - u_mouse) * vec2(u_resolution.x / minRes, u_resolution.y / minRes));
  float cursorProximity = smoothstep(u_cursorRadius, 0.0, distMouse);
  float cursorExcitation = 0.0;

  if (u_cursorInfluence > 0.01 && cursorProximity > 0.01) {
    vec2 cursorDelta = (uv - u_mouse);
    vec2 cursorDir = normalize(cursorDelta + vec2(0.0001));
    float pushFactor = sin(cursorProximity * 3.14159) * 0.035 * u_cursorInfluence;
    warpedUv += cursorDir * pushFactor * finalQuietZoneFactor;
    cursorExcitation = cursorProximity * u_cursorInfluence * finalQuietZoneFactor;
  }

  // 4. LIQUID DOMAIN WARPING
  if (u_liquid > 0.5) {
    vec2 liquidOffset = vec2(
      sin(uv.y * 6.28 * u_patternScale * 0.3 + t * u_liquidWobbleSpeed),
      cos(uv.x * 6.28 * u_patternScale * 0.3 + t * u_liquidWobbleSpeed * 0.9)
    ) * u_liquidStrength * 0.02;

    float n = fbm(uv * u_patternScale + vec2(t * 0.2, -t * 0.15));
    liquidOffset += (vec2(n) - 0.5) * u_liquidStrength * 0.03;

    warpedUv += liquidOffset * finalQuietZoneFactor;
  }

  // 5. RIPPLE PROPAGATION WAVES
  float rippleDisplacement = 0.0;
  float ripplePulse = 0.0;
  if (u_enableRipples > 0.5) {
    vec4 ripples[3];
    ripples[0] = u_ripple0;
    ripples[1] = u_ripple1;
    ripples[2] = u_ripple2;

    for (int i = 0; i < 3; i++) {
      vec4 rip = ripples[i];
      if (rip.z > 0.0) {
        float age = u_time - rip.z;
        if (age >= 0.0 && age < 2.5) {
          float radius = age * u_rippleSpeed;
          float d = length(uv - rip.xy);
          float ring = abs(d - radius);
          float ringIntensity = smoothstep(u_rippleThickness, 0.0, ring);
          float decay = exp(-age * 1.8) * rip.w * u_rippleIntensity;
          rippleDisplacement += sin(ring * 40.0 - age * 8.0) * ringIntensity * decay * 0.015;
          ripplePulse += ringIntensity * decay;
        }
      }
    }
    rippleDisplacement *= finalQuietZoneFactor;
    ripplePulse *= finalQuietZoneFactor;
    warpedUv += vec2(rippleDisplacement);
  }

  // 6. PIXEL DISCRETIZATION
  float effectivePixelSize = max(2.0, u_pixelSize);
  vec2 pixelGrid = u_resolution / effectivePixelSize;
  vec2 pixelCell = floor(warpedUv * pixelGrid);
  vec2 cellUv = fract(warpedUv * pixelGrid) - 0.5;

  // Cell randomized properties
  vec2 cellRnd = hash22(pixelCell);
  float cellDensityNoise = fbm(pixelCell * 0.06 / u_patternScale + vec2(t * 0.08, -t * 0.06));

  // Density thresholding with gentle scroll dispersion
  float scrollDensityDamping = 1.0 - u_scrollProgress * 0.22;
  float targetDensity = u_patternDensity * 0.8 * scrollDensityDamping;
  
  vec2 centerDistNorm = abs(uv - vec2(0.5, 0.5)) * 2.0;
  float edgeBoost = smoothstep(0.2, 0.9, max(centerDistNorm.x, centerDistNorm.y)) * 0.35;
  
  float centerColumnDist = abs(uv.x - 0.5) * 2.0;
  float textReadabilityFactor = smoothstep(0.15, 0.6, centerColumnDist) * 0.4 + 0.6;

  float cellThreshold = (1.0 - targetDensity) - edgeBoost * 0.2;
  float densityCheck = (cellDensityNoise * 0.7 + cellRnd.x * 0.3) * textReadabilityFactor * finalQuietZoneFactor;

  densityCheck += cursorExcitation * 0.12;

  if (densityCheck < cellThreshold) {
    gl_FragColor = vec4(0.0);
    return;
  }

  // Dynamic pixel radius with jitter & ripple excitation
  float jitter = (cellRnd.y - 0.5) * u_pixelSizeJitter;
  float baseRadius = 0.32 + jitter * 0.25 + ripplePulse * 0.15 + cursorExcitation * 0.14;
  baseRadius = clamp(baseRadius, 0.1, 0.49);

  // 7. PIXEL SHAPE RENDERING
  float shapeDist = 0.0;
  if (u_variant == 1) {
    vec2 d = abs(cellUv);
    shapeDist = max(d.x, d.y);
  } else if (u_variant == 2) {
    vec2 d = abs(cellUv);
    shapeDist = d.x + d.y;
  } else {
    shapeDist = length(cellUv);
  }

  float pixelMask = 1.0 - smoothstep(baseRadius - 0.08, baseRadius + 0.04, shapeDist);

  if (pixelMask <= 0.01) {
    gl_FragColor = vec4(0.0);
    return;
  }

  // 8. COLOR & ALPHA COMPOSITION
  float colorMix = cellRnd.x * 0.4 + cellDensityNoise * 0.3 + ripplePulse * 0.3 + cursorExcitation * 0.35;
  vec3 pixelColor = mix(u_color, u_secondaryColor, clamp(colorMix, 0.0, 1.0));

  vec2 edgeDist = abs(uv - 0.5) * 2.0;
  float maxEdge = max(edgeDist.x, edgeDist.y);
  float edgeAlpha = 1.0 - smoothstep(1.0 - u_edgeFade, 1.0, maxEdge);

  float scrollAlphaFade = 1.0 - smoothstep(0.7, 1.0, u_scrollProgress) * 0.5;
  float finalAlpha = pixelMask * u_intensity * edgeAlpha * finalQuietZoneFactor * scrollAlphaFade;
  finalAlpha += cursorExcitation * 0.15 * finalQuietZoneFactor;

  if (u_transparent > 0.5) {
    gl_FragColor = vec4(pixelColor, clamp(finalAlpha, 0.0, 1.0));
  } else {
    gl_FragColor = vec4(pixelColor * finalAlpha, 1.0);
  }
}
`;

export const PixelBlast: React.FC<PixelBlastProps> = ({
  variant = 'circle',
  pixelSize = 5,
  color = '#EF5A2A',
  secondaryColor = '#D94A1F',
  patternScale = 3.2,
  patternDensity = 0.78,
  pixelSizeJitter = 0.3,
  enableRipples = true,
  rippleSpeed = 0.32,
  rippleThickness = 0.1,
  rippleIntensityScale = 0.8,
  liquid = true,
  liquidStrength = 0.07,
  liquidRadius = 1.0,
  liquidWobbleSpeed = 3.2,
  speed = 0.35,
  edgeFade = 0.35,
  transparent = true,
  className = '',
  style = {},
  quietZoneCenter = { x: 0.5, y: 0.46 },
  quietZoneRadius = { rx: 0.22, ry: 0.18 },
  quietZoneFeather = 0.55,
  intensity = 0.45,
  scrollReactive = true,
  scrollParallax = 1.0,
  cursorReactive = true,
  cursorInfluence = 0.8,
  cursorRadius = 0.28,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const rafRef = useRef<number | null>(null);

  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Store mutable uniforms in a ref so prop updates don't destroy/recompile WebGL
  const propsRef = useRef({
    variant,
    pixelSize,
    color,
    secondaryColor,
    patternScale,
    patternDensity,
    pixelSizeJitter,
    enableRipples,
    rippleSpeed,
    rippleThickness,
    rippleIntensityScale,
    liquid,
    liquidStrength,
    liquidRadius,
    liquidWobbleSpeed,
    speed,
    edgeFade,
    transparent,
    intensity,
    scrollReactive,
    scrollParallax,
    cursorReactive,
    cursorInfluence,
    cursorRadius,
    quietZoneCenter,
    quietZoneRadius,
    quietZoneFeather,
  });

  useEffect(() => {
    propsRef.current = {
      variant,
      pixelSize,
      color,
      secondaryColor,
      patternScale,
      patternDensity,
      pixelSizeJitter,
      enableRipples,
      rippleSpeed,
      rippleThickness,
      rippleIntensityScale,
      liquid,
      liquidStrength,
      liquidRadius,
      liquidWobbleSpeed,
      speed,
      edgeFade,
      transparent,
      intensity,
      scrollReactive,
      scrollParallax,
      cursorReactive,
      cursorInfluence,
      cursorRadius,
      quietZoneCenter,
      quietZoneRadius,
      quietZoneFeather,
    };
  }, [
    variant,
    pixelSize,
    color,
    secondaryColor,
    patternScale,
    patternDensity,
    pixelSizeJitter,
    enableRipples,
    rippleSpeed,
    rippleThickness,
    rippleIntensityScale,
    liquid,
    liquidStrength,
    liquidRadius,
    liquidWobbleSpeed,
    speed,
    edgeFade,
    transparent,
    intensity,
    scrollReactive,
    scrollParallax,
    cursorReactive,
    cursorInfluence,
    cursorRadius,
    quietZoneCenter,
    quietZoneRadius,
    quietZoneFeather,
  ]);

  // Pointer state & gentle inertia
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0.5,
    y: 0.5,
    targetX: 0.5,
    targetY: 0.5,
  });

  // Scroll state & velocity tracking
  const scrollRef = useRef<{
    progress: number;
    targetProgress: number;
    lastY: number;
    velocity: number;
  }>({
    progress: 0,
    targetProgress: 0,
    lastY: typeof window !== 'undefined' ? window.scrollY : 0,
    velocity: 0,
  });

  // Ripple state tracking (stores up to 3 ripples: [x, y, startTime, amplitude])
  const ripplesRef = useRef<Array<[number, number, number, number]>>([
    [0.5, 0.5, -100, 0],
    [0.5, 0.5, -100, 0],
    [0.5, 0.5, -100, 0],
  ]);
  const nextRippleIdxRef = useRef(0);
  const lastMoveTimeRef = useRef(0);

  // Reduced motion preference check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mq.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, []);

  // IntersectionObserver to suspend animation when out of view
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

  // Visibility change listener (pause when tab is hidden)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handleVisibility = () => {
      if (document.hidden) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Window-level Pointer and Scroll tracking for seamless responsiveness
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === 'undefined') return;

    const handleGlobalPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      if (
        e.clientY >= rect.top - 80 &&
        e.clientY <= rect.bottom + 80 &&
        e.clientX >= rect.left - 40 &&
        e.clientX <= rect.right + 40
      ) {
        const nx = (e.clientX - rect.left) / rect.width;
        const ny = 1.0 - (e.clientY - rect.top) / rect.height; // WebGL UV coordinate
        mouseRef.current.targetX = Math.max(0.0, Math.min(1.0, nx));
        mouseRef.current.targetY = Math.max(0.0, Math.min(1.0, ny));

        const qCenter = propsRef.current.quietZoneCenter;
        const qRadius = propsRef.current.quietZoneRadius;
        const qNormX = (nx - qCenter.x) / Math.max(0.01, qRadius.rx);
        const qNormY = ((1.0 - ny) - qCenter.y) / Math.max(0.01, qRadius.ry);
        const distToQuiet = Math.sqrt(qNormX * qNormX + qNormY * qNormY);

        const now = performance.now() * 0.001;
        if (distToQuiet > 0.88 && propsRef.current.enableRipples && now - lastMoveTimeRef.current > 0.38) {
          lastMoveTimeRef.current = now;
          const idx = nextRippleIdxRef.current;
          ripplesRef.current[idx] = [nx, 1.0 - ny, now, 0.65];
          nextRippleIdxRef.current = (idx + 1) % 3;
        }
      }
    };

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const heroHeight = rect.height || window.innerHeight;
      const progress = Math.max(0.0, Math.min(1.0, -rect.top / heroHeight));
      scrollRef.current.targetProgress = progress;
    };

    window.addEventListener('pointermove', handleGlobalPointerMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Pointer down handler for localized tactile pulse
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!propsRef.current.enableRipples) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;

    const qCenter = propsRef.current.quietZoneCenter;
    const qRadius = propsRef.current.quietZoneRadius;
    const qNormX = (nx - qCenter.x) / Math.max(0.01, qRadius.rx);
    const qNormY = (ny - qCenter.y) / Math.max(0.01, qRadius.ry);
    const distToQuiet = Math.sqrt(qNormX * qNormX + qNormY * qNormY);

    if (distToQuiet > 0.85) {
      const now = performance.now() * 0.001;
      const idx = nextRippleIdxRef.current;
      ripplesRef.current[idx] = [nx, 1.0 - ny, now, 1.1];
      nextRippleIdxRef.current = (idx + 1) % 3;
    }
  }, []);

  // WebGL Pipeline Lifecycle: Stable program created ONCE
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
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
        console.error('PixelBlast Shader error:', gl.getShaderInfoLog(shader));
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
      console.error('PixelBlast Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    programRef.current = program;
    gl.useProgram(program);

    // Full screen quad geometry
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

    // Locate uniforms
    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uPixelSize = gl.getUniformLocation(program, 'u_pixelSize');
    const uPatternScale = gl.getUniformLocation(program, 'u_patternScale');
    const uPatternDensity = gl.getUniformLocation(program, 'u_patternDensity');
    const uPixelSizeJitter = gl.getUniformLocation(program, 'u_pixelSizeJitter');
    const uEnableRipples = gl.getUniformLocation(program, 'u_enableRipples');
    const uRippleSpeed = gl.getUniformLocation(program, 'u_rippleSpeed');
    const uRippleThickness = gl.getUniformLocation(program, 'u_rippleThickness');
    const uRippleIntensity = gl.getUniformLocation(program, 'u_rippleIntensity');
    const uLiquid = gl.getUniformLocation(program, 'u_liquid');
    const uLiquidStrength = gl.getUniformLocation(program, 'u_liquidStrength');
    const uLiquidRadius = gl.getUniformLocation(program, 'u_liquidRadius');
    const uLiquidWobbleSpeed = gl.getUniformLocation(program, 'u_liquidWobbleSpeed');
    const uSpeed = gl.getUniformLocation(program, 'u_speed');
    const uEdgeFade = gl.getUniformLocation(program, 'u_edgeFade');
    const uTransparent = gl.getUniformLocation(program, 'u_transparent');
    const uIntensity = gl.getUniformLocation(program, 'u_intensity');
    const uVariant = gl.getUniformLocation(program, 'u_variant');

    const uScrollProgress = gl.getUniformLocation(program, 'u_scrollProgress');
    const uScrollVelocity = gl.getUniformLocation(program, 'u_scrollVelocity');
    const uScrollParallax = gl.getUniformLocation(program, 'u_scrollParallax');
    const uCursorInfluence = gl.getUniformLocation(program, 'u_cursorInfluence');
    const uCursorRadius = gl.getUniformLocation(program, 'u_cursorRadius');

    const uColor = gl.getUniformLocation(program, 'u_color');
    const uSecondaryColor = gl.getUniformLocation(program, 'u_secondaryColor');

    const uQuietCenter = gl.getUniformLocation(program, 'u_quietCenter');
    const uQuietRadius = gl.getUniformLocation(program, 'u_quietRadius');
    const uQuietFeather = gl.getUniformLocation(program, 'u_quietFeather');

    const uRipple0 = gl.getUniformLocation(program, 'u_ripple0');
    const uRipple1 = gl.getUniformLocation(program, 'u_ripple1');
    const uRipple2 = gl.getUniformLocation(program, 'u_ripple2');

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 600;

    function resize() {
      if (!canvas || !container || !gl) return;
      // Cap DPR to 1.0 on mobile (<768px) and 1.25 on desktop: saves 50%+ GPU load
      const isMobile = (window.innerWidth || 800) < 768;
      const dpr = isMobile ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.25);
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    const startTime = performance.now();

    let lastFrameTime = 0;

    function render(now: number) {
      if (!gl || !program) return;

      const isMobile = width < 768;
      // On mobile devices, throttle rendering to ~35fps to keep scroll buttery smooth and save battery
      if (isMobile && now - lastFrameTime < 28) {
        if (isVisible) {
          rafRef.current = requestAnimationFrame(render);
        }
        return;
      }
      lastFrameTime = now;

      const p = propsRef.current;
      const elapsed = (now - startTime) * 0.001;
      const effectiveSpeed = prefersReducedMotion ? 0.0 : p.speed;
      const effectiveBasePixelSize = isMobile ? Math.max(6.5, p.pixelSize * 1.3) : p.pixelSize;

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.09;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.09;

      // Smooth scroll progress & velocity
      const currentY = typeof window !== 'undefined' ? window.scrollY : 0;
      const scrollDelta = (currentY - scrollRef.current.lastY) * 0.003;
      scrollRef.current.lastY = currentY;
      scrollRef.current.velocity += (scrollDelta - scrollRef.current.velocity) * 0.12;
      scrollRef.current.progress += (scrollRef.current.targetProgress - scrollRef.current.progress) * 0.08;

      gl.useProgram(program);

      const rgbPrimary = hexToRgb(p.color);
      const rgbSecondary = hexToRgb(p.secondaryColor);
      const variantId = p.variant === 'square' ? 1 : p.variant === 'diamond' ? 2 : 0;

      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);
      gl.uniform1f(uTime, elapsed);
      gl.uniform1f(uPixelSize, effectiveBasePixelSize * (canvas.width / width));
      gl.uniform1f(uPatternScale, p.patternScale);
      gl.uniform1f(uPatternDensity, p.patternDensity);
      gl.uniform1f(uPixelSizeJitter, p.pixelSizeJitter);
      gl.uniform1f(uEnableRipples, p.enableRipples && !prefersReducedMotion ? 1.0 : 0.0);
      gl.uniform1f(uRippleSpeed, p.rippleSpeed);
      gl.uniform1f(uRippleThickness, p.rippleThickness);
      gl.uniform1f(uRippleIntensity, p.rippleIntensityScale);
      gl.uniform1f(uLiquid, p.liquid && !prefersReducedMotion ? 1.0 : 0.0);
      gl.uniform1f(uLiquidStrength, p.liquidStrength);
      gl.uniform1f(uLiquidRadius, p.liquidRadius);
      gl.uniform1f(uLiquidWobbleSpeed, p.liquidWobbleSpeed);
      gl.uniform1f(uSpeed, effectiveSpeed);
      gl.uniform1f(uEdgeFade, p.edgeFade);
      gl.uniform1f(uTransparent, p.transparent ? 1.0 : 0.0);
      gl.uniform1f(uIntensity, p.intensity);
      gl.uniform1i(uVariant, variantId);

      // Scroll & Cursor Reactivity
      gl.uniform1f(uScrollProgress, p.scrollReactive && !prefersReducedMotion ? scrollRef.current.progress : 0.0);
      gl.uniform1f(uScrollVelocity, p.scrollReactive && !prefersReducedMotion ? scrollRef.current.velocity : 0.0);
      gl.uniform1f(uScrollParallax, p.scrollParallax);
      gl.uniform1f(uCursorInfluence, p.cursorReactive && !prefersReducedMotion ? p.cursorInfluence : 0.0);
      gl.uniform1f(uCursorRadius, p.cursorRadius);

      gl.uniform3f(uColor, rgbPrimary[0], rgbPrimary[1], rgbPrimary[2]);
      gl.uniform3f(uSecondaryColor, rgbSecondary[0], rgbSecondary[1], rgbSecondary[2]);

      // Quiet Zone Uniforms
      gl.uniform2f(uQuietCenter, p.quietZoneCenter.x, 1.0 - p.quietZoneCenter.y);
      gl.uniform2f(uQuietRadius, p.quietZoneRadius.rx, p.quietZoneRadius.ry);
      gl.uniform1f(uQuietFeather, p.quietZoneFeather);

      // Ripple Uniforms
      const r0 = ripplesRef.current[0];
      const r1 = ripplesRef.current[1];
      const r2 = ripplesRef.current[2];
      gl.uniform4f(uRipple0, r0[0], r0[1], r0[2], r0[3]);
      gl.uniform4f(uRipple1, r1[0], r1[1], r1[2], r1[3]);
      gl.uniform4f(uRipple2, r2[0], r2[1], r2[2], r2[3]);

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
  }, [isVisible, prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
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

export default PixelBlast;
