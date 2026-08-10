// Shimmer animation base — used by all skeleton components
export const shimmer = "animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5";

// ── Feed Card Skeleton (matches UserCard shape) ─────────────────────────────
export const SkeletonUserCard = () => (
  <div className="flex flex-col pt-16 items-center">
    <div className="relative w-[340px] h-[500px] rounded-3xl overflow-hidden shadow-xl bg-white/5">
      {/* image area */}
      <div className={`w-full h-full ${shimmer}`} />
      {/* bottom gradient info strip */}
      <div className="absolute bottom-0 w-full h-[38%] bg-gradient-to-t from-black/80 to-transparent p-5 flex flex-col justify-end gap-3">
        <div className={`h-7 w-2/3 rounded-lg ${shimmer}`} />
        <div className={`h-4 w-full rounded-md ${shimmer}`} />
        <div className="flex gap-2 mt-1">
          {[60, 50, 70].map((w, i) => (
            <div key={i} className={`h-6 rounded-full ${shimmer}`} style={{ width: w }} />
          ))}
        </div>
      </div>
    </div>
    {/* action buttons */}
    <div className="flex justify-center gap-10 mt-6">
      <div className={`w-12 h-12 rounded-full ${shimmer}`} />
      <div className={`w-12 h-12 rounded-full ${shimmer}`} />
    </div>
  </div>
);

// ── Connection Card Skeleton (matches ConnectionCard shape) ──────────────────
export const SkeletonConnectionCard = () => (
  <div className="relative rounded-[40px]">
    <div className="relative w-[318px] h-[240px] bg-white/5 rounded-[40px] flex items-end pb-2 justify-center overflow-hidden">
      <div className={`absolute inset-0 ${shimmer}`} />
      <div className="relative w-[300px] h-[150px] bg-[#111] rounded-[40px] px-6 py-4 z-10">
        {/* avatar */}
        <div className={`absolute -top-7 left-4 w-16 h-16 rounded-full ${shimmer}`} />
        {/* name + tags */}
        <div className="ml-20 space-y-2 mt-1">
          <div className={`h-5 w-32 rounded-md ${shimmer}`} />
          <div className="flex gap-2">
            <div className={`h-4 w-16 rounded-full ${shimmer}`} />
            <div className={`h-4 w-14 rounded-full ${shimmer}`} />
          </div>
        </div>
        {/* bio */}
        <div className={`h-3 w-full rounded mt-3 ${shimmer}`} />
        {/* button */}
        <div className={`h-9 w-28 rounded-full mt-4 ${shimmer}`} />
      </div>
    </div>
  </div>
);

// ── Request Card Skeleton ────────────────────────────────────────────────────
export const SkeletonRequestCard = () => (
  <div className="w-full max-w-6xl mx-auto mb-6 flex items-center gap-4">
    <div className="flex-1 rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center gap-4">
      <div className={`w-20 h-20 rounded-full flex-shrink-0 ${shimmer}`} />
      <div className="flex-1 space-y-2">
        <div className={`h-5 w-40 rounded-md ${shimmer}`} />
        <div className={`h-4 w-full rounded-md ${shimmer}`} />
        <div className="flex gap-2">
          <div className={`h-5 w-16 rounded-full ${shimmer}`} />
          <div className={`h-5 w-16 rounded-full ${shimmer}`} />
        </div>
      </div>
    </div>
    <div className="flex flex-col gap-2">
      <div className={`h-9 w-24 rounded-full ${shimmer}`} />
      <div className={`h-9 w-24 rounded-full ${shimmer}`} />
    </div>
  </div>
);
