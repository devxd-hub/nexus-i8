/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';

export interface MetallicPaintProps {
  imageSrc?: string;
  seed?: number;
  scale?: number;
  patternSharpness?: number;
  noiseScale?: number;
  speed?: number;
  liquid?: number;
  mouseAnimation?: boolean;
  brightness?: number;
  contrast?: number;
  refraction?: number;
  blur?: number;
  chromaticSpread?: number;
  fresnel?: number;
  angle?: number;
  waveAmplitude?: number;
  distortion?: number;
  contour?: number;
  lightColor?: string;
  darkColor?: string;
  tintColor?: string;
  className?: string;
  isHovered?: boolean;
  mousePos?: { x: number; y: number };
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
attribute vec2 a_uv;
varying vec2 v_uv;

void main() {
  v_uv = a_uv;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;
varying vec2 v_uv;

uniform sampler2D u_image;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_sweep;
uniform float u_liquid;
uniform float u_patternSharpness;
uniform float u_contrast;
uniform float u_brightness;
uniform float u_distortion;
uniform float u_fresnel;
uniform float u_angle;
uniform vec3 u_lightColor;
uniform vec3 u_darkColor;
uniform vec3 u_tintColor;

// 2D Simplex Noise
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec4 tex = texture2D(u_image, v_uv);
  float mask = tex.a;
  if (mask < 0.01) {
    discard;
  }

  // Calculate local gradient/normal from mask for beveled edge definition
  vec2 eps = vec2(0.008, 0.008);
  float aR = texture2D(u_image, v_uv + vec2(eps.x, 0.0)).a;
  float aL = texture2D(u_image, v_uv - vec2(eps.x, 0.0)).a;
  float aT = texture2D(u_image, v_uv + vec2(0.0, eps.y)).a;
  float aB = texture2D(u_image, v_uv - vec2(0.0, eps.y)).a;
  vec2 grad = vec2(aR - aL, aT - aB);

  // Surface normal approximation
  vec3 normal = normalize(vec3(-grad * 2.8, 0.55));

  // Rotate coordinates for brushed anisotropic angle (default 45 deg)
  float rad = u_angle * 0.017453292519943295;
  mat2 rot = mat2(cos(rad), -sin(rad), sin(rad), cos(rad));
  vec2 uvRot = rot * (v_uv - 0.5);

  // Subtle liquid motion distortion (restrained physical flow)
  float n1 = snoise(uvRot * 2.6 + vec2(u_time * 0.16, -u_time * 0.12));
  float n2 = snoise(uvRot * 4.8 - vec2(u_time * 0.14, u_time * 0.2));
  vec2 liquidDistort = vec2(n1, n2) * (u_liquid * u_distortion * 0.28);

  vec2 p = uvRot + liquidDistort;

  // Brushed anisotropic stripe pattern (fine machined lines with broad highlight peaks)
  float stripes1 = sin(p.x * 22.0 + n1 * 1.2);
  float stripes2 = cos(p.x * 10.0 + p.y * 6.0 + u_time * 0.35);
  float stripes3 = sin(p.x * 44.0) * 0.12; // fine micro-grain
  float basePattern = 0.5 + 0.5 * (stripes1 * 0.5 + stripes2 * 0.35 + stripes3 + n1 * 0.15);

  // Mouse interaction: specular highlight following cursor with soft falloff
  vec2 mouseVec = v_uv - u_mouse;
  float mouseDist = length(mouseVec);
  float mouseSpot = exp(-mouseDist * mouseDist * 8.5) * 0.6;
  float mouseAniso = max(0.0, 1.0 - abs(dot(normalize(mouseVec + vec2(0.0001)), vec2(cos(rad), sin(rad)))) * 1.1);
  float mouseGlint = mouseSpot * (0.55 + 0.45 * mouseAniso);

  // Creative micro-detail: One-time diagonal studio light sweep on hover entry
  float sweepEffect = 0.0;
  if (u_sweep > -0.2 && u_sweep < 1.2) {
    float sweepPos = (v_uv.x + (1.0 - v_uv.y)) * 0.7071; // diagonal light
    float targetPos = u_sweep * 1.414;
    float distToSweep = abs(sweepPos - targetPos);
    sweepEffect = smoothstep(0.24, 0.0, distToSweep) * 0.4;
  }

  // Combine specular highlights and apply contrast/sharpness
  float highlight = basePattern;
  highlight = pow(highlight, u_patternSharpness);
  highlight = (highlight - 0.5) * (1.0 + u_contrast) + 0.5;
  highlight += mouseGlint + sweepEffect;
  highlight = clamp(highlight * u_brightness, 0.0, 1.0);

  // Fresnel effect on bevel edges
  float fresnelVal = pow(clamp(1.0 - normal.z, 0.0, 1.0), 2.0) * u_fresnel;

  // Metal color grading: blend from deep charcoal to warm white
  vec3 metal = mix(u_darkColor, u_lightColor, highlight);

  // Add bevel edge highlights
  metal += u_lightColor * fresnelVal * 0.38;

  // Subtle reflected NEXUS orange tint in valleys and glints
  vec3 orangeReflection = u_tintColor * (0.08 + 0.14 * mouseGlint + 0.12 * fresnelVal);
  metal += orangeReflection;

  // Tone down extreme peaks for refined editorial look
  metal = clamp(metal, 0.0, 1.0);

  gl_FragColor = vec4(metal, mask);
}
`;

export const MetallicPaint: React.FC<MetallicPaintProps> = ({
  imageSrc = '/NEXUS-removebg-preview-1.png',
  speed = 0.3,
  liquid = 0.22,
  patternSharpness = 1.05,
  contrast = 0.5,
  brightness = 1.2,
  distortion = 0.12,
  fresnel = 0.8,
  angle = 45,
  lightColor = '#F7F5F0',
  darkColor = '#12100E',
  tintColor = '#EF5A2A',
  className = '',
  isHovered = false,
  mousePos = { x: 0.5, y: 0.5 },
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const textureRef = useRef<WebGLTexture | null>(null);
  const rafRef = useRef<number | null>(null);

  // Smooth mouse inertia tracking
  const currentMouseRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const targetMouseRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });

  // Diagonal sweep state (fires once on hover entry)
  const sweepProgressRef = useRef<number>(-1.0);
  const isHoveredRef = useRef<boolean>(isHovered);
  isHoveredRef.current = isHovered;

  // Keep target mouse updated
  useEffect(() => {
    targetMouseRef.current = mousePos;
  }, [mousePos]);

  // Reduced motion support
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // Trigger one-time sweep when hover starts
  useEffect(() => {
    if (isHovered && !prefersReducedMotion) {
      // Delay sweep slightly until metallic layer fades in (~250ms)
      const timer = setTimeout(() => {
        sweepProgressRef.current = -0.2;
      }, 200);
      return () => clearTimeout(timer);
    } else {
      sweepProgressRef.current = -1.0;
    }
  }, [isHovered, prefersReducedMotion]);

  // WebGL initialization and render lifecycle
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) return;
    glRef.current = gl;

    // Compile Shaders
    function createShader(type: number, source: string): WebGLShader | null {
      if (!gl) return null;
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertShader = createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragShader = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    programRef.current = program;
    gl.useProgram(program);

    // Full screen quad geometry
    const quadVertices = new Float32Array([
      // X, Y, U, V
      -1.0, -1.0, 0.0, 1.0,
       1.0, -1.0, 1.0, 1.0,
      -1.0,  1.0, 0.0, 0.0,
      -1.0,  1.0, 0.0, 0.0,
       1.0, -1.0, 1.0, 1.0,
       1.0,  1.0, 1.0, 0.0,
    ]);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

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

    // Load texture
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
      // Trigger one initial render
      renderFrame(0);
    };

    // Uniform locations
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');
    const uSweep = gl.getUniformLocation(program, 'u_sweep');
    const uLiquid = gl.getUniformLocation(program, 'u_liquid');
    const uPatternSharpness = gl.getUniformLocation(program, 'u_patternSharpness');
    const uContrast = gl.getUniformLocation(program, 'u_contrast');
    const uBrightness = gl.getUniformLocation(program, 'u_brightness');
    const uDistortion = gl.getUniformLocation(program, 'u_distortion');
    const uFresnel = gl.getUniformLocation(program, 'u_fresnel');
    const uAngle = gl.getUniformLocation(program, 'u_angle');
    const uLightColor = gl.getUniformLocation(program, 'u_lightColor');
    const uDarkColor = gl.getUniformLocation(program, 'u_darkColor');
    const uTintColor = gl.getUniformLocation(program, 'u_tintColor');

    const lightRgb = hexToRgb(lightColor);
    const darkRgb = hexToRgb(darkColor);
    const tintRgb = hexToRgb(tintColor);

    let startTime = performance.now();
    let lastActiveTime = performance.now();

    function renderFrame(timeMs: number) {
      if (!gl || !program) return;

      const elapsed = (timeMs - startTime) * 0.001;
      const effectiveSpeed = prefersReducedMotion ? 0 : speed;

      // Smooth mouse position with lerp inertia
      currentMouseRef.current.x += (targetMouseRef.current.x - currentMouseRef.current.x) * 0.08;
      currentMouseRef.current.y += (targetMouseRef.current.y - currentMouseRef.current.y) * 0.08;

      // Animate diagonal studio sweep
      if (sweepProgressRef.current >= -0.2 && sweepProgressRef.current <= 1.2) {
        sweepProgressRef.current += 0.035;
        if (sweepProgressRef.current > 1.2) {
          sweepProgressRef.current = 2.0; // Completed
        }
      }

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);

      gl.uniform1f(uTime, elapsed * effectiveSpeed);
      gl.uniform2f(uMouse, currentMouseRef.current.x, currentMouseRef.current.y);
      gl.uniform1f(uSweep, sweepProgressRef.current);
      gl.uniform1f(uLiquid, liquid);
      gl.uniform1f(uPatternSharpness, patternSharpness);
      gl.uniform1f(uContrast, contrast);
      gl.uniform1f(uBrightness, brightness);
      gl.uniform1f(uDistortion, distortion);
      gl.uniform1f(uFresnel, fresnel);
      gl.uniform1f(uAngle, angle);
      gl.uniform3f(uLightColor, lightRgb[0], lightRgb[1], lightRgb[2]);
      gl.uniform3f(uDarkColor, darkRgb[0], darkRgb[1], darkRgb[2]);
      gl.uniform3f(uTintColor, tintRgb[0], tintRgb[1], tintRgb[2]);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    let isRunning = false;

    function loop(timeMs: number) {
      if (isHoveredRef.current) {
        lastActiveTime = timeMs;
        renderFrame(timeMs);
        rafRef.current = requestAnimationFrame(loop);
      } else {
        // Continue rendering for ~600ms after mouse leave to allow smooth exit crossfade & settling
        if (timeMs - lastActiveTime < 650) {
          renderFrame(timeMs);
          rafRef.current = requestAnimationFrame(loop);
        } else {
          // Dormant state - save 100% CPU/GPU resources
          isRunning = false;
          rafRef.current = null;
        }
      }
    }

    if (isHovered) {
      if (!isRunning) {
        isRunning = true;
        rafRef.current = requestAnimationFrame(loop);
      }
    } else {
      renderFrame(0);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [
    imageSrc,
    isHovered,
    speed,
    liquid,
    patternSharpness,
    contrast,
    brightness,
    distortion,
    fresnel,
    angle,
    lightColor,
    darkColor,
    tintColor,
    prefersReducedMotion,
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={256}
      height={256}
      className={`block w-full h-full object-contain aspect-square pointer-events-none select-none ${className}`}
      aria-hidden="true"
    />
  );
};

export default MetallicPaint;
