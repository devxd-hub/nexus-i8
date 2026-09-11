/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';

interface LinuxBootSequenceProps {
  onComplete: () => void;
}

export const LinuxBootSequence: React.FC<LinuxBootSequenceProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 180);
    const t2 = setTimeout(() => setStep(2), 360);
    const t3 = setTimeout(() => setStep(3), 560);
    const t4 = setTimeout(() => onComplete(), 800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div
      onClick={onComplete}
      className="fixed inset-0 z-50 bg-[#0A0A09] text-[#F3EEE5] font-mono text-xs p-6 flex flex-col justify-end select-none cursor-pointer"
    >
      <div className="space-y-1.5 max-w-xl mb-8">
        <div className="text-[#EF5A2A] font-bold text-sm mb-4">
          === NEXUS WORKSPACE INITIALIZING ===
        </div>

        {step >= 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[#00E5A3] font-bold">[  OK  ]</span>
            <span>Started NEXUS Kernel Architecture v2.6.4-amd64</span>
          </div>
        )}

        {step >= 1 && (
          <div className="flex items-center gap-2">
            <span className="text-[#00E5A3] font-bold">[  OK  ]</span>
            <span>Mounted Virtual Filesystem: /home/nexus/projects [6 packages]</span>
          </div>
        )}

        {step >= 2 && (
          <div className="flex items-center gap-2">
            <span className="text-[#00E5A3] font-bold">[  OK  ]</span>
            <span>Starting Compositor, Window Manager, and Desktop Shell...</span>
          </div>
        )}

        {step >= 3 && (
          <div className="flex items-center gap-2 text-[#EF5A2A] animate-pulse">
            <span>&gt; Rendering desktop environment...</span>
          </div>
        )}
      </div>

      <div className="text-[10px] text-[#66615A]">
        Press any key or click to skip initialization
      </div>
    </div>
  );
};
