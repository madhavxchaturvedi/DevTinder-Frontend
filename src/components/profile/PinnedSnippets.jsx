import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import PostCard from "../PostCard";
import { Pin, Code2, Flame, Plus } from "lucide-react";

const PinnedSnippets = ({ posts, isOwnProfile }) => {
  if (!posts || posts.length === 0) {
    if (!isOwnProfile) return null;

    return (
      <Motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="glass-card border border-dashed border-white/[0.12] rounded-xl p-8 text-center"
      >
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#ccff00]">
          <Pin className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#f0f0f0] mb-1 tracking-tight">
          Pin snippets from your posts
        </h3>
        <p className="text-xs text-[#52525b] max-w-sm mx-auto mb-4 leading-relaxed">
          Showcase your best code snippets, algorithms, and components directly on your profile.
        </p>
        <Link
          to="/feed"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#ccff00] text-black rounded-lg text-xs font-bold font-mono uppercase tracking-wider hover:bg-[#d9ff33] transition-all shadow-[0_0_15px_rgba(204,255,0,0.2)] cursor-pointer"
        >
          <Plus size={14} />
          Write your first post
        </Link>
      </Motion.div>
    );
  }

  // Determine if these are user-pinned or auto-curated (Best Of)
  const isPinned = posts.some((p) => p.isPinnedToProfile);
  const sectionTitle = isPinned ? "Pinned Snippets" : "Best Work";
  const sectionSubtitle = isPinned
    ? null
    : "Top posts by community reactions";

  return (
    <Motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isPinned ? (
            <Code2 className="w-5 h-5 text-[#ccff00]" />
          ) : (
            <Flame className="w-5 h-5 text-[#ccff00]" />
          )}
          <div>
            <h3 className="text-lg font-bold text-[#f0f0f0] tracking-tight">
              {sectionTitle}
            </h3>
            {sectionSubtitle && (
              <p className="text-xs text-[#52525b] mt-0.5">
                {sectionSubtitle}
              </p>
            )}
          </div>
        </div>
        {isOwnProfile && (
          <span className="text-[11px] font-mono text-[#52525b] bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
            {isPinned
              ? `${posts.length}/3 pinned`
              : "Pin snippets from your posts"}
          </span>
        )}
      </div>

      {/* Snippet cards */}
      <div className="space-y-4">
        {posts.map((post, index) => (
          <Motion.div
            key={post._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * index, duration: 0.3 }}
          >
            <PostCard post={post} />
          </Motion.div>
        ))}
      </div>
    </Motion.div>
  );
};

export default PinnedSnippets;
