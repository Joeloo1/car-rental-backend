import React from "react";
import { cn } from "../../utils/cn";

interface LoadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "text"
    | "title"
    | "card"
    | "avatar"
    | "button"
    | "image"
    | "custom";
  count?: number;
  width?: string;
  height?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = "text",
  count = 1,
  className = "",
  width,
  height,
  style,
  ...props
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

  const skeletonClass = cn(
    "animate-pulse bg-muted rounded-md",
    variants[variant],
    className
  );

  const inlineStyle = { ...(width ? { width } : {}), ...(height ? { height } : {}), ...style };

  if (count === 1) {
    return (
      <div className={skeletonClass} aria-label="Loading..." style={inlineStyle} {...props} />
    );
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={skeletonClass}
          aria-label="Loading..."
          style={inlineStyle}
          {...props}
        />
      ))}
    </div>
  );
};

// Preset skeleton layouts for common use cases
export const CarCardSkeleton: React.FC = () => (
  <div className="bg-card rounded-2xl overflow-hidden border border-border animate-fade-in shadow-sm">
    <LoadingSkeleton variant="image" className="h-[240px]" />
    <div className="p-5 space-y-4">
      <div className="flex justify-between items-start">
        <LoadingSkeleton variant="title" className="h-6 w-2/3" />
        <LoadingSkeleton width="40px" height="20px" className="rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <LoadingSkeleton className="h-8 rounded-lg" />
        <LoadingSkeleton className="h-8 rounded-lg" />
        <LoadingSkeleton className="h-8 rounded-lg" />
      </div>
      <div className="flex items-center gap-2 pt-2">
        <LoadingSkeleton variant="avatar" className="h-4 w-4" />
        <LoadingSkeleton className="h-3 w-1/3" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <LoadingSkeleton className="h-8 w-24" />
        <LoadingSkeleton className="h-10 w-28 rounded-xl" />
      </div>
    </div>
  </div>
);

export const CarDetailsSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fade-in">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <LoadingSkeleton className="h-[400px] lg:h-[500px] rounded-3xl" />
      <div className="space-y-8">
        <div className="space-y-4">
          <LoadingSkeleton variant="title" className="h-12 w-3/4" />
          <div className="flex gap-4">
            <LoadingSkeleton className="h-6 w-24 rounded-full" />
            <LoadingSkeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
        <div className="space-y-4">
          <LoadingSkeleton className="h-4 w-full" count={4} />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <LoadingSkeleton className="h-20 rounded-2xl" />
          <LoadingSkeleton className="h-20 rounded-2xl" />
          <LoadingSkeleton className="h-20 rounded-2xl" />
          <LoadingSkeleton className="h-20 rounded-2xl" />
        </div>
        <LoadingSkeleton className="h-14 w-full rounded-2xl" />
      </div>
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fade-in">
    <div className="flex items-center justify-between">
      <LoadingSkeleton className="h-10 w-48" />
      <LoadingSkeleton className="h-11 w-36" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <LoadingSkeleton className="h-32 rounded-2xl" />
      <LoadingSkeleton className="h-32 rounded-2xl" />
      <LoadingSkeleton className="h-32 rounded-2xl" />
      <LoadingSkeleton className="h-32 rounded-2xl" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <CarCardSkeleton />
      <CarCardSkeleton />
      <CarCardSkeleton />
    </div>
  </div>
);

export default LoadingSkeleton;
