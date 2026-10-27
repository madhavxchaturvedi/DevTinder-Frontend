import { useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

const AboutSection = ({ about, skills, isOwnProfile }) => {
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const hasContent = Boolean(about || (skills && skills.length > 0));

  if (!hasContent) {
    if (isOwnProfile) {
      return (
        <div className="glass-card p-6 rounded-xl border border-white/[0.07] text-center">
          <h2 className="text-[10px] font-mono text-[#52525b] uppercase tracking-widest font-bold mb-2">
            ABOUT &amp; SKILLS
          </h2>
          <p className="text-xs text-[#52525b] mb-4">
            Tell the community about yourself. Add your bio and skills.
          </p>
          <Link
            to="/profile"
            className="inline-flex items-center px-4 py-2 bg-[#ccff00] hover:bg-[#d9ff33] text-black rounded-lg text-xs font-bold transition-all shadow-[0_0_15px_rgba(204,255,0,0.2)]"
          >
            Edit Profile
          </Link>
        </div>
      );
    }
    return null;
  }

  const bioNeedsTruncation = Boolean(about && about.length > 200);
  const displayBio =
    bioNeedsTruncation && !isBioExpanded ? `${about.slice(0, 200)}...` : about;

  return (
    <div className="glass-card p-6 rounded-xl border border-white/[0.07]">
      {about && (
        <div className="mb-6">
          <h2 className="text-[10px] font-mono text-[#52525b] uppercase tracking-widest font-bold mb-3">
            ABOUT
          </h2>
          <div className="text-[#d4d4d8] text-sm leading-relaxed prose prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
            >
              {displayBio}
            </ReactMarkdown>
          </div>
          {bioNeedsTruncation && (
            <button
              type="button"
              onClick={() => setIsBioExpanded(!isBioExpanded)}
              className="mt-2 text-xs font-mono font-medium text-[#ccff00] hover:underline cursor-pointer"
            >
              {isBioExpanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      )}

      {skills && skills.length > 0 && (
        <div>
          <h2 className="text-[10px] font-mono text-[#52525b] uppercase tracking-widest font-bold mb-3">
            SKILLS
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="rounded-md px-2.5 py-1 text-[11px] font-mono font-bold bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutSection;
