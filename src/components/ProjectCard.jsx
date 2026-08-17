import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiMoreHorizontal, FiTrash2, FiClock, FiUsers, FiMessageSquare, FiSend, FiCheck, FiZap, FiTarget } from "react-icons/fi";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const timeAgo = (dateString) => {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (seconds < 60) return "just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const ProjectCard = ({ post, userRequestStatus, requestCount }) => {
  const { _id, authorId, content, project, stackTags, createdAt } = post;
  const loggedInUser = useSelector((store) => store.user);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localStatus, setLocalStatus] = useState(userRequestStatus);

  if (!authorId || !project) return null;

  const isMyPost = loggedInUser?._id === authorId._id;
  const isProjectOpen = project.isOpen !== false; 
  const onlineUsers = useSelector((store) => store.onlineUsers) || [];
  const isAuthorOnline = onlineUsers.includes(authorId._id);

  const getStageColor = (stage) => {
    switch (stage?.toLowerCase()) {
      case "💡 idea": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "🔨 early build": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "🏗️ mid build": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "🔍 needs review": return "bg-green-500/10 text-green-400 border-green-500/20";
      default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
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
    <div className="neo-card mb-6 w-full min-w-0 transition-all duration-300 group/card relative bg-[#151515] border border-[#262626] rounded-2xl overflow-hidden shadow-xl hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
      <div className="flex flex-col h-full p-5 md:p-6 w-full min-w-0">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <Link to={`/user/${authorId._id}`} className="flex items-center gap-3 group">
            <div className="relative">
              <img 
                src={authorId.photoUrl || "https://geographyandyou.com/images/user-profile.png"} 
                alt={authorId.firstName} 
                className="w-10 h-10 rounded-full object-cover border border-white/10 group-hover:border-[#ccff00] transition-colors"
              />
              {isAuthorOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#151515]"></div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white group-hover:text-[#ccff00] transition-colors text-[15px] flex items-center gap-1.5">
                {authorId.firstName} {authorId.lastName}
                {isAuthorOnline && <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Online</span>}
              </span>
              <span className="text-xs text-[#a3a3a3] flex items-center gap-1">
                posted a project <span className="text-[10px]">•</span> {timeAgo(createdAt)}
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <button className="text-[#a3a3a3] hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
              <FiMoreHorizontal />
            </button>
          </div>
        </div>

        {/* Project Title and Stage */}
        <div className="mb-3 flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold text-[#e5e5e5] leading-tight">
            {project.title}
          </h2>
          <div className={`px-2.5 py-1 rounded-full border text-[11px] font-bold whitespace-nowrap ${getStageColor(project.stage)}`}>
            {project.stage || "Project"}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.techStack?.map((tech, i) => (
            <span key={i} className="text-[11px] font-mono bg-[#1a1a1a] text-[#e5e5e5] px-2.5 py-1 rounded-md border border-white/5 hover:border-white/20 transition-colors">
              {tech}
            </span>
          ))}
        </div>

        {/* Description */}
        <div className="mb-5 text-[#a3a3a3] text-[14px] leading-relaxed prose prose-invert max-w-none break-words">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>

        {/* Role & Commitment Callout */}
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#a855f7]/10 flex items-center justify-center text-[#a855f7] shrink-0">
              <FiTarget size={18} />
            </div>
            <div>
              <p className="text-[11px] text-[#737373] font-bold uppercase tracking-wider mb-0.5">Looking For</p>
              <p className="text-[14px] text-[#e5e5e5] font-medium">{project.roleNeeded}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#a3a3a3] text-[12px] bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            <FiClock />
            <span>{project.commitment === "One-time" ? "One-time project" : "Ongoing commitment"}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-[#262626] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#737373] text-[13px] font-medium">
            <FiUsers />
            <span>{requestCount || 0} devs interested</span>
          </div>

          <div>
            {isMyPost ? (
              <Link 
                to={`/project/${_id}/requests`}
                className="bg-white/10 text-white hover:bg-white/20 px-4 py-2 rounded-xl font-bold text-[13px] transition-all flex items-center gap-2"
              >
                View Requests
              </Link>
            ) : (
              <>
                {localStatus === "accepted" && (
                  <Link 
                    to="/chat"
                    className="bg-green-500/20 text-green-400 border border-green-500/30 px-4 py-2 rounded-xl font-bold text-[13px] flex items-center gap-2"
                  >
                    Matched <FiCheck />
                  </Link>
                )}
                {localStatus === "pending" && (
                  <button disabled className="bg-white/5 text-[#737373] border border-white/10 px-4 py-2 rounded-xl font-bold text-[13px] flex items-center gap-2 cursor-not-allowed">
                    Pending...
                  </button>
                )}
                {!localStatus && isProjectOpen && (
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#ccff00] text-black hover:bg-[#b3e600] px-4 py-2 rounded-xl font-bold text-[13px] transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(204,255,0,0.2)]"
                  >
                    Request to Join <FiZap />
                  </button>
                )}
                {!localStatus && !isProjectOpen && (
                  <button disabled className="bg-white/5 text-[#737373] border border-white/10 px-4 py-2 rounded-xl font-bold text-[13px] cursor-not-allowed">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#151515] border border-[#262626] rounded-2xl w-full max-w-md p-6 shadow-2xl relative"
            >
              <h3 className="text-lg font-bold text-white mb-2">Request to Join</h3>
              <p className="text-sm text-[#a3a3a3] mb-4">
                Let {authorId.firstName} know why you'd be a great fit for this project.
              </p>
              
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Why do you want to join? (optional)"
                className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl p-3 text-sm text-[#e5e5e5] placeholder:text-[#555] outline-none focus:border-[#ccff00]/50 min-h-[100px] resize-none mb-4"
              />
              
              <div className="flex items-center justify-end gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-[#a3a3a3] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRequestSubmit}
                  disabled={isSubmitting}
                  className="bg-[#ccff00] text-black hover:bg-[#b3e600] px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send Request"} <FiSend size={14} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectCard;
