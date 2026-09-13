/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface EditorialWordRevealProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  delay?: number;
  stagger?: number;
  id?: string;
}

/**
 * Editorial Word Reveal Component
 * Splits major headlines into word tokens for restrained, staggered typographic entrances (35-45ms stagger).
 * Bypasses animation when prefers-reduced-motion is active.
 */
export const EditorialWordReveal: React.FC<EditorialWordRevealProps> = ({
  text,
  className = '',
  as = 'h2',
  delay = 0.1,
  stagger = 0.04,
  id,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const words = text.split(' ');

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const wordVariants = {
    hidden: shouldReduceMotion
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  const Tag = motion[as] as any;

  if (shouldReduceMotion) {
    const RawTag = as;
    return (
      <RawTag id={id} className={className}>
        {text}
      </RawTag>
    );
  }

  return (
    <Tag
      id={id}
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
    >
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden mr-[0.26em] last:mr-0 align-top">
          <motion.span variants={wordVariants} className="inline-block">
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
};

export default EditorialWordReveal;
