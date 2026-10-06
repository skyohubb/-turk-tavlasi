'use client';

import React, { useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  fallbackIcon?: string;
  fallbackText?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = '',
  className = '',
  fallbackSrc = '/images/avatar_genc_cirak.jpg',
  fallbackIcon = '🎲',
  fallbackText,
  ...props
}) => {
  const [hasError, setHasError] = useState<boolean>(false);
  const [fallbackFailed, setFallbackFailed] = useState<boolean>(false);

  if (fallbackFailed || (!src && !fallbackSrc)) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#3b2012] via-[#24130a] to-[#120703] border border-amber-500/20 text-amber-200 select-none ${className}`}
      >
        <span className="text-lg drop-shadow">{fallbackIcon}</span>
        {fallbackText && (
          <span className="text-[9px] font-serif-tavla font-bold uppercase tracking-wider text-amber-300/80 mt-0.5 line-clamp-1">
            {fallbackText}
          </span>
        )}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={hasError ? fallbackSrc : src || fallbackSrc}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => {
        if (!hasError) {
          setHasError(true);
        } else {
          setFallbackFailed(true);
        }
      }}
      {...props}
    />
  );
};
