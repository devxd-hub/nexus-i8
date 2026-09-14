"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils.ts";
import { handleImageFallbackError } from "../../data/cloudinaryMap.ts";

const images = [
  "https://cdn.21st.dev/assets/mirror/67/6736e09c72013915f540c0dfd48fb34eab707dd3745c8e3e7932e7dde2bb0d28.png",
  "https://cdn.21st.dev/assets/mirror/ca/caab6367d517dd33f4cf09b7fd151bf00fc17b714ada90c6a9d348e79e3a3c56.jpg",
  "https://cdn.21st.dev/assets/mirror/fd/fd041b7716d1bed8ec34ab7052114033b28e1793d7292af86c2fac7ff034e018.png",
  "https://cdn.21st.dev/assets/mirror/de/de138d3ae34eff5b57061dbebe77e02bb0eef27fd3031f588fc31d9de601b342.png",
  "https://cdn.21st.dev/assets/mirror/fd/fd59e7d53418be9b77716fe63730677b4b41a7a2f7970eb7e016ccd7664fc9ae.png",
  "https://cdn.21st.dev/assets/mirror/4b/4bb457abcb2c96f2342aca6b68ca781aa09c2fb954fb6f45868e06cba485aaf4.png",
  "https://cdn.21st.dev/assets/mirror/f5/f5a063fba53eeb4786b692c6b819db22ce7ef209cb8d9f95f3c4a7c56890490c.jpg",
  "https://cdn.21st.dev/assets/mirror/98/989de8a6fa0d3d1c8e733571c1dd3c81fd525d83b06b06911881af69cf45ae36.jpg",
  "https://cdn.21st.dev/assets/mirror/0b/0b6fa6575c3d9e2b42d88522012b15480c2466489dce1eb9dde58af6118e37f4.png",
];

// Inline NoiseWrapper as a small helper CardHover with GPU-cached texture
export const InlineNoise = ({
  children,
  opacity = 0.27,
  className,
}: {
  children: React.ReactNode;
  opacity?: number;
  className?: string;
}) => {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* High-performance GPU-cached noise overlay (no dynamic SVG re-rasterization on resize) */}
      <div
        className="pointer-events-none absolute inset-0 isolate z-30 size-full select-none"
        style={{
          opacity,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "180px 180px",
          mixBlendMode: "overlay",
        }}
        aria-hidden="true"
      />

      {children}
    </div>
  );
};

export interface CardHoverProps {
  items?: Array<{
    id?: string;
    name?: string;
    role?: string;
    imageUrl?: string;
    imagePosition?: string;
    discipline?: string;
    yearOfStudy?: string;
    group?: string;
  }>;
  onSelect?: (item: any) => void;
  className?: string;
  title?: string;
  subtitle?: string;
}

const CardHover: React.FC<CardHoverProps> = ({
  items,
  onSelect,
  className,
  title,
  subtitle,
}) => {
  // If no items provided, use the exact demo images
  const isDemo = !items || items.length === 0;
  const count = isDemo ? images.length : items.length;
  const initialIndex = Math.min(count - 1, isDemo ? 2 : 0);
  const [expandedImage, setExpandedImage] = useState(initialIndex);
  const hoverRafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (hoverRafRef.current) {
        cancelAnimationFrame(hoverRafRef.current);
      }
    };
  }, []);

  const handleMouseEnter = (idx: number) => {
    if (idx === expandedImage) return;
    if (hoverRafRef.current) {
      cancelAnimationFrame(hoverRafRef.current);
    }
    hoverRafRef.current = requestAnimationFrame(() => {
      setExpandedImage(idx);
    });
  };

  const getImageWidth = (index: number) => {
    const isExpanded = index === expandedImage;
    if (count <= 2) {
      return isExpanded ? "30rem" : "12rem";
    }
    if (count <= 4) {
      return isExpanded ? "26rem" : "8rem";
    }
    return isExpanded ? "24rem" : "5.5rem";
  };

  return (
    <div className={cn("w-full bg-[#0C0C0C] py-8 sm:py-12", isDemo && "h-screen min-h-screen", className)}>
      <div className={cn("relative grid items-center justify-center p-2 lg:flex transition-all duration-300 w-full", isDemo && "min-h-screen")}>
        <div className="w-full h-full overflow-hidden rounded-[2px]">
          <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#0C0C0C]">
            {/* Optional Header when displaying squads */}
            {(title || subtitle) && (
              <div className="w-full max-w-6xl px-5 mb-6 text-center sm:text-left">
                {title && (
                  <h3 className="font-fraunces font-bold text-2xl sm:text-3xl text-[#F5EFE6] uppercase tracking-tight">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="font-bitter text-xs sm:text-sm text-[#C2BBB0] mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            <div className="relative w-full max-w-6xl px-2 sm:px-5">
              <div className="flex w-full items-center justify-center gap-1 sm:gap-2 overflow-x-auto py-2 no-scrollbar">
                {isDemo
                  ? images.map((src, idx) => {
                      const isExpanded = idx === expandedImage;
                      return (
                        <div
                          key={idx}
                          className="relative shrink-0 cursor-pointer overflow-hidden rounded-[2px] transition-[width,transform,opacity,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu will-change-[width] border border-[rgba(245,239,230,0.14)] shadow-xs"
                          style={{
                            width: getImageWidth(idx),
                            height: "24rem",
                            contain: "paint",
                          }}
                          onMouseEnter={() => handleMouseEnter(idx)}
                        >
                          <InlineNoise className="rounded-[2px] h-full w-full" opacity={0.27}>
                            <img
                              className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                              src={src}
                              alt={`Image ${idx + 1}`}
                            />
                          </InlineNoise>
                        </div>
                      );
                    })
                  : items.map((member, idx) => {
                      const isExpanded = idx === expandedImage;
                      return (
                        <div
                          key={member.id || idx}
                          onClick={() => onSelect && onSelect(member)}
                          className={cn(
                            "relative shrink-0 cursor-pointer overflow-hidden rounded-[2px] transition-[width,transform,opacity,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu will-change-[width] border select-none shadow-xs",
                            isExpanded
                              ? "border-[#F2613F] bg-[#181818] shadow-md z-10"
                              : "border-[rgba(245,239,230,0.14)] bg-[#141414] hover:border-[rgba(245,239,230,0.30)] opacity-90 hover:opacity-100"
                          )}
                          style={{
                            width: getImageWidth(idx),
                            height: "26rem",
                            contain: "paint",
                          }}
                          onMouseEnter={() => handleMouseEnter(idx)}
                        >
                          <InlineNoise className="rounded-[2px] h-full w-full bg-[#181818]" opacity={0.27}>
                            {member.imageUrl ? (
                              <img
                                className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                                src={member.imageUrl}
                                alt={member.name || `Crew member ${idx + 1}`}
                                onError={handleImageFallbackError}
                                style={{
                                  objectPosition: member.imagePosition || "center 20%",
                                  transform: isExpanded ? "scale(1.03)" : "scale(1)",
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-[#181818] flex items-center justify-center font-dosis font-bold text-xs uppercase text-[#857E74]">
                                {member.name}
                              </div>
                            )}

                            {/* Top Badge Overlay */}
                            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
                              <span className="px-2.5 py-1 bg-[#181818] border border-[rgba(245,239,230,0.14)] text-[#F5EFE6] text-[10px] font-dosis font-bold tracking-[0.2em] uppercase rounded-[2px]">
                                {member.group || "CREW"}
                              </span>
                            </div>

                            {/* Collapsed State Name Indicator (Vertical text) */}
                            {!isExpanded && (
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0C]/85 via-transparent to-transparent flex flex-col justify-end p-3 pointer-events-none">
                                <span className="text-[11px] font-dosis font-bold tracking-[0.15em] text-[#F5EFE6] uppercase truncate text-center">
                                  {member.name?.split(" ")[0]}
                                </span>
                              </div>
                            )}

                            {/* Expanded Editorial Dossier Bar */}
                            <div
                              className={cn(
                                "absolute inset-0 bg-gradient-to-t from-[#0C0C0C]/95 via-[#0C0C0C]/50 to-transparent flex flex-col justify-end p-6 text-[#F5EFE6] transition-opacity duration-300 pointer-events-none",
                                isExpanded ? "opacity-100" : "opacity-0"
                              )}
                            >
                              <div className="space-y-1">
                                <span className="text-[11px] font-dosis font-bold tracking-[0.25em] text-[#F2613F] uppercase block">
                                  {member.role}
                                </span>
                                <h4 className="font-fraunces font-bold text-2xl text-[#F5EFE6] tracking-tight uppercase leading-tight">
                                  {member.name}
                                </h4>
                                {member.discipline && (
                                  <p className="font-bitter text-xs text-[#C2BBB0] line-clamp-2 pt-1">
                                    {member.discipline}
                                  </p>
                                )}
                              </div>

                              <div className="pt-3 mt-2 flex items-center justify-between border-t border-[rgba(245,239,230,0.14)] text-[10px] font-dosis font-bold tracking-[0.2em] text-[#F2613F]">
                                <span>CLICK TO VIEW FULL DOSSIER</span>
                                <span>↗</span>
                              </div>
                            </div>
                          </InlineNoise>
                        </div>
                      );
                    })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardHover;
