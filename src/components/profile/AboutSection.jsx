import React, { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

const AboutSection = ({ about, skills, isOwnProfile }) => {
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const hasContent = Boolean(about || (skills && skills.length > 0));

  if (!hasContent) {
    if (isOwnProfile) {
      return (
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#121212] p-6 rounded-3xl border border-white/10 mt-6 text-center"
        >
          <h2 className="text-xs text-[#a3a3a3] uppercase tracking-widest font-bold mb-2">ABOUT & SKILLS</h2>
          <p className="text-[#a3a3a3] text-sm mb-4">
            Tell the community about yourself. Add your bio and skills.
          </p>
          <Link
            to="/profile"
            className="inline-flex items-center px-4 py-2 bg-[#ccff00] hover:bg-[#b8e600] text-[#0a0a0a] rounded-xl text-sm font-bold transition shadow-md"
          >
            Edit Profile
          </Link>
        </Motion.div>
      );
    }
    return null;
  }

  const bioNeedsTruncation = Boolean(about && about.length > 200);
  const displayBio = bioNeedsTruncation && !isBioExpanded ? `${about.slice(0, 200)}...` : about;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#121212] p-6 rounded-3xl border border-white/10 mt-6"
    >
      {about && (
        <div className="mb-6">
          <h2 className="text-xs text-[#a3a3a3] uppercase tracking-widest font-bold mb-4">ABOUT</h2>
          <div className="text-[#e5e5e5] prose prose-invert max-w-none text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
              {displayBio}
            </ReactMarkdown>
          </div>
          {bioNeedsTruncation && (
            <button
              type="button"
              onClick={() => setIsBioExpanded(!isBioExpanded)}
              className="mt-2 text-xs font-semibold text-[#ccff00] hover:underline cursor-pointer"
            >
              {isBioExpanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      )}

      {skills && skills.length > 0 && (
        <div>
          <h2 className="text-xs text-[#a3a3a3] uppercase tracking-widest font-bold mb-4">SKILLS</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span 
                key={index}
                className="text-xs px-3 py-1 rounded-full font-medium bg-white/5 border border-white/10 text-white/90 hover:border-white/20 transition-colors"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </Motion.div>
  );
};

export default AboutSection;
