import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Flame, 
  Terminal, 
  ThumbsUp, 
  MessageSquare, 
  Trash2, 
  Copy, 
  Check, 
  GitFork, 
  FileText, 
  Download, 
  MoreHorizontal,
  CheckCircle2,
  Users
} from "lucide-react";
import { RiPushpinFill, RiPushpinLine } from "react-icons/ri";
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
import { timeAgo } from "../utils/timeAgo";

const PostCard = ({ post, onFork, followedUsers = [] }) => {
  const { _id, authorId, type, content, codeSnippet, forkedFrom, stackTags, createdAt, reactions } = post;
  const loggedInUser = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const [isReacting, setIsReacting] = useState(false);
  const [isPinning, setIsPinning] = useState(false);
  
  const [localFollowState, setLocalFollowState] = useState(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!authorId) return null;

  const isMyPost = loggedInUser?._id === authorId._id;
  const isAlreadyFollowing = localFollowState !== null ? localFollowState : followedUsers.includes(authorId._id);

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
        toast.success(`Followed ${authorId.firstName}`);
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
        <div className="rounded-lg overflow-hidden bg-black/60 border border-white/[0.06] max-h-[480px]">
          <img 
            src={post.images[0]} 
            alt="Attachment 1" 
            className="w-full h-full object-contain cursor-pointer hover:opacity-90 transition" 
            onClick={() => window.open(post.images[0], '_blank')} 
          />
        </div>
      );
    }
    
    if (count === 2) {
      return (
        <div className="grid grid-cols-2 gap-1.5 rounded-lg overflow-hidden bg-black/60 border border-white/[0.06] h-[280px]">
          {post.images.map((img, i) => (
            <img 
              key={i} 
              src={img} 
              alt={`Attachment ${i+1}`} 
              className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition" 
              onClick={() => window.open(img, '_blank')} 
            />
          ))}
        </div>
      );
    }
    
    if (count === 3) {
      return (
        <div className="grid grid-cols-2 gap-1.5 rounded-lg overflow-hidden bg-black/60 border border-white/[0.06] h-[320px]">
          <div className="h-full">
             <img 
               src={post.images[0]} 
               alt="Attachment 1" 
               className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition" 
               onClick={() => window.open(post.images[0], '_blank')} 
             />
          </div>
          <div className="grid grid-rows-2 gap-1.5 h-full">
             <img 
               src={post.images[1]} 
               alt="Attachment 2" 
               className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition" 
               onClick={() => window.open(post.images[1], '_blank')} 
             />
             <img 
               src={post.images[2]} 
               alt="Attachment 3" 
               className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition" 
               onClick={() => window.open(post.images[2], '_blank')} 
             />
          </div>
        </div>
      );
    }
    
    if (count === 4) {
      return (
        <div className="grid grid-cols-2 grid-rows-2 gap-1.5 rounded-lg overflow-hidden bg-black/60 border border-white/[0.06] h-[320px]">
          {post.images.map((img, i) => (
            <img 
              key={i} 
              src={img} 
              alt={`Attachment ${i+1}`} 
              className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition" 
              onClick={() => window.open(img, '_blank')} 
            />
          ))}
        </div>
      );
    }
    
    return null;
  };

  return (
    <article className={`glass-card glass-card-hover mb-3 transition-all duration-200 relative w-full min-w-0 ${
      type === 'debug_sos' && post.isResolved
        ? 'border-[#ccff00]/30 shadow-[0_0_20px_rgba(204,255,0,0.05)]' 
        : type === 'debug_sos'
        ? 'border-[#b266ff]/30 shadow-[0_0_20px_rgba(178,102,255,0.05)]'
        : ''
    }`}>
      <div className="p-4 md:p-5 flex flex-col w-full min-w-0">
        
        {/* Fork Indicator */}
        {forkedFrom && (
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#52525b] mb-2.5">
            <GitFork size={12} className="text-[#b266ff]" />
            <span>Forked from</span>
            <Link to={`/user/${forkedFrom.authorId?._id}`} className="text-[#f0f0f0] hover:text-[#ccff00] transition-colors font-medium">
              {forkedFrom.authorId?.firstName} {forkedFrom.authorId?.lastName}
            </Link>
          </div>
        )}

        {/* Debug SOS Badge */}
        {type === 'debug_sos' && (
          <div className={`flex items-center gap-2 mb-3 rounded-md px-2.5 py-1 w-fit border ${
            post.isResolved 
              ? 'bg-[#ccff00]/10 border-[#ccff00]/30 text-[#ccff00]'
              : 'bg-[#b266ff]/10 border-[#b266ff]/30 text-[#b266ff]'
          }`}>
            {post.isResolved ? (
              <CheckCircle2 size={13} className="text-[#ccff00]" />
            ) : (
              <Terminal size={13} className="text-[#b266ff] animate-pulse" />
            )}
            <span className="text-[10px] font-bold tracking-widest uppercase font-mono">
              {post.isResolved ? 'RESOLVED_SOS' : 'SYS_DEBUG_SOS'}
            </span>
            <span className="text-[10px] font-mono opacity-60">
              {post.isResolved ? 'Solved' : 'Bounty'}
            </span>
          </div>
        )}

        {/* Author Row */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <Link to={`/user/${authorId._id}`} className="flex items-center gap-2.5 group min-w-0">
            {/* Small avatar: 28px, rounded-lg not circle */}
            <img 
              src={authorId.photoUrl || "https://geographyandyou.com/images/user-profile.png"} 
              alt={authorId.firstName} 
              className="w-7 h-7 rounded-lg object-cover border border-white/[0.07] shrink-0 group-hover:border-[#ccff00]/60 transition-colors"
            />
            
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="text-[14px] font-bold text-[#f0f0f0] group-hover:text-[#ccff00] transition-colors truncate">
                {authorId.firstName} {authorId.lastName}
              </span>
              
              {/* Monospace skill tag badge */}
              <span className="rounded-md px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20 truncate">
                {authorId.skills?.[0] || "Developer"}
              </span>

              {/* Timestamp: muted, 11px mono */}
              <span className="text-[11px] font-mono text-[#52525b] shrink-0">
                {timeAgo(createdAt)}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Stack Tags */}
            <div className="hidden sm:flex items-center gap-1 mr-1">
              {stackTags?.slice(0, 3).map((tag, i) => (
                <span key={i} className="text-[10px] font-mono bg-white/5 text-white/60 px-1.5 py-0.5 rounded border border-white/[0.06]">
                  #{tag}
                </span>
              ))}
            </div>

            {isMyPost && (
              <div className="flex items-center gap-0.5">
                {type === "snippet" && (
                  <button
                    disabled={isPinning}
                    onClick={async () => {
                      if (isPinning) return;
                      setIsPinning(true);
                      try {
                        const res = await axios.patch(`${BASE_URL}/post/${_id}/pin`, {}, { withCredentials: true });
                        toast.success(res.data.message);
                        dispatch(updatePost({ ...post, isPinnedToProfile: res.data.isPinnedToProfile }));
                      } catch (err) {
                        toast.error(err?.response?.data?.message || "Failed to pin");
                      } finally {
                        setIsPinning(false);
                      }
                    }}
                    className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                      post.isPinnedToProfile ? "text-[#ccff00]" : "text-[#52525b] hover:text-[#ccff00]"
                    }`}
                    title={post.isPinnedToProfile ? "Unpin from Profile" : "Pin to Profile"}
                  >
                    {post.isPinnedToProfile ? <RiPushpinFill size={15} /> : <RiPushpinLine size={15} />}
                  </button>
                )}
                <button 
                  onClick={handleDelete}
                  className="text-[#52525b] hover:text-red-400 transition-colors p-1.5 rounded-lg"
                  title="Delete Post"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )}

            {!isMyPost && (
              <button 
                onClick={handleFollowToggle}
                disabled={isFollowing}
                className={`text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50 ${
                  isAlreadyFollowing 
                    ? "bg-transparent border border-white/10 text-[#52525b] hover:text-red-400 hover:border-red-400/30" 
                    : "bg-[#ccff00] text-black hover:bg-[#d9ff33]"
                }`}
              >
                {isFollowing ? "..." : (isAlreadyFollowing ? "Following" : "Follow")}
              </button>
            )}

            <button className="text-[#52525b] hover:text-[#f0f0f0] transition-colors p-1.5 rounded-lg">
              <MoreHorizontal size={15} />
            </button>
          </div>
        </div>

        {/* Post Content */}
        {content && (
          <div className="mb-3">
            <div className={`text-[13.5px] leading-relaxed text-[#d4d4d8] prose prose-invert max-w-none break-words prose-p:text-[#d4d4d8] prose-p:leading-relaxed prose-headings:text-[#f0f0f0] prose-a:text-[#ccff00] prose-pre:bg-black/60 prose-pre:border-white/[0.06] ${
              !isExpanded && content.length > 300 ? 'line-clamp-4' : ''
            }`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
            {content.length > 300 && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[#ccff00] text-xs font-mono font-medium hover:underline mt-1.5 inline-block"
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )}

        {/* Media Attachments */}
        <div className="flex flex-col gap-3 mb-3">
          {renderImages()}

          {/* Code Snippet Block */}
          {type === "snippet" && codeSnippet && (
            <div className="bg-black/60 rounded-lg border border-white/[0.06] p-4 font-mono text-[12px] flex flex-col gap-3 max-w-full overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                <span className="bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/30 rounded-md px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider">
                  {codeSnippet.language}
                </span>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleCopy}
                    className="text-[11px] font-mono flex items-center gap-1.5 text-[#52525b] hover:text-[#f0f0f0] transition-colors bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] px-2.5 py-1 rounded-md"
                  >
                    {copied ? <Check size={12} className="text-[#ccff00]" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button 
                    onClick={() => onFork && onFork(post)}
                    className="text-[11px] font-mono flex items-center gap-1.5 text-[#b266ff] hover:text-[#f0f0f0] bg-[#b266ff]/10 hover:bg-[#b266ff]/20 px-2.5 py-1 rounded-md border border-[#b266ff]/20 transition-colors"
                  >
                    <GitFork size={12} />
                    <span>Fork</span>
                  </button>
                </div>
              </div>

              <div className="max-h-[360px] overflow-auto custom-scrollbar w-full text-[12px]">
                <SyntaxHighlighter 
                  language={codeSnippet.language} 
                  style={vscDarkPlus}
                  customStyle={{ margin: 0, padding: '0.25rem 0', background: 'transparent' }}
                  wrapLines={false}
                  wrapLongLines={false}
                >
                  {codeSnippet.code}
                </SyntaxHighlighter>
              </div>

              {/* Live Executable Sandbox */}
              <div className="pt-2 border-t border-white/[0.06]">
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
                className="inline-flex items-center gap-3 bg-[#111113] border border-white/[0.07] hover:border-white/[0.15] rounded-lg px-3.5 py-2 transition-colors max-w-full sm:max-w-sm"
              >
                <div className="w-7 h-7 rounded-md bg-[#ccff00]/10 flex items-center justify-center text-[#ccff00] shrink-0">
                  <FileText size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#f0f0f0] truncate">Attached Document</p>
                  <p className="text-[10px] font-mono text-[#52525b]">Click to view or download</p>
                </div>
                <Download size={14} className="text-[#52525b] shrink-0" />
              </a>
            </div>
          )}
        </div>

        {/* Action Row (Bottom) */}
        <div className="flex items-center justify-between pt-3 mt-1 border-t border-white/[0.06] gap-2 flex-wrap">
          {/* Reaction Icons (Flame, Terminal, ThumbsUp, Collab) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button 
              onClick={() => handleReact('fire')} 
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors group ${
                userReaction === 'fire' 
                  ? 'bg-[#ccff00]/10 text-[#ccff00]' 
                  : 'text-[#52525b] hover:text-[#ccff00] hover:bg-white/[0.03]'
              }`}
              title="Flame"
            >
              <Flame size={14} className={userReaction === 'fire' ? 'fill-current' : ''} />
              <span className="font-mono text-[12px]">{reactions?.fire || 0}</span>
            </button>
            
            <button 
              onClick={() => handleReact('bug')} 
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors group ${
                userReaction === 'bug' 
                  ? 'bg-[#ccff00]/10 text-[#ccff00]' 
                  : 'text-[#52525b] hover:text-[#ccff00] hover:bg-white/[0.03]'
              }`}
              title="Terminal / Bug"
            >
              <Terminal size={14} />
              <span className="font-mono text-[12px]">{reactions?.bug || 0}</span>
            </button>
            
            <button 
              onClick={() => handleReact('clever')} 
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors group ${
                userReaction === 'clever' 
                  ? 'bg-[#ccff00]/10 text-[#ccff00]' 
                  : 'text-[#52525b] hover:text-[#ccff00] hover:bg-white/[0.03]'
              }`}
              title="Thumbs Up / Clever"
            >
              <ThumbsUp size={14} className={userReaction === 'clever' ? 'fill-current' : ''} />
              <span className="font-mono text-[12px]">{reactions?.clever || 0}</span>
            </button>
            
            {reactions?.collab !== undefined && (
              <button 
                onClick={() => handleReact('collab')} 
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors group ${
                  userReaction === 'collab' 
                    ? 'bg-[#ccff00]/10 text-[#ccff00]' 
                    : 'text-[#52525b] hover:text-[#ccff00] hover:bg-white/[0.03]'
                }`}
                title="Collab"
              >
                <Users size={14} />
                <span className="font-mono text-[12px]">{reactions?.collab || 0}</span>
              </button>
            )}
          </div>
          
          {/* Comments Toggle */}
          <button 
            onClick={() => setIsCommentsOpen(!isCommentsOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors ${
              isCommentsOpen
                ? 'bg-[#ccff00]/10 text-[#ccff00]'
                : 'text-[#52525b] hover:text-[#ccff00] hover:bg-white/[0.03]'
            }`}
            title="Comments"
          >
            <MessageSquare size={14} />
            <span className="font-mono text-[12px]">{post.comments?.length || 0}</span>
          </button>
        </div>
        
        {/* Inline Comments Section */}
        <CommentsSection post={post} isOpen={isCommentsOpen} />
        
      </div>
    </article>
  );
};

export default PostCard;
