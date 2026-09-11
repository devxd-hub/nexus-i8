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
      className={`inline-flex items-center gap-2 font-dosis font-semibold text-xs uppercase tracking-[0.22em] text-[#66615A] ${className}`}
    >
      {number && (
        <span className="text-[#EF5A2A] font-bold">{number}</span>
      )}
      {number && <span className="text-[rgba(10,10,9,0.25)]">/</span>}
      <span className="text-[#0A0A09]">{label}</span>
    </div>
  );
};
