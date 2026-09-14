/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  RotateCcw,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Compass,
  Sparkles,
  ArrowRight,
  Info,
  Layers,
} from 'lucide-react';
import { NexusIcon } from '../brand/NexusLogo.tsx';
import { GalleryItem } from '../../types.ts';
import { GALLERY_ITEMS } from '../../data/nexusData.ts';
import { handleImageFallbackError } from '../../data/cloudinaryMap.ts';

export interface DomeGalleryProps {
  items?: GalleryItem[];
  onSelect?: (item: GalleryItem) => void;
  className?: string;
  autoRotateSpeed?: number;
  initialRadius?: number;
  showControls?: boolean;
}

interface DomeNode {
  item: GalleryItem;
  theta: number; // longitude angle in degrees
  phi: number;   // latitude angle in degrees
  id: string;
}

/**
 * DomeGallery
 * A 3D interactive geodesic / spherical amphitheater gallery.
 * Supports smooth momentum dragging, touch pan, auto-rotation, zoom depth,
 * card elevation hover states, and seamless lightbox inspection.
 */
export const DomeGallery: React.FC<DomeGalleryProps> = ({
  items = GALLERY_ITEMS,
  onSelect,
  className = '',
  autoRotateSpeed = 0.25,
  initialRadius = 640,
  showControls = true,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  // Rotation State (Yaw = Y-axis, Pitch = X-axis)
  const [rotY, setRotY] = useState(0);
  const [rotX, setRotX] = useState(-8);
  const [radius, setRadius] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return 460;
    }
    return initialRadius;
  });
  const [isAutoRotating, setIsAutoRotating] = useState(!shouldReduceMotion);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // Physics refs
  const rotYRef = useRef(0);
  const rotXRef = useRef(-8);
  const velYRef = useRef(0);
  const velXRef = useRef(0);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  // Filter items if needed
  const displayItems = useMemo(() => {
    if (activeCategory === 'ALL') return items;
    return items.filter((i) => i.category.toUpperCase() === activeCategory);
  }, [items, activeCategory]);

  // Distribute items across spherical dome rings (Fibonacci sphere / latitude bands)
  const nodes: DomeNode[] = useMemo(() => {
    const list = displayItems.length > 0 ? displayItems : items;
    const total = list.length;
    const result: DomeNode[] = [];

    // Arrange across 3 or 4 latitude rings for high aesthetic balance
    const rings = [
      { phi: 24, count: Math.ceil(total * 0.28) },
      { phi: 2, count: Math.ceil(total * 0.44) },
      { phi: -22, count: Math.ceil(total * 0.28) },
    ];

    let itemIdx = 0;
    rings.forEach((ring, ringIdx) => {
      const step = 360 / Math.max(1, ring.count);
      const ringOffset = ringIdx * 25; // staggered offset for natural spiral

      for (let i = 0; i < ring.count; i++) {
        if (itemIdx < total) {
          result.push({
            item: list[itemIdx],
            theta: i * step + ringOffset,
            phi: ring.phi,
            id: `${list[itemIdx].id}-${ringIdx}-${i}`,
          });
          itemIdx++;
        }
      }
    });

    // If remaining items, place them seamlessly
    while (itemIdx < total) {
      const angle = (itemIdx * (360 / total)) % 360;
      result.push({
        item: list[itemIdx],
        theta: angle,
        phi: (itemIdx % 2 === 0 ? 12 : -12),
        id: `${list[itemIdx].id}-extra-${itemIdx}`,
      });
      itemIdx++;
    }

    return result;
  }, [displayItems, items]);

  // Physics animation loop (momentum, auto-rotation, smooth damping)
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(32, now - lastTime) / 16.666; // normalized delta frame
      lastTime = now;

      if (!isDraggingRef.current) {
        if (isAutoRotating) {
          rotYRef.current += autoRotateSpeed * dt;
        }

        // Apply friction decay to drag velocity
        rotYRef.current += velYRef.current * dt;
        rotXRef.current += velXRef.current * dt;
        velYRef.current *= Math.pow(0.92, dt);
        velXRef.current *= Math.pow(0.92, dt);

        // Clamp Pitch (X-axis) so dome doesn't flip upside down
        rotXRef.current = Math.max(-35, Math.min(35, rotXRef.current));
      }

      setRotY(rotYRef.current);
      setRotX(rotXRef.current);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isAutoRotating, autoRotateSpeed]);

  // Pointer & Drag Handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    velYRef.current = 0;
    velXRef.current = 0;
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    const sensitivity = 0.22;
    rotYRef.current += dx * sensitivity;
    rotXRef.current -= dy * sensitivity;

    // Record velocity for momentum
    velYRef.current = dx * sensitivity * 0.45;
    velXRef.current = -dy * sensitivity * 0.45;

    // Clamp pitch
    rotXRef.current = Math.max(-35, Math.min(35, rotXRef.current));
  }, []);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  // Wheel Zoom Handler
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setRadius((prev) => Math.max(420, Math.min(960, prev - e.deltaY * 0.4)));
  }, []);

  // Reset to default orientation
  const handleReset = () => {
    rotYRef.current = 0;
    rotXRef.current = -8;
    velYRef.current = 0;
    velXRef.current = 0;
    setRadius(initialRadius);
    setRotY(0);
    setRotX(-8);
  };

  const categories = ['ALL', 'PROTOTYPING', 'PEOPLE', 'PROJECTS', 'WORKSHOPS', 'PRESENTATIONS'];

  return (
    <div
      ref={containerRef}
      id="nexus-dome-gallery-container"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
      className={`relative w-full h-full min-h-[560px] md:min-h-[680px] lg:min-h-[760px] overflow-hidden bg-[#0C0C0C] select-none cursor-grab active:cursor-grabbing border border-[rgba(245,239,230,0.10)] ${className}`}
      style={{ touchAction: 'none' }}
    >
      {/* 1. Atmospheric Ambient Radial Glows & Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 z-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(242, 97, 63, 0.12) 0%, rgba(138, 92, 255, 0.05) 45%, transparent 75%)',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-10 z-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(245, 239, 230, 0.3) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      {/* 2. Top-Left HUD Info Badge */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-20 pointer-events-none flex flex-col gap-1.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#141414] border border-[rgba(245,239,230,0.14)] text-[#F5EFE6] text-[11px] font-dosis font-bold tracking-[0.22em] uppercase rounded-full">
          <NexusIcon size="xs" />
          <span>3D DOME SPHERE // {nodes.length} ARTIFACTS</span>
        </div>
        <p className="text-[11px] font-mono text-[#857E74] tracking-wider hidden sm:block">
          DRAG TO ROTATE 360° · SCROLL TO ZOOM · CLICK TO INSPECT
        </p>
      </div>

      {/* 3. Top-Right Category Filters */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20 flex flex-wrap items-center gap-1.5 max-w-[280px] sm:max-w-none justify-end">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveCategory(cat);
            }}
            className={`px-2.5 py-1 text-[10px] sm:text-[11px] font-dosis font-bold tracking-[0.18em] uppercase rounded-full transition-all duration-200 cursor-pointer ${
              activeCategory === cat
                ? 'bg-[#F2613F] text-[#F5EFE6] border border-[#F2613F]'
                : 'bg-[#181818] text-[#C2BBB0] hover:text-[#F5EFE6] border border-[rgba(245,239,230,0.14)] hover:border-[rgba(245,239,230,0.25)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 4. 3D Stage / Perspective Viewport */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          perspective: '1200px',
          perspectiveOrigin: '50% 50%',
        }}
      >
        {/* Dome Spherical Transform Pivot */}
        <div
          className="relative w-0 h-0 pointer-events-auto"
          style={{
            transformStyle: 'preserve-3d',
            transform: `translateZ(-${radius * 0.15}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
            transition: isDragging ? 'none' : 'transform 0.08s linear',
            willChange: 'transform',
          }}
        >
          {nodes.map((node) => {
            const isHovered = hoveredId === node.id;
            const item = node.item;

            // Card size
            const cardWidth = 220;
            const cardHeight = 290;

            return (
              <div
                key={node.id}
                onMouseEnter={() => setHoveredId(node.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.(item);
                }}
                className="group absolute top-0 left-0 cursor-pointer transition-transform duration-300 ease-out"
                style={{
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  marginLeft: `-${cardWidth / 2}px`,
                  marginTop: `-${cardHeight / 2}px`,
                  transformStyle: 'preserve-3d',
                  transform: `rotateY(${node.theta}deg) rotateX(${node.phi}deg) translateZ(${radius}px) ${
                    isHovered ? 'scale3d(1.08, 1.08, 1.08)' : 'scale3d(1, 1, 1)'
                  }`,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                {/* Visual Card Frame */}
                <div
                  className={`w-full h-full flex flex-col rounded-sm overflow-hidden border transition-all duration-300 ${
                    isHovered
                      ? 'bg-[#181818] border-[#F2613F]'
                      : 'bg-[#141414] border-[rgba(245,239,230,0.14)] hover:border-[rgba(245,239,230,0.30)]'
                  }`}
                >
                  {/* Top Image Preview */}
                  <div className="relative w-full h-[155px] overflow-hidden bg-[#181818] border-b border-[rgba(245,239,230,0.10)]">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108 filter brightness-[0.92] contrast-[1.05] group-hover:brightness-105"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={handleImageFallbackError}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#141414]">
                        <NexusIcon size="md" className="opacity-40 text-[#857E74]" />
                      </div>
                    )}

                    {/* Category Pill Tag */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#0C0C0C] border border-[rgba(245,239,230,0.18)] text-[9px] font-dosis font-bold tracking-[0.2em] text-[#F2613F] uppercase rounded-xs">
                      {item.category}
                    </div>

                    {/* Date Badge */}
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-[#0C0C0C] border border-[rgba(245,239,230,0.10)] text-[8px] font-mono text-[#C2BBB0] tracking-wider">
                      {item.eventDate}
                    </div>
                  </div>

                  {/* Card Content & Metadata */}
                  <div className="p-3.5 flex flex-col justify-between grow">
                    <div className="space-y-1">
                      <h3 className="font-fraunces font-bold text-sm text-[#F5EFE6] leading-snug line-clamp-2 group-hover:text-[#F2613F] transition-colors">
                        {item.title}
                      </h3>
                      <p className="font-bitter text-[11px] text-[#C2BBB0] line-clamp-2 leading-relaxed">
                        {item.caption || item.description}
                      </p>
                    </div>

                    <div className="pt-2 mt-auto border-t border-[rgba(245,239,230,0.10)] flex items-center justify-between text-[9px] font-mono text-[#857E74]">
                      <span className="truncate max-w-[120px]">
                        {item.author || item.location || 'NEXUS LAB'}
                      </span>
                      <span className="flex items-center gap-1 text-[#F2613F] font-dosis font-bold tracking-wider group-hover:translate-x-0.5 transition-transform">
                        <span>VIEW</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Bottom Interactive Controls HUD */}
      {showControls && (
        <div className="absolute bottom-4 sm:bottom-6 inset-x-4 sm:inset-x-6 z-20 flex items-center justify-between pointer-events-none">
          {/* Left: Auto-Spin Toggle & Reset */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#181818] hover:bg-[#22201F] border border-[rgba(245,239,230,0.14)] hover:border-[#F2613F] text-[#F5EFE6] text-xs font-dosis font-bold tracking-[0.16em] uppercase rounded-full transition-all duration-200 cursor-pointer shadow-xs"
              title={isAutoRotating ? 'Pause Auto Spin' : 'Resume Auto Spin'}
            >
              {isAutoRotating ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-[#F2613F]" />
                  <span>PAUSE</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-[#F2613F]" />
                  <span>SPIN</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#181818] hover:bg-[#22201F] border border-[rgba(245,239,230,0.14)] hover:border-[rgba(245,239,230,0.25)] text-[#F5EFE6] text-xs font-dosis font-bold tracking-[0.16em] uppercase rounded-full transition-all duration-200 cursor-pointer shadow-xs"
              title="Reset View Orientation"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#C2BBB0]" />
              <span className="hidden sm:inline">RESET</span>
            </button>
          </div>

          {/* Center: Mobile Drag Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1 bg-[#141414] border border-[rgba(245,239,230,0.10)] text-[10px] font-mono text-[#857E74] tracking-widest uppercase rounded-full">
            <Compass className="w-3 h-3 text-[#F2613F] animate-spin-slow" />
            <span>DRAG SPHERE TO NAVIGATE DOME</span>
          </div>

          {/* Right: Zoom Level Controls */}
          <div className="flex items-center gap-1.5 bg-[#181818] border border-[rgba(245,239,230,0.14)] p-1 rounded-full pointer-events-auto shadow-xs">
            <button
              type="button"
              onClick={() => setRadius((r) => Math.max(420, r - 60))}
              className="p-1.5 text-[#C2BBB0] hover:text-[#F5EFE6] hover:bg-[#22201F] rounded-full transition-colors cursor-pointer"
              title="Zoom In (Expand Dome)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-[#857E74] px-1 select-none">
              {Math.round(radius)}px
            </span>
            <button
              type="button"
              onClick={() => setRadius((r) => Math.min(960, r + 60))}
              className="p-1.5 text-[#C2BBB0] hover:text-[#F5EFE6] hover:bg-[#22201F] rounded-full transition-colors cursor-pointer"
              title="Zoom Out (Compress Dome)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DomeGallery;
