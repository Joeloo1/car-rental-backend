import React from 'react';

interface LoadingSkeletonProps {
  variant?: 'text' | 'title' | 'card' | 'avatar' | 'custom';
  width?: string;
  height?: string;
  count?: number;
  className?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'text',
  width,
  height,
  count = 1,
  className = '',
}) => {
  const getSkeletonClass = () => {
    switch (variant) {
      case 'text':
        return 'skeleton skeleton-text';
      case 'title':
        return 'skeleton skeleton-title';
      case 'card':
        return 'skeleton skeleton-card';
      case 'avatar':
        return 'skeleton skeleton-avatar';
      case 'custom':
        return 'skeleton';
      default:
        return 'skeleton';
    }
  };

  const style = {
    ...(width && { width }),
    ...(height && { height }),
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${getSkeletonClass()} ${className}`}
          style={style}
        />
      ))}
    </>
  );
};

export default LoadingSkeleton;
