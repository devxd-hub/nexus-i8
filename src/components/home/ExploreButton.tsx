/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useMagnetic } from '../primitives/Button.tsx';

export interface ExploreNexusButtonProps {
  id?: string;
  onClick?: () => void;
  className?: string;
  label?: string;
  magnetic?: boolean;
}

/**
 * Explore Nexus Button
 * Architectural adaptation of the sliding icon expansion button tailored to the NEXUS design system.
 */
export const ExploreNexusButton: React.FC<ExploreNexusButtonProps> = ({
  id = 'hero-explore-nexus-btn',
  onClick,
  className = '',
  label = 'EXPLORE NEXUS',
  magnetic = true,
}) => {
  const { style, handleMouseMove, handleMouseLeave } = useMagnetic(magnetic);

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <button
        id={id}
        type="button"
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={style}
        className="cssbuttons-io-button group"
        aria-label={label}
      >
        <span className="btn-text">{label}</span>
        <div className="icon" aria-hidden="true">
          <svg height={16} width={16} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0h24v24H0z" fill="none" />
            <path
              d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
              fill="currentColor"
            />
          </svg>
        </div>
      </button>
    </div>
  );
};

export default ExploreNexusButton;
