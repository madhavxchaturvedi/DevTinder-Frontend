import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiMessageSquare, FiMoreHorizontal, FiTrash2, FiGitMerge } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { removePost, updatePost } from "../redux/postSlice";
import toast from "react-hot-toast";

// Markdown & Code
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import LiveSnippet from "./LiveSnippet";
import { FiZap, FiTerminal, FiStar, FiUsers } from "react-icons/fi";

// How long ago a date was
const timeAgo = (dateString) => {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (seconds < 60) return "just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const PostCard = ({ post, onFork, followedUsers = [] }) => {
  const { _id, authorId, type, content, codeSnippet, forkedFrom, stackTags, createdAt, reactions } = post;
  const loggedInUser = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const [isReacting, setIsReacting] = useState(false);

  // We need to fetch current user's reaction from the backend eventually, 
  // but for V1 we'll just handle optimistic UI counts.
  
  if (!authorId) return null;

  const isMyPost = loggedInUser?._id === authorId._id;

  const [localFollowState, setLocalFollowState] = useState(null);
  const isAlreadyFollowing = localFollowState !== null ? localFollowState : followedUsers.includes(authorId._id);
  
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollowToggle = async () => {
    try {
      setIsFollowing(true);
      if (isAlreadyFollowing) {
        await axios.post(`${BASE_URL}/user/unfollow/${authorId._id}`, {}, { withCredentials: true });
        setLocalFollowState(false);
        toast.success(`Unfollowed ${authorId.firstName}`);
      } else {
        await axios.post(`${BASE_URL}/user/follow/${authorId._id}`, {}, { withCredentials: true });
        setLocalFollowState(true);
        toast.success(`Followed ${authorId.firstName}!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update follow status");
    } finally {
      setIsFollowing(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/post/${_id}`, { withCredentials: true });
      dispatch(removePost(_id));
      toast.success("Post deleted");
    } catch (err) {
      toast.error("Failed to delete post");
      console.error(err);
    }
  };

  const userReaction = post.userReaction; // 'fire' | 'bug' | 'clever' | 'collab' | null

  const handleReact = async (reactionType) => {
    if (isReacting) return;
    
    // OPTIMISTIC UPDATE
    const originalPost = { ...post, reactions: { ...(post.reactions || { fire: 0, bug: 0, clever: 0, collab: 0 }) } };
    const optimisticPost = { ...originalPost, reactions: { ...originalPost.reactions } };
    
    const isRemoving = userReaction === reactionType;
    const isChanging = userReaction && userReaction !== reactionType;
    
    if (isRemoving) {
      optimisticPost.userReaction = null;
      optimisticPost.reactions[reactionType] = Math.max(0, optimisticPost.reactions[reactionType] - 1);
    } else if (isChanging) {
      optimisticPost.userReaction = reactionType;
      optimisticPost.reactions[userReaction] = Math.max(0, optimisticPost.reactions[userReaction] - 1);
      optimisticPost.reactions[reactionType] += 1;
    } else {
      optimisticPost.userReaction = reactionType;
      optimisticPost.reactions[reactionType] += 1;
    }
    
    dispatch(updatePost(optimisticPost));

    try {
      setIsReacting(true);
      const res = await axios.post(`${BASE_URL}/post/${_id}/react`, { type: reactionType }, { withCredentials: true });
      
      const serverPost = { ...originalPost, reactions: { ...originalPost.reactions } };
      
      if (res.data.message === "Reaction added") {
        serverPost.userReaction = reactionType;
        serverPost.reactions[reactionType] += 1;
      } else if (res.data.message === "Reaction removed") {
        serverPost.userReaction = null;
        serverPost.reactions[reactionType] = Math.max(0, serverPost.reactions[reactionType] - 1);
      } else if (res.data.message === "Reaction updated") {
        serverPost.userReaction = reactionType;
        serverPost.reactions[userReaction] = Math.max(0, serverPost.reactions[userReaction] - 1);
        serverPost.reactions[reactionType] += 1;
      }
      
      dispatch(updatePost(serverPost));
      
    } catch (err) {
      toast.error("Failed to react");
      dispatch(updatePost(originalPost)); // Rollback on failure
      console.error(err);
    } finally {
      setIsReacting(false);
    }
  };

  return (
    <div className={`relative rounded-2xl mb-6 transition-all duration-300 group/card ${
      type === 'debug_sos' 
        ? 'p-[1px] bg-[#ccff00]/50 hover:shadow-[0_0_20px_rgba(204,255,0,0.15)] border border-dashed border-[#ccff00]' 
        : 'p-0 bg-transparent'
    }`}>
      <div className={`bg-[#0a0a0a] rounded-2xl p-5 flex flex-col h-full transition-colors duration-300 ${
        type === 'debug_sos'
          ? 'border-transparent' // Border handled by wrapper
          : 'border border-white/5 hover:border-[#a855f7]/30 bg-[#121212]'
      }`}>
      
      {/* Fork Indicator */}
      {forkedFrom && (
        <div className="flex items-center gap-1.5 text-[11px] text-[#a3a3a3] font-medium mb-3 pl-1">
          <FiGitMerge /> 
          Forked from 
          <span className="text-white hover:text-[#ccff00] cursor-pointer">
            {forkedFrom.authorId?.firstName} {forkedFrom.authorId?.lastName}
          </span>
        </div>
      )}

      {/* Debug SOS Badge */}
      {type === 'debug_sos' && (
        <div className="flex items-center gap-2 mb-4 bg-[#ccff00]/10 border border-[#ccff00]/30 rounded px-3 py-1.5 w-fit">
          <FiTerminal className="text-[#ccff00] text-sm animate-pulse" />
          <span className="text-[10px] font-bold text-[#ccff00] tracking-widest uppercase font-mono">
            SYS_DEBUG_SOS
          </span>
          <div className="w-[1px] h-3 bg-[#ccff00]/30 mx-1" />
          <span className="text-[10px] text-[#ccff00]/70 font-mono">Bounty Request</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <Link to={`/user/${authorId._id}`} className="flex items-center gap-3 group">
          <img 
            src={authorId.photoUrl || "https://geographyandyou.com/images/user-profile.png"} 
            alt={authorId.firstName} 
            className="w-10 h-10 rounded-full object-cover border border-white/10 group-hover:border-[#ccff00] transition-colors"
          />
          <div className="flex flex-col">
            <span className="font-bold text-white group-hover:text-[#ccff00] transition-colors">
              {authorId.firstName} {authorId.lastName}
            </span>
            <span className="text-xs text-[#a3a3a3] flex items-center gap-1">
              {authorId.skills?.[0] || "Developer"} <span className="text-[10px]">•</span> {timeAgo(createdAt)}
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {/* Stack Tags */}
          <div className="hidden sm:flex items-center gap-1.5 mr-2">
            {stackTags?.map((tag, i) => (
              <span key={i} className="text-[10px] bg-[#a855f7]/10 text-[#d8b4fe] px-2 py-0.5 rounded-md border border-[#a855f7]/20 font-medium tracking-wide">
                #{tag}
              </span>
            ))}
          </div>

          {isMyPost && (
            <button 
              onClick={handleDelete}
              className="text-[#a3a3a3] hover:text-red-500 transition-colors p-2 hover:bg-white/5 rounded-full"
              title="Delete Post"
            >
              <FiTrash2 />
            </button>
          )}
          {!isMyPost && (
            <button 
              onClick={handleFollowToggle}
              disabled={isFollowing}
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded transition-colors disabled:opacity-50 ${
                isAlreadyFollowing 
                  ? "bg-white/10 text-white hover:bg-red-500/20 hover:text-red-500" 
                  : "bg-[#ccff00] text-[#0a0a0a] hover:bg-[#b3e600]"
              }`}
            >
              {isFollowing ? "..." : (isAlreadyFollowing ? "Following" : "Follow")}
            </button>
          )}
          <button className="text-[#a3a3a3] hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
            <FiMoreHorizontal />
          </button>
        </div>
      </div>

      {/* Content (Markdown) */}
      {content && (
        <div className="text-[#e5e5e5] text-sm leading-relaxed mb-4 prose prose-invert prose-pre:bg-[#0a0a0a] prose-pre:border-white/10 max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      )}

      {/* Code Snippet & Live Runner */}
      {type === "snippet" && codeSnippet && (
        <div className="mb-4 rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0a] flex flex-col">
          <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#a3a3a3] uppercase tracking-wider">{codeSnippet.language}</span>
            <button 
              onClick={() => onFork && onFork(post)}
              className="text-[11px] flex items-center gap-1.5 text-[#a855f7] hover:text-white hover:bg-[#a855f7] font-mono transition-all duration-300 bg-[#a855f7]/10 px-3 py-1.5 rounded-lg border border-[#a855f7]/20"
            >
              <FiGitMerge /> Fork Snippet
            </button>
          </div>
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            <SyntaxHighlighter 
              language={codeSnippet.language} 
              style={vscDarkPlus}
              customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
            >
              {codeSnippet.code}
            </SyntaxHighlighter>
          </div>
          {/* Live Executable Sandbox */}
          <div className="px-4 pb-4">
            <LiveSnippet code={codeSnippet.code} language={codeSnippet.language} />
          </div>
        </div>
      )}

      {/* Reactions & Actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-white/5 mt-auto flex-wrap">
        
        {/* Custom Reactions */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => handleReact('fire')} 
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full transition-colors group ${
              userReaction === 'fire' ? 'bg-[#ff5555]/20 text-[#ff5555]' : 'hover:bg-white/10 text-[#a3a3a3]'
            }`}
          >
            <FiZap className="text-lg group-active:scale-75 transition-transform" />
            <span className="text-xs font-semibold">{reactions?.fire || 0}</span>
          </button>
          
          <button 
            onClick={() => handleReact('bug')} 
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full transition-colors group ${
              userReaction === 'bug' ? 'bg-[#ffb86c]/20 text-[#ffb86c]' : 'hover:bg-white/10 text-[#a3a3a3]'
            }`}
          >
            <FiTerminal className="text-lg group-active:scale-75 transition-transform" />
            <span className="text-xs font-semibold">{reactions?.bug || 0}</span>
          </button>
          
          <button 
            onClick={() => handleReact('clever')} 
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full transition-colors group ${
              userReaction === 'clever' ? 'bg-[#8be9fd]/20 text-[#8be9fd]' : 'hover:bg-white/10 text-[#a3a3a3]'
            }`}
          >
            <FiStar className="text-lg group-active:scale-75 transition-transform" />
            <span className="text-xs font-semibold">{reactions?.clever || 0}</span>
          </button>
          
          <button 
            onClick={() => handleReact('collab')} 
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full transition-colors group ${
              userReaction === 'collab' ? 'bg-[#50fa7b]/20 text-[#50fa7b]' : 'hover:bg-white/10 text-[#a3a3a3]'
            }`}
          >
            <FiUsers className="text-lg group-active:scale-75 transition-transform" />
            <span className="text-xs font-semibold">{reactions?.collab || 0}</span>
          </button>
        </div>
        
        {/* Comments / Help */}
        <button 
          onClick={() => toast("Comments coming in Phase 3!", { icon: "🚧" })}
          className={`flex items-center gap-1.5 transition-all duration-300 group text-xs font-semibold ml-auto px-4 py-1.5 rounded-full border font-mono ${
            type === 'debug_sos'
              ? 'text-[#0a0a0a] bg-[#ccff00] border-transparent hover:bg-[#b3e600] hover:scale-105'
              : 'text-[#a3a3a3] hover:text-[#d8b4fe] bg-white/5 border-white/5 hover:border-[#a855f7]/30 hover:bg-[#a855f7]/10'
          }`}
        >
          <FiMessageSquare className="group-active:scale-90 transition-transform" />
          {type === 'debug_sos' ? "HELP_DEBUG" : "Comment"}
        </button>

      </div>
      </div>
    </div>
  );
};

export default PostCard;
