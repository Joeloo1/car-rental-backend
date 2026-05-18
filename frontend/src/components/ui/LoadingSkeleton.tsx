import React from "react";
import { clsx } from "clsx";

interface LoadingSkeletonProps {
  variant?:
    | "text"
    | "title"
    | "card"
    | "avatar"
    | "button"
    | "image"
    | "custom";
  width?: string;
  height?: string;
  count?: number;
  className?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = "text",
  width,
  height,
  count = 1,
  className = "",
}) => {
  const variants = {
    text: "h-4 w-full rounded",
    title: "h-8 w-3/4 rounded-lg",
    card: "h-64 w-full rounded-2xl",
    avatar: "h-12 w-12 rounded-full",
    button: "h-10 w-32 rounded-lg",
    image: "h-48 w-full rounded-xl",
    custom: "",
  };

  const skeletonClass = clsx(
    "skeleton bg-gradient-to-r from-dark-500 via-dark-400 to-dark-500 bg-[length:200%_100%]",
    variants[variant],
    className,
  );

  const style = {
    ...(width && { width }),
    ...(height && { height }),
  };

  if (count === 1) {
    return (
      <div className={skeletonClass} style={style} aria-label="Loading..." />
    );
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={skeletonClass}
          style={style}
          aria-label="Loading..."
        />
      ))}
    </div>
  );
};

// Preset skeleton layouts for common use cases
export const CarCardSkeleton: React.FC = () => (
  <div className="bg-dark-500 rounded-2xl overflow-hidden border border-white/10 animate-fade-in">
    <LoadingSkeleton variant="image" height="14rem" />
    <div className="p-5 space-y-4">
      <LoadingSkeleton variant="title" />
      <div className="grid grid-cols-3 gap-3">
        <LoadingSkeleton height="3rem" />
        <LoadingSkeleton height="3rem" />
        <LoadingSkeleton height="3rem" />
      </div>
      <LoadingSkeleton variant="text" />
      <div className="flex items-center justify-between pt-4">
        <LoadingSkeleton width="6rem" height="2rem" />
        <LoadingSkeleton variant="button" />
      </div>
    </div>
  </div>
);

export const CarDetailsSkeleton: React.FC = () => (
  <div className="container-custom py-12 space-y-8 animate-fade-in">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <LoadingSkeleton height="24rem" className="rounded-2xl" />
      <div className="space-y-6">
        <LoadingSkeleton variant="title" width="80%" />
        <LoadingSkeleton variant="text" count={3} />
        <div className="grid grid-cols-2 gap-4">
          <LoadingSkeleton height="4rem" />
          <LoadingSkeleton height="4rem" />
          <LoadingSkeleton height="4rem" />
          <LoadingSkeleton height="4rem" />
        </div>
        <LoadingSkeleton height="3rem" />
      </div>
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="container-custom py-12 space-y-8 animate-fade-in">
    <div className="flex items-center justify-between">
      <LoadingSkeleton variant="title" width="12rem" />
      <LoadingSkeleton variant="button" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <LoadingSkeleton height="8rem" className="rounded-xl" />
      <LoadingSkeleton height="8rem" className="rounded-xl" />
      <LoadingSkeleton height="8rem" className="rounded-xl" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <CarCardSkeleton />
      <CarCardSkeleton />
      <CarCardSkeleton />
    </div>
  </div>
);

export default LoadingSkeleton;
