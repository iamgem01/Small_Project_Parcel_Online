import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  type: 'pixel' | 'glyph' | 'cross' | 'dot';
  glyph?: string;
  duration: number;
  delay: number;
  color: string;
}

const STAR_GLYPHS = ['✦', '✧', '★', '⋆', '·', '˚', '+'];
const STAR_COLORS = ['#38bdf8', '#60a5fa', '#93c5fd', '#facc15', '#fde047', '#ffffff', '#fed7aa'];

export const StarryBackground: React.FC = () => {
  // Generate a rich constellation of stars distributed across the screen
  const stars = useMemo<Star[]>(() => {
    const list: Star[] = [];
    // 80 background stars for a rich starry atmosphere
    for (let i = 0; i < 80; i++) {
      const typeRand = Math.random();
      let type: Star['type'] = 'dot';
      let glyph: string | undefined;

      if (typeRand > 0.65) {
        type = 'glyph';
        glyph = STAR_GLYPHS[Math.floor(Math.random() * STAR_GLYPHS.length)];
      } else if (typeRand > 0.4) {
        type = 'cross';
        glyph = '✦';
      } else if (typeRand > 0.2) {
        type = 'pixel';
      }

      list.push({
        id: i,
        x: Math.random() * 100, // percentage
        y: Math.random() * 100, // percentage
        size: type === 'glyph' ? Math.floor(Math.random() * 8) + 10 : Math.floor(Math.random() * 4) + 2,
        opacity: Math.random() * 0.55 + 0.35,
        type,
        glyph,
        duration: Math.random() * 3 + 2, // 2s - 5s
        delay: Math.random() * 3,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      });
    }
    return list;
  }, []);

  return (
    <div
      id="starry-background-layer"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
      aria-hidden="true"
    >
      {/* Soft atmospheric cosmic glow spots */}
      <div className="absolute -top-20 left-1/4 w-96 h-96 bg-sky-200/25 rounded-full blur-3xl" />
      <div className="absolute top-1/2 -right-20 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 left-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />

      {/* Twinkling and Floating Stars */}
      {stars.map((star) => {
        if (star.type === 'glyph' || star.type === 'cross') {
          return (
            <motion.div
              key={star.id}
              className="absolute font-pixel select-none drop-shadow-xs"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                fontSize: `${star.size}px`,
                color: star.color,
              }}
              animate={{
                opacity: [star.opacity * 0.4, star.opacity, star.opacity * 0.4],
                scale: [0.85, 1.2, 0.85],
                y: [0, -6, 0],
              }}
              transition={{
                duration: star.duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: star.delay,
              }}
            >
              {star.glyph}
            </motion.div>
          );
        }

        if (star.type === 'pixel') {
          return (
            <motion.div
              key={star.id}
              className="absolute select-none shadow-[1px_1px_0px_0px_rgba(0,0,0,0.15)]"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size + 1}px`,
                height: `${star.size + 1}px`,
                backgroundColor: star.color,
              }}
              animate={{
                opacity: [star.opacity * 0.3, star.opacity, star.opacity * 0.3],
                scale: [0.8, 1.25, 0.8],
              }}
              transition={{
                duration: star.duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: star.delay,
              }}
            />
          );
        }

        // Circular soft dot star
        return (
          <motion.div
            key={star.id}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: star.color,
              boxShadow: `0 0 ${star.size * 2}px ${star.color}`,
            }}
            animate={{
              opacity: [star.opacity * 0.3, star.opacity * 1.1, star.opacity * 0.3],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: star.delay,
            }}
          />
        );
      })}

      {/* Subtle Sky: Children of the Light Shooting Stars */}
      <motion.div
        className="absolute w-28 h-[2px] bg-gradient-to-r from-white via-sky-300 to-transparent transform -rotate-45"
        initial={{ top: '10%', left: '85%', opacity: 0, scale: 0.5 }}
        animate={{
          top: ['10%', '40%'],
          left: ['85%', '50%'],
          opacity: [0, 0.8, 0],
          scale: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          repeatDelay: 7,
          ease: 'easeOut',
        }}
      />

      <motion.div
        className="absolute w-36 h-[2px] bg-gradient-to-r from-white via-amber-200 to-transparent transform -rotate-35"
        initial={{ top: '35%', left: '95%', opacity: 0, scale: 0.5 }}
        animate={{
          top: ['35%', '65%'],
          left: ['95%', '60%'],
          opacity: [0, 0.9, 0],
          scale: [0.5, 1.2, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 11,
          ease: 'easeOut',
          delay: 4,
        }}
      />
    </div>
  );
};
