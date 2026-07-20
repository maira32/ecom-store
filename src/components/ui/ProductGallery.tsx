'use client';

import { useState } from 'react';

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

export default function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div>
      <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 relative group">
        <img
          src={images[activeIndex]}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 mt-4">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors flex-shrink-0 ${
                activeIndex === idx ? 'border-slate-900' : 'border-transparent hover:border-slate-200'
              }`}
              aria-label={`View image ${idx + 1}`}
            >
              <img src={img} alt={`${alt} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}