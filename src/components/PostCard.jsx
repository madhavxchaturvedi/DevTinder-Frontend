import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiMessageSquare, FiMoreHorizontal, FiTrash2, FiGitMerge, FiStar, FiZap, FiTerminal, FiCheckCircle, FiUsers, FiFileText, FiDownloadCloud, FiCopy } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { removePost, updatePost } from "../redux/postSlice";
import toast from "react-hot-toast";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import LiveSnippet from "./LiveSnippet";
import CommentsSection from "./CommentsSection";


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
  
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (codeSnippet?.code) {
      navigator.clipboard.writeText(codeSnippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

  const renderImages = () => {
    if (!post.images || post.images.length === 0) return null;
    
    const count = post.images.length;
    
    if (count === 1) {
      return (
        <div className="rounded-xl overflow-hidden bg-[#111] max-h-[500px]">
          <img src={post.images[0]} alt="Attachment 1" className="w-full h-full object-contain cursor-pointer hover:opacity-90 transition" onClick={() => window.open(post.images[0], '_blank')} />
        </div>
      );
    }
    
    if (count === 2) {
      return (
        <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden bg-[#111] h-[300px]">
          {post.images.map((img, i) => (
            <img key={i} src={img} alt={`Attachment ${i+1}`} className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition" onClick={() => window.open(img, '_blank')} />
          ))}
        </div>
      );
    }
    
    if (count === 3) {
      return (
        <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden bg-[#111] h-[350px]">
          <div className="h-full">
             <img src={post.images[0]} alt="Attachment 1" className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition" onClick={() => window.open(post.images[0], '_blank')} />
          </div>
          <div className="grid grid-rows-2 gap-1 h-full">
             <img src={post.images[1]} alt="Attachment 2" className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition" onClick={() => window.open(post.images[1], '_blank')} />
             <img src={post.images[2]} alt="Attachment 3" className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition" onClick={() => window.open(post.images[2], '_blank')} />
          </div>
        </div>
      );
    }
    
    if (count === 4) {
      return (
        <div className="grid grid-cols-2 grid-rows-2 gap-1 rounded-xl overflow-hidden bg-[#111] h-[350px]">
          {post.images.map((img, i) => (
            <img key={i} src={img} alt={`Attachment ${i+1}`} className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition" onClick={() => window.open(img, '_blank')} />
          ))}
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className={`neo-card mb-6 w-full min-w-0 transition-all duration-300 group/card relative ${
      type === 'debug_sos' && post.isResolved
        ? 'border-[#ccff00]/30 shadow-[0_0_20px_rgba(204,255,0,0.05)]' 
        : type === 'debug_sos'
        ? 'border-[#ffb86c]/30 shadow-[0_0_20px_rgba(255,184,108,0.05)]'
        : ''
    }`}>
      <div className="flex flex-col h-full p-5 md:p-6 w-full min-w-0">
      
      {/* Fork Indicator */}
      {forkedFrom && (
        <div className="flex items-center gap-1.5 text-[11px] text-[#a3a3a3] font-medium mb-3 pl-1">
          <FiGitMerge /> 
          Forked from 
          <Link to={`/user/${forkedFrom.authorId?._id}`} className="text-white hover:text-[#ccff00] transition-colors">
            {forkedFrom.authorId?.firstName} {forkedFrom.authorId?.lastName}
          </Link>
        </div>
      )}

      {/* Debug SOS Badge */}
      {type === 'debug_sos' && (
        <div className={`flex items-center gap-2 mb-4 rounded px-3 py-1.5 w-fit border ${
          post.isResolved 
            ? 'bg-[#ccff00]/10 border-[#ccff00]/50'
            : 'bg-[#ffb86c]/10 border-[#ffb86c]/30'
        }`}>
          {post.isResolved ? (
            <FiCheckCircle className="text-[#ccff00] text-sm" />
          ) : (
            <FiTerminal className="text-[#ffb86c] text-sm animate-pulse" />
          )}
          <span className={`text-[10px] font-bold tracking-widest uppercase font-mono ${
            post.isResolved ? 'text-[#ccff00]' : 'text-[#ffb86c]'
          }`}>
            {post.isResolved ? 'RESOLVED_SOS' : 'SYS_DEBUG_SOS'}
          </span>
          <div className={`w-[1px] h-3 mx-1 ${post.isResolved ? 'bg-[#ccff00]/30' : 'bg-[#ffb86c]/30'}`} />
          <span className={`text-[10px] font-mono ${post.isResolved ? 'text-[#ccff00]/70' : 'text-[#ffb86c]/70'}`}>
            {post.isResolved ? 'Answer Found' : 'Bounty Request'}
          </span>
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
        <div className="mb-4">
          <div className={`text-[#e5e5e5] text-sm leading-relaxed prose prose-invert prose-pre:bg-[#0a0a0a] prose-pre:border-white/10 max-w-none break-words ${!isExpanded && content.length > 300 ? 'line-clamp-4' : ''}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
          {content.length > 300 && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[#ccff00] text-xs font-semibold hover:underline mt-2 inline-flex items-center gap-1"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {/* Media and Snippets Container */}
      <div className="flex flex-col gap-4 mb-4">
        {/* Media Rendering */}
        {renderImages()}

        {/* Code Snippet & Live Runner */}
        {type === "snippet" && codeSnippet && (
          <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0a] flex flex-col max-w-full">
            <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between overflow-x-auto">
              <span className="text-[11px] font-mono text-[#a3a3a3] uppercase tracking-wider whitespace-nowrap mr-4">{codeSnippet.language}</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleCopy}
                  className="text-[11px] flex items-center gap-1.5 text-[#a3a3a3] hover:text-white transition-all duration-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 whitespace-nowrap"
                >
                  {copied ? <FiCheckCircle className="text-[#ccff00]" /> : <FiCopy />} {copied ? 'Copied' : 'Copy'}
                </button>
                <button 
                  onClick={() => onFork && onFork(post)}
                  className="text-[11px] flex items-center gap-1.5 text-[#a855f7] hover:text-white hover:bg-[#a855f7] font-mono transition-all duration-300 bg-[#a855f7]/10 px-3 py-1.5 rounded-lg border border-[#a855f7]/20 whitespace-nowrap"
                >
                  <FiGitMerge /> Fork Snippet
                </button>
              </div>
            </div>
            <div className="max-h-[400px] overflow-auto custom-scrollbar w-full">
              <SyntaxHighlighter 
                language={codeSnippet.language} 
                style={vscDarkPlus}
                customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
                wrapLines={false}
                wrapLongLines={false}
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

        {post.documentUrl && (
          <div>
            <a 
              href={post.documentUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center group bg-[#151515] border border-white/20 rounded-xl overflow-hidden hover:bg-white/10 hover:border-[#ccff00]/70 transition-all duration-300 w-full sm:w-auto"
            >
              <div className="bg-white/5 px-3 py-2.5 flex items-center justify-center border-r border-white/10 group-hover:bg-[#ccff00] transition-colors duration-300 h-full">
                <FiFileText size={18} className="text-[#ccff00] group-hover:text-black transition-colors duration-300" />
              </div>
              <div className="px-4 py-2 flex items-center justify-between gap-4 flex-1">
                <span className="text-sm font-semibold text-white group-hover:text-[#ccff00] transition-colors tracking-wide truncate">
                  Attached Document
                </span>
                <FiDownloadCloud size={16} className="text-white/30 group-hover:text-[#ccff00] transition-colors duration-300 flex-shrink-0" />
              </div>
            </a>
          </div>
        )}
      </div>
      {/* Reactions & Actions */}
      <div className="flex items-center gap-3 pt-6 mt-auto flex-wrap border-t border-white/5">
        
        {/* Custom Reactions */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleReact('fire')} 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 group ${
              userReaction === 'fire' ? 'bg-[#ff5555]/10 text-[#ff5555]' : 'bg-white/5 text-[#737373] hover:bg-white/10 hover:text-white'
            }`}
          >
            <FiZap className={`text-[15px] group-active:scale-75 transition-transform ${userReaction === 'fire' ? 'fill-current' : ''}`} />
            <span className="text-[12px] font-bold">{reactions?.fire || 0}</span>
          </button>
          
          <button 
            onClick={() => handleReact('bug')} 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 group ${
              userReaction === 'bug' ? 'bg-[#ffb86c]/10 text-[#ffb86c]' : 'bg-white/5 text-[#737373] hover:bg-white/10 hover:text-white'
            }`}
          >
            <FiTerminal className="text-[15px] group-active:scale-75 transition-transform" />
            <span className="text-[12px] font-bold">{reactions?.bug || 0}</span>
          </button>
          
          <button 
            onClick={() => handleReact('clever')} 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 group ${
              userReaction === 'clever' ? 'bg-[#8be9fd]/10 text-[#8be9fd]' : 'bg-white/5 text-[#737373] hover:bg-white/10 hover:text-white'
            }`}
          >
            <FiStar className={`text-[15px] group-active:scale-75 transition-transform ${userReaction === 'clever' ? 'fill-current' : ''}`} />
            <span className="text-[12px] font-bold">{reactions?.clever || 0}</span>
          </button>
          
          <button 
            onClick={() => handleReact('collab')} 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 group ${
              userReaction === 'collab' ? 'bg-[#50fa7b]/10 text-[#50fa7b]' : 'bg-white/5 text-[#737373] hover:bg-white/10 hover:text-white'
            }`}
          >
            <FiUsers className={`text-[15px] group-active:scale-75 transition-transform ${userReaction === 'collab' ? 'fill-current' : ''}`} />
            <span className="text-[12px] font-bold">{reactions?.collab || 0}</span>
          </button>
        </div>
        
        {/* Comments / Help */}
        <button 
          onClick={() => setIsCommentsOpen(!isCommentsOpen)}
          className={`flex items-center gap-2 transition-all duration-300 group px-4 py-2 rounded-full ml-auto text-[13px] font-bold ${
            type === 'debug_sos'
              ? 'bg-[#ccff00]/10 text-[#ccff00] hover:bg-[#ccff00]/20'
              : 'bg-white/5 text-[#e5e5e5] hover:bg-white/10'
          }`}
        >
          {type === 'debug_sos' ? (
            <><FiMessageSquare /> Provide Fix</>
          ) : (
            <><FiMessageSquare /> {post.comments?.length || 0} Comments</>
          )}
        </button>
      </div>
      
      {/* Inline Comments Section */}
      <CommentsSection post={post} isOpen={isCommentsOpen} />
      
      </div>
    </div>
  );
};

export default PostCard;
