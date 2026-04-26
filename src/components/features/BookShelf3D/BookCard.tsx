'use client';

import React from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';
import { Book } from './mockData';

interface BookCardProps {
  book: Book;
  index: number;
  scrollX: MotionValue<number>;
  onClick: (book: Book) => void;
  xStride: number;
  zStride: number;
}

export function BookCard({ book, index, scrollX, onClick, xStride, zStride }: BookCardProps) {
  // Static local coordinate for the 3D receding array
  const localX = index * xStride;
  const localZ = index * -zStride; // Pushed back depending on index

  // Calculate absolute X position relative to the center focal point.
  // When scrollX == -localX, the book is at the focal point.
  const absX = useTransform(scrollX, (x) => x + localX);

  // Fade out smoothly if it moves too far left (past the camera)
  // Or if it goes way too far right, though right side is naturally far due to Z-depth
  const opacity = useTransform(absX, [-300, -100, 0, 2000, 3000], [0, 1, 1, 1, 0]);

  // Give a slightly dynamic rotation so books past the camera flatten out slightly?
  // Let's keep it mostly constant to match the video, but tweak extreme left so it doesn't clip badly
  const rotateY = useTransform(absX, [-500, 0, 2000], [-15, -45, -45]);

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 cursor-pointer"
      style={{
        // Initially place them according to local coordinates
        x: `calc(-50% + ${localX}px)`,
        y: '-50%',
        z: localZ,
        rotateY,
        opacity,
        transformOrigin: 'left center', // Rotate around spine
      }}
      onClick={() => onClick(book)}
      whileHover={{ y: -20, rotateZ: -2 }} // gentle hover interaction
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <motion.div
        layoutId={`book-cover-${book.id}`}
        className="relative shadow-2xl rounded-sm overflow-hidden"
        style={{
          width: 280,
          height: 400,
          boxShadow: '15px 25px 50px rgba(0,0,0,0.5), inset -2px -2px 10px rgba(255,255,255,0.1)',
        }}
      >
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-full object-cover rounded-sm pointer-events-none"
        />
        {/* Shiny glass overlay for realism */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/20 pointer-events-none mix-blend-overlay" />
        
        {/* Book spine simulation (gives the illusion of thickness on the left edge since rotateY is negative) */}
        <div className="absolute left-0 top-0 bottom-0 w-[12px] bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white/30 pointer-events-none shadow-[2px_0_4px_rgba(0,0,0,0.5)]" />
      </motion.div>
    </motion.div>
  );
}
