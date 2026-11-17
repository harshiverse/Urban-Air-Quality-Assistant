'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface GhostTypeProps {
  /** The fixed root prefix text (e.g. "Understand the Air You Breathe.") */
  text: string;
  /** Array of completion strings to cycle through sequentially */
  completions: string[];
  /** Typing speed for prefix in ms per character (0 for immediate rendering) */
  typeSpeed?: number;
  /** Speed at which ghost completion streams in (ms per char) */
  streamSpeed?: number;
  /** Delay simulating AI thinking before ghost text streams (ms) */
  thinkDelay?: number;
  /** Delay before ghost text is accepted / locked in (ms) */
  acceptDelay?: number;
  /** Duration the accepted text remains visible before transitioning (ms) */
  holdDelay?: number;
  /** Speed at which completion deletes/backspaces when cycling (ms per char) */
  deleteSpeed?: number;
  /** Opacity for the ghost completion preview (0.1 to 1.0) */
  ghostOpacity?: number;
  /** Show animated blinking caret cursor */
  caret?: boolean;
  /** Loop continuously through completions */
  loop?: boolean;
  /** Show subtle keyboard hint (e.g. 'Tab' pill) next to ghost text */
  hint?: boolean;
  /** Allow clicking on ghost text to accept immediately */
  clickToAccept?: boolean;
  /** Pause animation on mouse hover */
  pauseOnHover?: boolean;
  /** Additional class name for container */
  className?: string;
  /** Class name for root prefix text */
  prefixClassName?: string;
  /** Class name for accepted completion text */
  completionClassName?: string;
  /** Class name for streaming ghost preview */
  ghostClassName?: string;
  /** Class name for caret cursor */
  caretClassName?: string;
}

type Phase =
  | 'typing-prefix'
  | 'thinking'
  | 'streaming-ghost'
  | 'accept-pending'
  | 'accepted'
  | 'deleting';

export const GhostType: React.FC<GhostTypeProps> = ({
  text,
  completions,
  typeSpeed = 0,
  streamSpeed = 45,
  thinkDelay = 500,
  acceptDelay = 900,
  holdDelay = 2600,
  deleteSpeed = 24,
  ghostOpacity = 0.4,
  caret = true,
  loop = true,
  hint = false,
  clickToAccept = true,
  pauseOnHover = true,
  className,
  prefixClassName,
  completionClassName,
  ghostClassName,
  caretClassName,
}) => {
  // Ensure we have at least one completion
  const safeCompletions = useMemo(
    () => (completions.length > 0 ? completions : ['']),
    [completions]
  );

  const [prefixLength, setPrefixLength] = useState<number>(
    typeSpeed === 0 ? text.length : 0
  );
  const [completionIndex, setCompletionIndex] = useState<number>(0);
  const [streamLength, setStreamLength] = useState<number>(0);
  const [phase, setPhase] = useState<Phase>(
    typeSpeed === 0 ? 'thinking' : 'typing-prefix'
  );
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [caretVisible, setCaretVisible] = useState<boolean>(true);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);

  const currentTarget = safeCompletions[completionIndex] ?? '';

  // Check for reduced motion
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(media.matches);
    }
  }, []);

  // Blinking caret timer
  useEffect(() => {
    if (!caret || isReducedMotion) return;
    const interval = setInterval(() => {
      setCaretVisible((v) => !v);
    }, 530);
    return () => clearInterval(interval);
  }, [caret, isReducedMotion]);

  // Main state machine animation loop
  useEffect(() => {
    if (isReducedMotion || isPaused) return;

    let timer: NodeJS.Timeout;

    switch (phase) {
      case 'typing-prefix': {
        if (prefixLength < text.length) {
          timer = setTimeout(() => {
            setPrefixLength((len) => len + 1);
          }, typeSpeed);
        } else {
          setPhase('thinking');
        }
        break;
      }

      case 'thinking': {
        timer = setTimeout(() => {
          setStreamLength(0);
          setPhase('streaming-ghost');
        }, thinkDelay);
        break;
      }

      case 'streaming-ghost': {
        if (streamLength < currentTarget.length) {
          timer = setTimeout(() => {
            setStreamLength((len) => len + 1);
          }, streamSpeed);
        } else {
          setPhase('accept-pending');
        }
        break;
      }

      case 'accept-pending': {
        timer = setTimeout(() => {
          setPhase('accepted');
        }, acceptDelay);
        break;
      }

      case 'accepted': {
        if (!loop && completionIndex === safeCompletions.length - 1) {
          // If not looping and on last completion, stay accepted
          return;
        }
        timer = setTimeout(() => {
          setPhase('deleting');
        }, holdDelay);
        break;
      }

      case 'deleting': {
        if (streamLength > 0) {
          timer = setTimeout(() => {
            setStreamLength((len) => Math.max(0, len - 1));
          }, deleteSpeed);
        } else {
          setCompletionIndex((idx) => (idx + 1) % safeCompletions.length);
          setPhase('thinking');
        }
        break;
      }
    }

    return () => clearTimeout(timer);
  }, [
    phase,
    prefixLength,
    streamLength,
    currentTarget,
    completionIndex,
    safeCompletions,
    text,
    typeSpeed,
    streamSpeed,
    thinkDelay,
    acceptDelay,
    holdDelay,
    deleteSpeed,
    loop,
    isPaused,
    isReducedMotion,
  ]);

  // Handle click to accept
  const handleAcceptClick = () => {
    if (!clickToAccept) return;
    if (phase === 'streaming-ghost' || phase === 'accept-pending') {
      setStreamLength(currentTarget.length);
      setPhase('accepted');
    }
  };

  // If reduced motion is preferred, render static full headline
  if (isReducedMotion) {
    return (
      <span className={cn('inline-block', className)}>
        <span className={prefixClassName}>{text} </span>
        <span className={completionClassName}>{safeCompletions[0]}</span>
      </span>
    );
  }

  const displayedPrefix = text.slice(0, prefixLength);
  const displayedCompletion = currentTarget.slice(0, streamLength);
  const isAccepted = phase === 'accepted';
  const isGhost = phase === 'streaming-ghost' || phase === 'accept-pending';
  const isDeleting = phase === 'deleting';

  return (
    <span
      className={cn('inline-block relative select-text', className)}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      {/* Root Prefix Text */}
      <span className={cn('text-foreground', prefixClassName)}>
        {displayedPrefix}
      </span>

      {/* Completion Text (Accepted or Deleting) */}
      {(isAccepted || isDeleting) && (
        <span
          className={cn(
            'transition-opacity duration-300 font-extrabold',
            completionClassName
          )}
        >
          {displayedCompletion}
        </span>
      )}

      {/* Streaming AI Ghost Completion Preview */}
      {isGhost && (
        <span
          onClick={handleAcceptClick}
          className={cn(
            'inline transition-opacity duration-200 cursor-pointer font-extrabold',
            clickToAccept && 'hover:brightness-110',
            ghostClassName
          )}
          style={{ opacity: ghostOpacity }}
          title={clickToAccept ? 'Click to accept completion' : undefined}
        >
          {displayedCompletion}
          {hint && (
            <span
              className="inline-flex items-center ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono tracking-wider font-semibold border border-primary/30 bg-primary/10 text-primary align-middle uppercase select-none opacity-80"
              aria-hidden="true"
            >
              Tab
            </span>
          )}
        </span>
      )}

      {/* Blinking Caret */}
      {caret && (
        <span
          className={cn(
            'inline-block w-[3px] h-[0.85em] ml-1 rounded-sm bg-primary align-baseline transition-opacity duration-150',
            caretVisible ? 'opacity-100' : 'opacity-0',
            caretClassName
          )}
          aria-hidden="true"
        />
      )}
    </span>
  );
};

export default GhostType;
