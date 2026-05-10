import React from 'react';

function Pulse({ className = '' }) {
  return (
    <div className={`bg-[#E2E8F0] rounded animate-pulse ${className}`} />
  );
}

function SkeletonCard() {
  return (
    <div className="flex gap-4 py-5 border-b border-[#E2E8F0] last:border-0">
      {/* Avatar */}
      <Pulse className="w-12 h-12 rounded-xl flex-shrink-0" />

      <div className="flex-1 min-w-0 space-y-2.5">
        {/* Company row */}
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <Pulse className="h-4 w-44" />
            <Pulse className="h-3 w-28" />
          </div>
          <Pulse className="w-7 h-7 rounded-lg" />
        </div>
        {/* Designation */}
        <Pulse className="h-3.5 w-52 mt-1" />
        {/* Date */}
        <Pulse className="h-3 w-40" />
        {/* Description lines */}
        <div className="space-y-1.5 pt-1">
          <Pulse className="h-3 w-full" />
          <Pulse className="h-3 w-[90%]" />
          <Pulse className="h-3 w-[75%]" />
        </div>
      </div>
    </div>
  );
}

export default function SkeletonLoader({ count = 2 }) {
  return (
    <div className="px-5 pb-1">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
