/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { motion, AnimatePresence, Transition, useReducedMotion } from 'motion/react';

export interface RotatingTextRef {
  next: () => void;
  previous: () => void;
  jumpTo: (index: number) => void;
  reset: () => void;
}

export interface RotatingTextProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof motion.span>,
    'children' | 'transition' | 'initial' | 'animate' | 'exit'
  > {
  texts: string[];
  transition?: Transition;
  initial?: any;
  animate?: any;
  exit?: any;
  animatePresenceMode?: 'sync' | 'wait' | 'popLayout';
  animatePresenceInitial?: boolean;
  rotationInterval?: number;
  staggerDuration?: number;
  staggerFrom?: 'first' | 'last' | 'center' | 'random' | number;
  loop?: boolean;
  auto?: boolean;
  splitBy?: 'characters' | 'words' | 'lines' | string;
  onNext?: (index: number) => void;
  mainClassName?: string;
  splitLevelClassName?: string;
  elementLevelClassName?: string;
}

/**
 * Editorial RotatingText Component.
 * Supports character/word splitting, bidirectional stagger, spring physics,
 * deterministic rotation, seamless exit/enter handoff, and full reduced-motion accessibility.
 */
export const RotatingText = forwardRef<RotatingTextRef, RotatingTextProps>(
  (
    {
      texts,
      transition = { type: 'spring', damping: 30, stiffness: 400 },
      initial = { y: '100%', opacity: 0 },
      animate = { y: 0, opacity: 1 },
      exit = { y: '-120%', opacity: 0 },
      animatePresenceMode = 'wait',
      animatePresenceInitial = false,
      rotationInterval = 3000,
      staggerDuration = 0.02,
      staggerFrom = 'last',
      loop = true,
      auto = true,
      splitBy = 'characters',
      onNext,
      mainClassName = '',
      splitLevelClassName = '',
      elementLevelClassName = '',
      ...restProps
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion();
    const [currentTextIndex, setCurrentTextIndex] = useState(0);

    const handleIndexChange = useCallback(
      (newIndex: number) => {
        setCurrentTextIndex(newIndex);
        if (onNext) onNext(newIndex);
      },
      [onNext]
    );

    const next = useCallback(() => {
      const nextIndex =
        currentTextIndex === texts.length - 1
          ? loop
            ? 0
            : currentTextIndex
          : currentTextIndex + 1;
      if (nextIndex !== currentTextIndex) {
        handleIndexChange(nextIndex);
      }
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);

    const previous = useCallback(() => {
      const prevIndex =
        currentTextIndex === 0
          ? loop
            ? texts.length - 1
            : currentTextIndex
          : currentTextIndex - 1;
      if (prevIndex !== currentTextIndex) {
        handleIndexChange(prevIndex);
      }
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);

    const jumpTo = useCallback(
      (index: number) => {
        const validIndex = Math.max(0, Math.min(index, texts.length - 1));
        handleIndexChange(validIndex);
      },
      [texts.length, handleIndexChange]
    );

    const reset = useCallback(() => {
      handleIndexChange(0);
    }, [handleIndexChange]);

    useImperativeHandle(
      ref,
      () => ({
        next,
        previous,
        jumpTo,
        reset,
      }),
      [next, previous, jumpTo, reset]
    );

    // Auto-advance interval
    useEffect(() => {
      if (!auto || shouldReduceMotion || texts.length <= 1) return;

      const intervalId = setInterval(next, rotationInterval);
      return () => clearInterval(intervalId);
    }, [next, rotationInterval, auto, shouldReduceMotion, texts.length]);

    // Current word/phrase to display
    const currentText = texts[currentTextIndex] || '';

    // Split logic
    const elements = useMemo(() => {
      if (splitBy === 'characters') {
        return currentText.split('');
      }
      if (splitBy === 'words') {
        return currentText.split(' ');
      }
      if (splitBy === 'lines') {
        return currentText.split('\n');
      }
      return currentText.split(splitBy);
    }, [currentText, splitBy]);

    // Calculate stagger delay based on staggerFrom
    const getStaggerDelay = useCallback(
      (index: number, total: number) => {
        if (total <= 1) return 0;

        let calculatedIndex = index;
        if (staggerFrom === 'first') {
          calculatedIndex = index;
        } else if (staggerFrom === 'last') {
          calculatedIndex = total - 1 - index;
        } else if (staggerFrom === 'center') {
          calculatedIndex = Math.abs(Math.floor(total / 2) - index);
        } else if (staggerFrom === 'random') {
          calculatedIndex = (index * 7 + 3) % total;
        } else if (typeof staggerFrom === 'number') {
          calculatedIndex = Math.abs(staggerFrom - index);
        }

        return calculatedIndex * staggerDuration;
      },
      [staggerFrom, staggerDuration]
    );

    // Reduced motion view: static, accessible, non-animated
    if (shouldReduceMotion) {
      return (
        <span
          className={`inline-flex items-center justify-center ${mainClassName}`}
          aria-label={currentText}
        >
          <span className={elementLevelClassName}>{texts[0] || currentText}</span>
        </span>
      );
    }

    return (
      <span
        className={`relative inline-flex items-center justify-center ${mainClassName}`}
        aria-label={currentText}
        {...restProps}
      >
        <span className="sr-only">{currentText}</span>
        <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
          <motion.span
            key={currentTextIndex}
            className={`inline-flex items-center justify-center ${splitLevelClassName}`}
            aria-hidden="true"
          >
            {elements.map((element, index) => {
              const delay = getStaggerDelay(index, elements.length);
              const isSpace = element === ' ';

              return (
                <motion.span
                  key={`${element}-${index}`}
                  initial={initial}
                  animate={animate}
                  exit={exit}
                  transition={{
                    ...transition,
                    delay,
                  }}
                  className={`inline-block whitespace-pre ${elementLevelClassName}`}
                >
                  {isSpace ? '\u00A0' : element}
                </motion.span>
              );
            })}
          </motion.span>
        </AnimatePresence>
      </span>
    );
  }
);

RotatingText.displayName = 'RotatingText';
export default RotatingText;
