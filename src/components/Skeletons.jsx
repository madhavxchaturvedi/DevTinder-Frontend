import React from "react";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";

// Shimmer compatibility alias
export const shimmer = "animate-pulse bg-muted";

// -- Feed Card Skeleton (matches UserCard / BaseUserCard shape) ----------------
export const SkeletonUserCard = ({ className }) => (
  <div className={cn("w-full max-w-[360px] mx-auto flex flex-col items-start p-6 rounded-2xl bg-card border border-border shadow-md", className)}>
    {/* Compatibility indicator */}
    <div className="flex justify-end w-full mb-3">
      <Skeleton className="h-6 w-12 rounded-md" />
    </div>

    {/* Profile header row: avatar + name/headline */}
    <div className="flex items-center gap-4 w-full mb-5">
      <Skeleton className="w-14 h-14 rounded-full flex-shrink-0" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-5 w-3/4 rounded-md" />
        <Skeleton className="h-4 w-1/2 rounded-md" />
      </div>
    </div>

    {/* Skills row */}
    <div className="flex flex-wrap gap-2 w-full mb-6">
      <Skeleton className="h-6 w-16 rounded-md" />
      <Skeleton className="h-6 w-20 rounded-md" />
      <Skeleton className="h-6 w-14 rounded-md" />
      <Skeleton className="h-6 w-12 rounded-md" />
    </div>

    {/* Activity signals */}
    <div className="w-full space-y-2.5 mb-6">
      <Skeleton className="h-4 w-2/3 rounded-md" />
      <Skeleton className="h-4 w-1/2 rounded-md" />
    </div>

    {/* Featured post block */}
    <div className="w-full p-4 rounded-xl border border-border/50 bg-muted/20 space-y-2 mb-6">
      <Skeleton className="h-3 w-1/3 rounded-md" />
      <Skeleton className="h-4 w-full rounded-md" />
      <Skeleton className="h-4 w-4/5 rounded-md" />
    </div>

    {/* Action buttons */}
    <div className="flex justify-center items-center gap-10 w-full mt-auto pt-2">
      <Skeleton className="w-14 h-14 rounded-full" />
      <Skeleton className="w-14 h-14 rounded-full" />
    </div>
  </div>
);

// -- Connection Card Skeleton (matches ConnectionCard / horizontal BaseUserCard) --
export const SkeletonConnectionCard = ({ className }) => (
  <div className={cn("w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border mb-3", className)}>
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
      <div className="space-y-2 flex-1 max-w-[200px]">
        <Skeleton className="h-4 w-3/4 rounded-md" />
        <Skeleton className="h-3 w-1/2 rounded-md" />
        <div className="flex gap-1.5 pt-1">
          <Skeleton className="h-4 w-12 rounded-md" />
          <Skeleton className="h-4 w-14 rounded-md" />
        </div>
      </div>
    </div>
    <Skeleton className="h-8 w-20 rounded-md flex-shrink-0 ml-3" />
  </div>
);

// -- Request Card Skeleton ----------------------------------------------------
export const SkeletonRequestCard = ({ className }) => (
  <div className={cn("w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border mb-3", className)}>
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
      <div className="space-y-2 flex-1 max-w-[220px]">
        <Skeleton className="h-4 w-2/3 rounded-md" />
        <Skeleton className="h-3 w-4/5 rounded-md" />
      </div>
    </div>
    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
      <Skeleton className="w-9 h-9 rounded-full" />
      <Skeleton className="w-9 h-9 rounded-full" />
    </div>
  </div>
);

// -- Profile Page Skeleton (matches UserProfilePage layout, left-aligned) ------
export const SkeletonProfile = ({ className }) => (
  <div className={cn("w-full max-w-4xl mx-auto space-y-6 p-4", className)}>
    {/* Cover image skeleton */}
    <Skeleton className="w-full h-48 md:h-64 rounded-2xl" />

    {/* Profile header */}
    <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16 px-6">
      <Skeleton className="w-28 h-28 rounded-full border-4 border-background flex-shrink-0" />
      <div className="space-y-2 flex-1 w-full">
        <Skeleton className="h-8 w-48 rounded-md" />
        <Skeleton className="h-4 w-64 rounded-md" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-28 rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </div>

    {/* Bio & Details */}
    <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
      <Skeleton className="h-5 w-32 rounded-md" />
      <Skeleton className="h-4 w-full rounded-md" />
      <Skeleton className="h-4 w-5/6 rounded-md" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-20 rounded-md" />
        <Skeleton className="h-6 w-24 rounded-md" />
        <Skeleton className="h-6 w-16 rounded-md" />
      </div>
    </div>
  </div>
);
