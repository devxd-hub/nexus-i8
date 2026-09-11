/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SectionLabel } from './SectionLabel.tsx';

interface SectionHeaderProps {
  labelNumber?: string;
  labelText: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  id?: string;
  align?: 'left' | 'center' | 'between';
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  labelNumber,
  labelText,
  title,
  subtitle,
  action,
  className = '',
  id,
  align = 'left',
}) => {
  if (align === 'between') {
    return (
      <div
        id={id}
        className={`flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[rgba(10,10,9,0.12)] ${className}`}
      >
        <div className="max-w-3xl">
          <SectionLabel number={labelNumber} label={labelText} className="mb-3" />
          <h2 className="nexus-heading-xl text-[#0A0A09] mt-1">{title}</h2>
          {subtitle && <p className="nexus-body mt-3 max-w-2xl">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    );
  }

  if (align === 'center') {
    return (
      <div id={id} className={`text-center max-w-3xl mx-auto pb-8 ${className}`}>
        <SectionLabel number={labelNumber} label={labelText} className="mb-3 justify-center" />
        <h2 className="nexus-heading-xl text-[#0A0A09] mt-1">{title}</h2>
        {subtitle && <p className="nexus-body mt-3">{subtitle}</p>}
        {action && <div className="mt-6">{action}</div>}
      </div>
    );
  }

  return (
    <div
      id={id}
      className={`pb-8 border-b border-[rgba(10,10,9,0.12)] ${className}`}
    >
      <SectionLabel number={labelNumber} label={labelText} className="mb-3" />
      <h2 className="nexus-heading-xl text-[#0A0A09] mt-1">{title}</h2>
      {subtitle && <p className="nexus-body mt-3 max-w-2xl">{subtitle}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};
