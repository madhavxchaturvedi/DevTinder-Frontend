import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Users, 
  Clock, 
  Target, 
  Send, 
  Check, 
  Sparkles, 
  MoreHorizontal,
  FolderGit2
} from "lucide-react";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import toast from "react-hot-toast";
import { motion as Motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { timeAgo } from "../utils/timeAgo";

const ProjectCard = ({ post, userRequestStatus, requestCount }) => {
  const { _id, authorId, content, project, createdAt } = post;
  const loggedInUser = useSelector((store) => store.user);
  const onlineUsers = useSelector((store) => store.onlineUsers) || [];
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localStatus, setLocalStatus] = useState(userRequestStatus || (post?.hasRequested ? 'pending' : null));

  useEffect(() => {
    setLocalStatus(userRequestStatus || (post?.hasRequested ? 'pending' : null));
  }, [userRequestStatus, post?.hasRequested]);

  if (!authorId || !project) return null;

  const isMyPost = loggedInUser?._id === authorId._id;
  const isProjectOpen = project.isOpen !== false; 
  const isAuthorOnline = onlineUsers.includes(authorId._id);

  const getStageBadgeStyle = (stage) => {
    const s = stage?.toLowerCase()?.replace(/[^\w\s]/g, '').trim();
    switch (s) {
      case "idea": 
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "early build": 
      case "early-build":
        return "bg-[#ccff00]/10 text-[#ccff00] border-[#ccff00]/30";
      case "mid build": 
      case "mid-build":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "needs review": 
      case "needs-review":
        return "bg-[#b266ff]/10 text-[#b266ff] border-[#b266ff]/30";
      default: 
        return "bg-white/5 text-white/70 border-white/10";
    }
  };

  const handleRequestSubmit = async () => {
    try {
      setIsSubmitting(true);
      await axios.post(`${BASE_URL}/project/request/${_id}`, { message: requestMessage }, { withCredentials: true });
      toast.success("Request sent!");
      setLocalStatus("pending");
      setIsModalOpen(false);
      setRequestMessage("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className="glass-card glass-card-hover mb-3 transition-all duration-200 relative w-full min-w-0">
      <div className="p-4 md:p-5 flex flex-col w-full min-w-0">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <Link to={`/user/${authorId._id}`} className="flex items-center gap-2.5 group min-w-0">
            <div className="relative shrink-0">
              <img 
                src={authorId.photoUrl || "https://geographyandyou.com/images/user-profile.png"} 
                alt={authorId.firstName} 
                className="w-7 h-7 rounded-lg object-cover border border-white/[0.07] group-hover:border-[#ccff00]/60 transition-colors"
              />
              {isAuthorOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[#ccff00] rounded-full ring-2 ring-[#111113]" />
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="text-[14px] font-bold text-[#f0f0f0] group-hover:text-[#ccff00] transition-colors truncate">
                {authorId.firstName} {authorId.lastName}
              </span>
              <span className="text-[11px] font-mono text-[#52525b] shrink-0">
                posted a project - {timeAgo(createdAt)}
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-1 shrink-0">
            <button className="text-[#52525b] hover:text-[#f0f0f0] transition-colors p-1.5 rounded-lg">
              <MoreHorizontal size={15} />
            </button>
          </div>
        </div>

        {/* Project Title and Stage */}
        <div className="mb-2.5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <FolderGit2 size={16} className="text-[#b266ff] shrink-0" />
            <h2 className="text-[16px] font-bold text-[#f0f0f0] tracking-tight leading-snug truncate">
              {project.title}
            </h2>
          </div>
          <div className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 ${getStageBadgeStyle(project.stage)}`}>
            {(project.stage || "Project").replace(/[^\w\s-]/g, '').trim()}
          </div>
        </div>

        {/* Tech Stack */}
        {project.techStack && project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {project.techStack.map((tech, i) => (
              <span key={i} className="text-[11px] font-mono font-bold bg-white/5 text-white/70 px-2 py-0.5 rounded-md border border-white/[0.07]">
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {content && (
          <div className="mb-3.5 text-[13.5px] leading-relaxed text-[#d4d4d8] prose prose-invert max-w-none break-words prose-p:text-[#d4d4d8] prose-p:leading-relaxed prose-headings:text-[#f0f0f0] prose-a:text-[#ccff00]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        )}

        {/* Role & Commitment Callout */}
        <div className="bg-black/40 border border-white/[0.06] rounded-lg p-3 mb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-md bg-[#b266ff]/10 flex items-center justify-center text-[#b266ff] shrink-0">
              <Target size={15} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-mono text-[#52525b] uppercase tracking-wider">Looking For</p>
              <p className="text-[13px] text-[#f0f0f0] font-medium truncate">{project.roleNeeded}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#52525b] shrink-0 bg-white/[0.03] px-2.5 py-1 rounded-md border border-white/[0.06]">
            <Clock size={12} />
            <span>{project.commitment === "one-time" || project.commitment === "One-time" ? "One-time project" : "Ongoing commitment"}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#52525b]">
            <Users size={13} />
            <span>{requestCount || 0} devs interested</span>
          </div>

          <div>
            {isMyPost ? (
              <Link 
                to={`/project/${_id}/requests`}
                className="bg-transparent border border-white/10 text-[#a0a0a0] hover:border-white/20 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5"
              >
                View Requests
              </Link>
            ) : (
              <>
                {localStatus === "accepted" && (
                  <Link 
                    to="/chat"
                    className="bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30 hover:bg-[#ccff00]/25 px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                  >
                    Matched <Check size={12} />
                  </Link>
                )}
                {localStatus === "pending" && (
                  <button disabled className="bg-white/5 text-[#52525b] border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono cursor-not-allowed">
                    Pending...
                  </button>
                )}
                {!localStatus && isProjectOpen && (
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#ccff00] text-black hover:bg-[#d9ff33] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                  >
                    Request to Join <Sparkles size={12} />
                  </button>
                )}
                {!localStatus && !isProjectOpen && (
                  <button disabled className="bg-white/5 text-[#52525b] border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono cursor-not-allowed">
                    Team Full
                  </button>
                )}
              </>
            )}
          </div>
        </div>

      </div>

      {/* Request Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
            <Motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#111113] border border-white/[0.07] rounded-xl w-full max-w-md p-6 shadow-2xl relative"
            >
              <h3 className="text-base font-bold text-[#f0f0f0] mb-1">Request to Join</h3>
              <p className="text-xs text-[#52525b] mb-4">
                Let {authorId.firstName} know why you'd be a great fit for this project.
              </p>
              
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Why do you want to join? (optional)"
                className="w-full bg-[#09090b] border border-white/10 rounded-lg p-3 text-sm text-[#f0f0f0] placeholder:text-white/20 outline-none focus:border-[#ccff00] min-h-[100px] resize-none mb-4"
              />
              
              <div className="flex items-center justify-end gap-2">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-bold text-[#52525b] hover:text-[#f0f0f0] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRequestSubmit}
                  disabled={isSubmitting}
                  className="bg-[#ccff00] text-black hover:bg-[#d9ff33] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send Request"} <Send size={12} />
                </button>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </article>
  );
};

export default ProjectCard;
