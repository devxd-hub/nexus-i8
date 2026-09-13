import React, { useMemo } from 'react';
import QRCode from 'qrcode';

interface QrCodeProps {
  value: string;
  size?: number;
  className?: string;
  darkColor?: string; // QR module color (foreground)
  lightColor?: string; // QR background color
  margin?: number; // quiet-zone padding in modules
}

/**
 * High-precision, standard-compliant machine-readable QR Code component
 * powered by ISO/IEC 18004 Reed-Solomon generation.
 *
 * Supports white foreground on dark background with sufficient quiet zone padding
 * so that any modern smartphone camera can immediately scan and parse the URL.
 */
export const QrCode: React.FC<QrCodeProps> = ({
  value,
  size = 112,
  className = '',
  darkColor = '#FFFFFF', // Near-white foreground modules
  lightColor = '#0A0A0A', // Dark background
  margin = 3, // Standard quiet zone
}) => {
  const qrData = useMemo(() => {
    try {
      const qr = QRCode.create(value, {
        errorCorrectionLevel: 'M',
      });
      const moduleCount = qr.modules.size;
      const totalSize = moduleCount + margin * 2;

      // Construct a single SVG path for peak performance and crisp module rendering
      let path = '';
      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          if (qr.modules.get(r, c)) {
            const x = c + margin;
            const y = r + margin;
            path += `M${x},${y}h1v1h-1z `;
          }
        }
      }

      return {
        totalSize,
        path,
        error: null,
      };
    } catch (err) {
      console.error('QR code generation error:', err);
      return {
        totalSize: 29,
        path: '',
        error: err instanceof Error ? err.message : 'Failed to generate QR',
      };
    }
  }, [value, margin]);

  if (qrData.error) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center bg-black/60 text-[8px] font-mono-tech text-[#8A8A82] p-2 text-center rounded border border-white/[0.08] ${className}`}
      >
        QR GENERATION FAULT
      </div>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${qrData.totalSize} ${qrData.totalSize}`}
      width={size}
      height={size}
      className={`block shape-rendering-crispEdges ${className}`}
      role="img"
      aria-label={`Machine-readable QR Code for ${value}`}
      style={{ shapeRendering: 'crispEdges' }}
    >
      {/* Quiet zone & background */}
      <rect width={qrData.totalSize} height={qrData.totalSize} fill={lightColor} />

      {/* High-contrast QR Modules */}
      <path d={qrData.path} fill={darkColor} />
    </svg>
  );
};
