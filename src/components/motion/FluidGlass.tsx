/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';

interface FluidGlassProps {
  className?: string;
  style?: React.CSSProperties;
  aspectRatio?: string;
}

/**
 * WebGL Fluid Glass Refraction Engine
 * 
 * Simulates an interactive liquid glass lens with:
 * - Dynamic surface height field & fluid viscosity
 * - Surface normal computation & Snell's Law refraction
 * - Chromatic dispersion (spectral split at curvature points)
 * - Fresnel specular highlights & glass caustics
 * - Interactive pointer displacement & organic ambient ripples
 */

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

uniform sampler2D u_background;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec2 u_mouse_vel;
uniform float u_time;
uniform float u_hover;
uniform float u_dpr;

// Organic simplex-style noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Compute the liquid glass height profile at UV
float getGlassHeight(vec2 uv, float t) {
  // Fluid organic undulating glass surface
  float wave1 = sin(uv.x * 4.2 + t * 0.7) * cos(uv.y * 3.8 + t * 0.5);
  float wave2 = sin(uv.y * 6.5 - t * 0.6 + sin(uv.x * 5.0)) * 0.5;
  float noise = snoise(uv * 2.8 + vec2(t * 0.15, t * 0.12)) * 0.6;
  
  // Interactive pointer depression / droplet ripple
  vec2 toMouse = uv - u_mouse;
  float dist = length(toMouse);
  float mouseRipple = exp(-dist * 9.0) * sin(dist * 28.0 - t * 6.0) * u_hover * 0.9;
  float mouseBulge = exp(-dist * 6.0) * 0.5 * u_hover;
  
  // Outer pill/rounded meniscus boundary
  vec2 d = abs(uv - vec2(0.5)) * 2.0;
  float borderDist = length(max(d - vec2(0.75, 0.65), 0.0));
  float meniscus = smoothstep(0.35, 0.0, borderDist);

  return (wave1 * 0.18 + wave2 * 0.12 + noise * 0.25 + mouseRipple + mouseBulge) * meniscus;
}

void main() {
  vec2 uv = v_uv;
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  
  // Finite difference to compute surface normal gradient
  float eps = 0.003;
  float hCenter = getGlassHeight(uv, u_time);
  float hRight  = getGlassHeight(uv + vec2(eps, 0.0), u_time);
  float hTop    = getGlassHeight(uv + vec2(0.0, eps), u_time);
  
  vec3 normal = normalize(vec3(
    -(hRight - hCenter) / eps * 0.35,
    -(hTop - hCenter) / eps * 0.35,
    1.0
  ));
  
  // Glass Refraction Parameters
  float eta = 0.045; // Refraction intensity
  float chromaticAberration = 0.018; // Spectral RGB split
  
  vec2 refractOffset = normal.xy * eta;
  
  // Sample background texture with chromatic dispersion
  vec2 uvR = clamp(uv + refractOffset * (1.0 + chromaticAberration), 0.001, 0.999);
  vec2 uvG = clamp(uv + refractOffset, 0.001, 0.999);
  vec2 uvB = clamp(uv + refractOffset * (1.0 - chromaticAberration), 0.001, 0.999);
  
  vec4 colorR = texture2D(u_background, uvR);
  vec4 colorG = texture2D(u_background, uvG);
  vec4 colorB = texture2D(u_background, uvB);
  
  vec3 refractedColor = vec3(colorR.r, colorG.g, colorB.b);
  
  // Lighting & Specular Reflection on Glass Surface
  vec3 lightDir1 = normalize(vec3(0.5, 0.7, 0.6));
  vec3 lightDir2 = normalize(vec3(-0.6, -0.4, 0.8));
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  
  // Diffuse & Specular (Blinn-Phong)
  vec3 halfVec1 = normalize(lightDir1 + viewDir);
  float spec1 = pow(max(dot(normal, halfVec1), 0.0), 32.0);
  
  vec3 halfVec2 = normalize(lightDir2 + viewDir);
  float spec2 = pow(max(dot(normal, halfVec2), 0.0), 24.0);
  
  // Fresnel reflection factor
  float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
  
  // Warm caustic sheen matching NEXUS warm paper & orange accents
  vec3 glassHighlight = vec3(1.0, 0.98, 0.95) * (spec1 * 0.45) + vec3(0.94, 0.35, 0.16) * (spec2 * 0.15);
  vec3 rimLight = vec3(0.98, 0.96, 0.92) * (fresnel * 0.25);
  
  // Subtle internal volume caustics
  float caustic = pow(clamp(hCenter * 1.5 + 0.5, 0.0, 1.0), 2.0) * 0.08;
  
  vec3 finalColor = refractedColor + glassHighlight + rimLight + caustic;
  
  // Subtle warm paper tone preservation
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export const FluidGlass: React.FC<FluidGlassProps> = ({
  className = '',
  style,
  aspectRatio = '4/3',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const bgTextureRef = useRef<WebGLTexture | null>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const mousePosRef = useRef({ x: 0.5, y: 0.5 });
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 });
  const hoverWeightRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef(performance.now());

  // Draw the underlying high-contrast geometric art to the background canvas
  const drawBackgroundArt = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    // Dark foundation canvas background
    ctx.fillStyle = '#0C0C0C';
    ctx.fillRect(0, 0, width, height);

    // Subtle coordinate grid
    ctx.strokeStyle = 'rgba(245, 239, 230, 0.06)';
    ctx.lineWidth = 1;
    const step = 48;
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Interlocking geometric glass rings (representing the multidisciplinary convergence of NEXUS)
    const cx = width * 0.5;
    const cy = height * 0.5;

    // Outer geometric circle
    ctx.strokeStyle = 'rgba(245, 239, 230, 0.14)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.min(width, height) * 0.38, 0, Math.PI * 2);
    ctx.stroke();

    // Secondary offset circles
    ctx.strokeStyle = 'rgba(242, 97, 63, 0.40)'; // NEXUS Orange
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx - 70, cy, Math.min(width, height) * 0.28, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(245, 239, 230, 0.22)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx + 70, cy, Math.min(width, height) * 0.28, 0, Math.PI * 2);
    ctx.stroke();

    // Central NEXUS intersecting diamond / geometry
    ctx.fillStyle = '#181818';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 80);
    ctx.lineTo(cx + 80, cy);
    ctx.lineTo(cx, cy + 80);
    ctx.lineTo(cx - 80, cy);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 239, 230, 0.20)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Inner orange core
    ctx.fillStyle = '#F2613F';
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fill();

    // Minimal typographic anchor inside the glass field
    ctx.fillStyle = '#F5EFE6';
    ctx.font = 'bold 20px "Fraunces", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NEXUS', cx, cy - 110);

    // Editorial quadrant notations
    ctx.fillStyle = '#857E74';
    ctx.font = '500 12px "Dosis", sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('DESIGN', cx - 180, cy);
    ctx.fillText('ENGINEERING', cx + 180, cy);
    ctx.fillText('EXPERIMENTATION', cx, cy + 140);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let gl: WebGLRenderingContext | null = null;
    try {
      gl = canvas.getContext('webgl', { antialias: true, alpha: false, depth: false });
    } catch {
      gl = null;
    }

    if (!gl) return;
    glRef.current = gl;

    // Create Shaders
    const createShader = (type: number, src: string) => {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, src);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vert = createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const frag = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vert || !frag) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    programRef.current = program;
    gl.useProgram(program);

    // Full screen quad geometry
    const vertices = new Float32Array([
      -1.0, -1.0,  0.0, 1.0,
       1.0, -1.0,  1.0, 1.0,
      -1.0,  1.0,  0.0, 0.0,
      -1.0,  1.0,  0.0, 0.0,
       1.0, -1.0,  1.0, 1.0,
       1.0,  1.0,  1.0, 0.0,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, 'a_position');
    const aUv = gl.getAttribLocation(program, 'a_uv');
    gl.enableVertexAttribArray(aPos);
    gl.enableVertexAttribArray(aUv);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);

    // Create Background Canvas & Texture
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = 1200;
    bgCanvas.height = 900;
    const bgCtx = bgCanvas.getContext('2d');
    if (bgCtx) {
      drawBackgroundArt(bgCtx, 1200, 900);
    }
    bgCanvasRef.current = bgCanvas;

    const texture = gl.createTexture();
    if (texture) {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bgCanvas);
      bgTextureRef.current = texture;
    }

    // Resize Handler
    const updateSize = () => {
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const isMobile = (window.innerWidth || 800) < 768;
      const dpr = isMobile ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.75);
      const w = Math.floor(rect.width * dpr);
      const h = Math.floor(rect.height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);
    updateSize();

    // Render Animation Loop
    const render = (now: number) => {
      if (!glRef.current || !programRef.current || !canvasRef.current) return;
      const glCtx = glRef.current;
      const prog = programRef.current;

      if (!isVisible) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      // Smooth mouse interpolation
      mousePosRef.current.x += (targetMouseRef.current.x - mousePosRef.current.x) * 0.08;
      mousePosRef.current.y += (targetMouseRef.current.y - mousePosRef.current.y) * 0.08;
      hoverWeightRef.current += ((isHovered ? 1.0 : 0.0) - hoverWeightRef.current) * 0.06;

      glCtx.viewport(0, 0, canvasRef.current.width, canvasRef.current.height);
      glCtx.useProgram(prog);

      const timeSec = (now - startTimeRef.current) * 0.001;
      glCtx.uniform1f(glCtx.getUniformLocation(prog, 'u_time'), timeSec);
      glCtx.uniform2f(glCtx.getUniformLocation(prog, 'u_resolution'), canvasRef.current.width, canvasRef.current.height);
      glCtx.uniform2f(glCtx.getUniformLocation(prog, 'u_mouse'), mousePosRef.current.x, mousePosRef.current.y);
      glCtx.uniform1f(glCtx.getUniformLocation(prog, 'u_hover'), hoverWeightRef.current);
      glCtx.uniform1f(glCtx.getUniformLocation(prog, 'u_dpr'), window.devicePixelRatio || 1);

      if (bgTextureRef.current) {
        glCtx.activeTexture(glCtx.TEXTURE0);
        glCtx.bindTexture(glCtx.TEXTURE_2D, bgTextureRef.current);
        glCtx.uniform1i(glCtx.getUniformLocation(prog, 'u_background'), 0);
      }

      glCtx.drawArrays(glCtx.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    // Visibility observer
    const io = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold: 0.1 });
    io.observe(container);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
      io.disconnect();
      if (gl) {
        if (bgTextureRef.current) gl.deleteTexture(bgTextureRef.current);
        if (buffer) gl.deleteBuffer(buffer);
        if (program) gl.deleteProgram(program);
        if (vert) gl.deleteShader(vert);
        if (frag) gl.deleteShader(frag);
      }
    };
  }, [isHovered, isVisible]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    targetMouseRef.current = { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) };
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden border border-[rgba(245,239,230,0.10)] bg-[#0C0C0C] ${className}`}
      style={{
        aspectRatio: aspectRatio === '4/3' ? '4 / 3' : '16 / 10',
        touchAction: 'pan-y',
        ...style,
      }}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => {
        setIsHovered(false);
        targetMouseRef.current = { x: 0.5, y: 0.5 };
      }}
      onPointerMove={handlePointerMove}
    >
      <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />
    </div>
  );
};

export default FluidGlass;
