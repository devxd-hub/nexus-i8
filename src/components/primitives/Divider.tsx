/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface DividerProps {
  className?: string;
  darker?: boolean;
  label?: string;
  id?: string;
}

export const Divider: React.FC<DividerProps> = ({
  className = '',
  darker = false,
  label,
  id,
}) => {
  const borderColor = darker
    ? 'border-[rgba(10,10,9,0.24)]'
    : 'border-[rgba(10,10,9,0.12)]';

  if (label) {
    return (
      <div id={id} className={`relative flex items-center w-full py-4 ${className}`}>
        <div className={`flex-grow border-t ${borderColor}`} />
        <span className="flex-shrink mx-4 font-mono text-xs uppercase tracking-widest text-[#66615A]">
          {label}
        </span>
        <div className={`flex-grow border-t ${borderColor}`} />
      </div>
    );
  }

  return (
    <hr
      id={id}
      className={`w-full border-t ${borderColor} border-0 my-0 ${className}`}
    />
  );
};
