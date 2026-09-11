/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';

export interface MorphSliderItem {
  image: string;
  caption?: string;
  label?: string;
  tag?: string;
  alt?: string;
  meta?: string;
}

export interface MorphSliderProps {
  items: MorphSliderItem[];
  transition?: 'melt' | 'warp' | 'dissolve';
  intensity?: number;
  aberration?: number;
  drift?: number;
  autoplay?: boolean;
  autoplayInterval?: number;
  pauseOnHover?: boolean;
  className?: string;
  style?: React.CSSProperties;
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
  aspectRatio?: string;
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

uniform sampler2D u_tex0;
uniform sampler2D u_tex1;
uniform float u_progress;
uniform float u_time;
uniform float u_intensity;
uniform float u_aberration;
uniform float u_drift;
uniform float u_direction;
uniform vec2 u_resolution;

// Simplex-style 2D pseudo noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
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

void main() {
  vec2 uv = v_uv;
  
  // Continuous ambient drift (subtle living motion)
  vec2 ambientDrift = vec2(
    sin(uv.y * 3.5 + u_time * 0.45),
    cos(uv.x * 3.5 + u_time * 0.35)
  ) * (u_drift * 0.008);
  
  // Melt transition displacement physics
  float p = u_progress;
  // S-curve peak displacement during mid-transition
  float peak = sin(p * 3.14159265);
  
  // Multi-frequency liquid melt noise
  float noise1 = snoise(uv * 3.5 + vec2(0.0, u_time * 0.25));
  float noise2 = snoise(uv * 7.0 - vec2(u_time * 0.15, 0.0));
  float combinedNoise = (noise1 * 0.7 + noise2 * 0.3);
  
  // Downward / directional melt flow vector
  vec2 meltVector = vec2(
    sin(uv.y * 8.0 + combinedNoise * 3.0) * 0.5 * u_direction,
    (combinedNoise * 0.8 + 0.9) // organic gravity drip
  ) * peak * (u_intensity * 0.45);
  
  // UV for current texture (melting away)
  vec2 uv0 = uv + ambientDrift + meltVector * p;
  // UV for incoming texture (reconstituting into form)
  vec2 uv1 = uv + ambientDrift - meltVector * (1.0 - p);
  
  // Chromatic dispersion during morph
  float aberr = peak * (u_aberration * 0.025);
  
  // Sample tex0 (current) with subtle RGB split
  vec4 col0_R = texture2D(u_tex0, clamp(uv0 + vec2(aberr, 0.0), 0.0, 1.0));
  vec4 col0_G = texture2D(u_tex0, clamp(uv0, 0.0, 1.0));
  vec4 col0_B = texture2D(u_tex0, clamp(uv0 - vec2(aberr * 0.7, 0.0), 0.0, 1.0));
  vec4 col0 = vec4(col0_R.r, col0_G.g, col0_B.b, col0_G.a);
  
  // Sample tex1 (next) with subtle RGB split
  vec4 col1_R = texture2D(u_tex1, clamp(uv1 - vec2(aberr, 0.0), 0.0, 1.0));
  vec4 col1_G = texture2D(u_tex1, clamp(uv1, 0.0, 1.0));
  vec4 col1_B = texture2D(u_tex1, clamp(uv1 + vec2(aberr * 0.7, 0.0), 0.0, 1.0));
  vec4 col1 = vec4(col1_R.r, col1_G.g, col1_B.b, col1_G.a);
  
  // Blend textures with smoothstep progression and subtle warmth during peak melt
  float blendFactor = smoothstep(0.0, 1.0, p);
  vec4 finalCol = mix(col0, col1, blendFactor);
  
  // Subtle NEXUS warm paper grain & amber harmonic lift during active transition
  float warmSheen = peak * 0.035;
  finalCol.rgb += vec3(0.937, 0.353, 0.165) * warmSheen; // #EF5A2A tint
  
  gl_FragColor = finalCol;
}
`;

export const MorphSlider: React.FC<MorphSliderProps> = ({
  items,
  transition = 'melt',
  intensity = 0.34,
  aberration = 0.14,
  drift = 0.20,
  autoplay = true,
  autoplayInterval = 4800,
  pauseOnHover = true,
  className = '',
  style,
  currentIndex: externalIndex,
  onIndexChange,
  aspectRatio = '4/3',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const texturesRef = useRef<WebGLTexture[]>([]);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  
  const [internalIndex, setInternalIndex] = useState(0);
  const currentIndex = externalIndex !== undefined ? externalIndex : internalIndex;
  
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [webglSupported, setWebglSupported] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  // Animation loop and transition refs
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(performance.now());
  const transitionRef = useRef<{
    active: boolean;
    fromIndex: number;
    toIndex: number;
    startTime: number;
    duration: number;
    direction: number;
  }>({
    active: false,
    fromIndex: 0,
    toIndex: 0,
    startTime: 0,
    duration: 1250, // smooth 1.25s organic melt
    direction: 1.0,
  });

  // Check reduced motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mq.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, []);

  // Update active slide trigger
  const goToSlide = useCallback((newIndex: number, direction: number = 1.0) => {
    if (items.length <= 1) return;
    const targetIndex = (newIndex + items.length) % items.length;
    if (targetIndex === currentIndex && !transitionRef.current.active) return;
    
    if (prefersReducedMotion) {
      setInternalIndex(targetIndex);
      onIndexChange?.(targetIndex);
      return;
    }

    transitionRef.current = {
      active: true,
      fromIndex: currentIndex,
      toIndex: targetIndex,
      startTime: performance.now(),
      duration: 1200,
      direction: direction,
    };
    setIsTransitioning(true);
    setInternalIndex(targetIndex);
    onIndexChange?.(targetIndex);
  }, [currentIndex, items.length, onIndexChange, prefersReducedMotion]);

  const nextSlide = useCallback(() => {
    goToSlide(currentIndex + 1, 1.0);
  }, [currentIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentIndex - 1, -1.0);
  }, [currentIndex, goToSlide]);

  // Autoplay timer
  useEffect(() => {
    if (!autoplay || isHovered || !isVisible || items.length <= 1) return;

    const timer = setInterval(() => {
      goToSlide(currentIndex + 1, 1.0);
    }, autoplayInterval);

    return () => clearInterval(timer);
  }, [autoplay, autoplayInterval, isHovered, isVisible, currentIndex, items.length, goToSlide]);

  // IntersectionObserver to pause rendering when offscreen
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);

    const handleVisibility = () => {
      setIsVisible(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Touch & Mouse Drag / Archive Scrub handling
  const dragRef = useRef<{ startX: number; startY: number; isDragging: boolean }>({
    startX: 0,
    startY: 0,
    isDragging: false,
  });

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragRef.current = { startX: clientX, startY: clientY, isDragging: true };
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (!dragRef.current.isDragging) return;
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as React.MouseEvent).clientY;
    const deltaX = clientX - dragRef.current.startX;
    const deltaY = clientY - dragRef.current.startY;
    dragRef.current.isDragging = false;

    // Detect horizontal swipe if deltaX is significant and primarily horizontal
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  // WebGL Texture & Pipeline Setup
  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl: WebGLRenderingContext | null = null;
    try {
      gl = canvas.getContext('webgl', { antialias: true, alpha: true, depth: false });
    } catch {
      gl = null;
    }

    if (!gl) {
      setWebglSupported(false);
      return;
    }
    glRef.current = gl;

    // Compile Shaders
    const createShader = (type: number, src: string) => {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, src);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.warn('Shader compile error:', gl!.getShaderInfoLog(shader));
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vert = createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const frag = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vert || !frag) {
      setWebglSupported(false);
      return;
    }

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('Program link error:', gl.getProgramInfoLog(program));
      setWebglSupported(false);
      return;
    }
    programRef.current = program;
    gl.useProgram(program);

    // Quad geometry (2 triangles covering clip space)
    const vertices = new Float32Array([
      // a_position (x, y), a_uv (u, v)
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

    // Preload & Create Textures for all slides
    const loadedImages: HTMLImageElement[] = [];
    const glTextures: WebGLTexture[] = [];
    let loadedCount = 0;

    items.forEach((item, index) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = item.image;

      img.onload = () => {
        if (!glRef.current) return;
        const glCtx = glRef.current;
        
        // Draw to offscreen canvas to guarantee stable resolution and pixel format
        const offCanvas = document.createElement('canvas');
        offCanvas.width = 1200;
        offCanvas.height = 900;
        const ctx = offCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 1200, 900);
        }

        const texture = glCtx.createTexture();
        if (texture) {
          glCtx.bindTexture(glCtx.TEXTURE_2D, texture);
          glCtx.pixelStorei(glCtx.UNPACK_FLIP_Y_WEBGL, 0);
          glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_WRAP_S, glCtx.CLAMP_TO_EDGE);
          glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_WRAP_T, glCtx.CLAMP_TO_EDGE);
          glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MIN_FILTER, glCtx.LINEAR);
          glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MAG_FILTER, glCtx.LINEAR);
          glCtx.texImage2D(glCtx.TEXTURE_2D, 0, glCtx.RGBA, glCtx.RGBA, glCtx.UNSIGNED_BYTE, offCanvas);
          glTextures[index] = texture;
        }

        loadedCount++;
        if (loadedCount === items.length) {
          texturesRef.current = glTextures;
          imagesRef.current = loadedImages;
          setImagesLoaded(true);
        }
      };

      img.onerror = () => {
        loadedCount++;
        if (loadedCount === items.length) {
          setImagesLoaded(true);
        }
      };

      loadedImages[index] = img;
    });

    // Handle Resize
    const resizeCanvas = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(rect.width * dpr);
      const h = Math.floor(rect.height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    resizeCanvas();

    // Render Animation Loop
    const render = (now: number) => {
      if (!glRef.current || !programRef.current) return;
      const glCtx = glRef.current;
      const prog = programRef.current;

      if (!isVisible) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      glCtx.viewport(0, 0, canvas.width, canvas.height);
      glCtx.clearColor(0.95, 0.93, 0.90, 1.0);
      glCtx.clear(glCtx.COLOR_BUFFER_BIT);

      glCtx.useProgram(prog);

      const timeSec = (now - startTimeRef.current) * 0.001;
      const uTimeLoc = glCtx.getUniformLocation(prog, 'u_time');
      glCtx.uniform1f(uTimeLoc, timeSec);

      const uResLoc = glCtx.getUniformLocation(prog, 'u_resolution');
      glCtx.uniform2f(uResLoc, canvas.width, canvas.height);

      const uIntensityLoc = glCtx.getUniformLocation(prog, 'u_intensity');
      glCtx.uniform1f(uIntensityLoc, intensity);

      const uAberrationLoc = glCtx.getUniformLocation(prog, 'u_aberration');
      glCtx.uniform1f(uAberrationLoc, aberration);

      const uDriftLoc = glCtx.getUniformLocation(prog, 'u_drift');
      glCtx.uniform1f(uDriftLoc, drift);

      // Handle active transition progress
      let progress = 0.0;
      let fromIdx = currentIndex;
      let toIdx = currentIndex;
      let dir = 1.0;

      if (transitionRef.current.active) {
        const elapsed = now - transitionRef.current.startTime;
        const rawProgress = Math.min(elapsed / transitionRef.current.duration, 1.0);
        
        // Organic smoothstep progression
        progress = rawProgress * rawProgress * (3.0 - 2.0 * rawProgress);
        fromIdx = transitionRef.current.fromIndex;
        toIdx = transitionRef.current.toIndex;
        dir = transitionRef.current.direction;

        if (rawProgress >= 1.0) {
          transitionRef.current.active = false;
          setIsTransitioning(false);
          progress = 0.0;
          fromIdx = toIdx;
        }
      }

      const uProgressLoc = glCtx.getUniformLocation(prog, 'u_progress');
      glCtx.uniform1f(uProgressLoc, progress);

      const uDirLoc = glCtx.getUniformLocation(prog, 'u_direction');
      glCtx.uniform1f(uDirLoc, dir);

      // Bind Textures
      const tex0 = texturesRef.current[fromIdx];
      const tex1 = texturesRef.current[toIdx] || tex0;

      if (tex0 && tex1) {
        glCtx.activeTexture(glCtx.TEXTURE0);
        glCtx.bindTexture(glCtx.TEXTURE_2D, tex0);
        glCtx.uniform1i(glCtx.getUniformLocation(prog, 'u_tex0'), 0);

        glCtx.activeTexture(glCtx.TEXTURE1);
        glCtx.bindTexture(glCtx.TEXTURE_2D, tex1);
        glCtx.uniform1i(glCtx.getUniformLocation(prog, 'u_tex1'), 1);

        glCtx.drawArrays(glCtx.TRIANGLES, 0, 6);
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    // Cleanup WebGL resources on unmount
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
      if (gl) {
        texturesRef.current.forEach((t) => gl?.deleteTexture(t));
        if (buffer) gl.deleteBuffer(buffer);
        if (program) gl.deleteProgram(program);
        if (vert) gl.deleteShader(vert);
        if (frag) gl.deleteShader(frag);
      }
    };
  }, [items, intensity, aberration, drift, currentIndex, isVisible, prefersReducedMotion]);

  const currentItem = items[currentIndex] || items[0];

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden select-none bg-[#EAE4D9] ${className}`}
      style={{
        aspectRatio: aspectRatio === '4/3' ? '4 / 3' : aspectRatio === '16/9' ? '16 / 9' : '4 / 3',
        ...style,
      }}
      onMouseEnter={() => pauseOnHover && setIsHovered(true)}
      onMouseLeave={() => pauseOnHover && setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onClick={() => {
        // Optional click-to-advance if not dragging
        if (!dragRef.current.isDragging) {
          nextSlide();
        }
      }}
      role="region"
      aria-label="NEXUS Interactive Morphing Archive Slider"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' || e.key === ' ') {
          e.preventDefault();
          nextSlide();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          prevSlide();
        }
      }}
    >
      {/* WebGL Canvas for GPU Morphing */}
      {webglSupported && !prefersReducedMotion ? (
        <canvas
          ref={canvasRef}
          className="w-full h-full block object-cover cursor-grab active:cursor-grabbing transition-opacity duration-500"
          style={{ opacity: imagesLoaded ? 1 : 0 }}
        />
      ) : (
        /* Reduced Motion or Fallback Graceful Crossfade */
        <div className="relative w-full h-full overflow-hidden">
          {items.map((item, idx) => (
            <img
              key={idx}
              src={item.image}
              alt={item.alt || item.caption || `Archive Exhibit ${idx + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                idx === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              referrerPolicy="no-referrer"
            />
          ))}
        </div>
      )}

      {/* Loading Placeholder Skeleton */}
      {!imagesLoaded && webglSupported && !prefersReducedMotion && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#EAE4D9] text-[#66615A] font-dosis text-xs uppercase tracking-widest animate-pulse">
          LOADING NEXUS ARCHIVE...
        </div>
      )}
    </div>
  );
};

export default MorphSlider;
