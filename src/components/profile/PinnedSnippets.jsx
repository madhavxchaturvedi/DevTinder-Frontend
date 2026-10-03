import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import PostCard from "../PostCard";

const PinnedSnippets = ({ posts, isOwnProfile }) => {
  if (!posts || posts.length === 0) {
    if (!isOwnProfile) return null;

    return (
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-[#121212] border border-dashed border-white/10 rounded-2xl p-8 text-center"
      >
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center text-2xl">
          📌
        </div>
        <h3 className="text-base font-semibold text-[#e5e5e5] mb-1">
          Pin snippets from your posts
        </h3>
        <p className="text-xs text-[#a3a3a3] max-w-sm mx-auto mb-4">
          Showcase your best code snippets, algorithms, and components directly on your profile.
        </p>
        <Link
          to="/feed"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#ccff00] text-[#0a0a0a] rounded-lg text-xs font-bold hover:bg-[#bbf000] transition-colors"
        >
          Write your first post
        </Link>
      </Motion.div>
    );
  }

  // Determine if these are user-pinned or auto-curated (Best Of)
  const isPinned = posts.some((p) => p.isPinnedToProfile);
  const sectionTitle = isPinned ? "💻 Pinned Snippets" : "🔥 Best Work";
  const sectionSubtitle = isPinned
    ? null
    : "Top posts by community reactions";

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-[#e5e5e5]">
            {sectionTitle}
          </h3>
          {sectionSubtitle && (
            <p className="text-xs text-[#a3a3a3] mt-0.5">
              {sectionSubtitle}
            </p>
          )}
        </div>
        {isOwnProfile && (
          <span className="text-[10px] text-[#a3a3a3] bg-white/5 px-2 py-1 rounded-full">
            {isPinned
              ? `${posts.length}/3 pinned`
              : "Pin snippets from your posts"}
          </span>
        )}
      </div>

      {/* Snippet cards */}
      <div className="space-y-4">
        {posts.map((post, index) => {
          return (
            <Motion.div
              key={post._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
            >
              <PostCard post={post} />
            </Motion.div>
          );
        })}
      </div>
    </Motion.div>
  );
};

export default PinnedSnippets;
