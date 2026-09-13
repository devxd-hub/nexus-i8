/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface SectionLabelProps {
  number?: string;
  label: string;
  className?: string;
  id?: string;
}

/**
 * Clean semantic section label / kicker.
 * Example: "01 / ABOUT" or "HOW NEXUS WORKS"
 */
export const SectionLabel: React.FC<SectionLabelProps> = ({
  number,
  label,
  className = '',
  id,
}) => {
  return (
    <div
      id={id}
      className={`inline-flex items-center gap-2 font-dosis font-semibold text-xs uppercase tracking-[0.22em] text-[#857E74] ${className}`}
    >
      {number && (
        <span className="text-[#F2613F] font-bold">{number}</span>
      )}
      {number && <span className="text-[rgba(245,239,230,0.25)]">/</span>}
      <span className="text-[#F5EFE6]">{label}</span>
    </div>
  );
};
