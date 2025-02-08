"use client"

import { AnimatePresence, motion, MotionProps } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@repo/ui/lib/utils";

interface RotatingWordProps {
  words: string[];
  duration?: number;
  motionProps?: MotionProps;
  className?: string;
}

export function RotatingWord({
  words,
  duration = 4000,
  motionProps = {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
    transition: { duration: 0.25, ease: "easeOut" },
  },
  className,
}: RotatingWordProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);

    return () => clearInterval(interval);
  }, [words, duration]);

  return (
    <div className="overflow-hidden mr-4">
      <AnimatePresence mode="wait">
        <motion.p
          key={words[index]}
          className={cn(className)}
          {...motionProps}
        >
          {words[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
