// Shimmer animation base — used by all skeleton components
export const shimmer = "animate-pulse bg-gray-200";

// ── Feed Card Skeleton (matches UserCard shape) ─────────────────────────────
export const SkeletonUserCard = () => (
  <div className="flex flex-col pt-16 items-center">
    <div className="relative w-[340px] h-[500px] rounded-[32px] overflow-hidden border-4 border-[#0a0a0a] bg-white shadow-[8px_8px_0px_#0a0a0a]">
      {/* image area */}
      <div className={`w-full h-2/3 ${shimmer}`} />
      {/* bottom info strip */}
      <div className="absolute bottom-0 w-full h-1/3 bg-white border-t-4 border-[#0a0a0a] p-5 flex flex-col justify-center gap-3">
        <div className={`h-8 w-3/4 rounded-lg ${shimmer}`} />
        <div className={`h-5 w-full rounded-md ${shimmer}`} />
        <div className="flex gap-2 mt-2">
          {[60, 50, 70].map((w, i) => (
            <div key={i} className={`h-8 border-2 border-gray-300 rounded-full ${shimmer}`} style={{ width: w }} />
          ))}
        </div>
      </div>
    </div>
    {/* action buttons */}
    <div className="flex justify-center gap-6 mt-8">
      <div className={`w-16 h-16 rounded-full border-4 border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] ${shimmer}`} />
      <div className={`w-16 h-16 rounded-full border-4 border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] ${shimmer}`} />
    </div>
  </div>
);

// ── Connection Card Skeleton (matches ConnectionCard shape) ──────────────────
export const SkeletonConnectionCard = () => (
  <div className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border-2 border-transparent mb-2">
    <div className={`w-16 h-16 rounded-full border-2 border-gray-200 flex-shrink-0 ${shimmer}`} />
    <div className="flex-1 space-y-2 pb-2">
      <div className={`h-6 w-1/3 rounded-md ${shimmer}`} />
      <div className={`h-4 w-1/2 rounded-md ${shimmer}`} />
      <div className="flex gap-2 mt-2">
        <div className={`h-5 w-16 rounded-full ${shimmer}`} />
        <div className={`h-5 w-20 rounded-full ${shimmer}`} />
      </div>
    </div>
  </div>
);

// ── Request Card Skeleton ────────────────────────────────────────────────────
export const SkeletonRequestCard = () => (
  <div className="relative w-full aspect-[3/4] flex flex-col rounded-2xl overflow-hidden border-4 border-[#0a0a0a] bg-white shadow-[6px_6px_0px_#0a0a0a]">
    <div className={`flex-1 relative border-b-4 border-[#0a0a0a] ${shimmer}`} />
    <div className="bg-white p-4 flex flex-col justify-between shrink-0 h-1/3">
      <div className="space-y-2">
        <div className={`h-6 w-3/4 rounded-md ${shimmer}`} />
        <div className={`h-4 w-1/2 rounded-md ${shimmer}`} />
      </div>
      <div className="flex gap-3 justify-center relative z-20 mt-4">
        <div className={`w-10 h-10 border-2 border-gray-300 rounded-full ${shimmer}`} />
        <div className={`w-10 h-10 border-2 border-gray-300 rounded-full ${shimmer}`} />
      </div>
    </div>
  </div>
);
