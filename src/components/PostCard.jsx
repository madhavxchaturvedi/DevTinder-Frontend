import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiMessageSquare, FiHeart, FiShare2, FiMoreHorizontal, FiTrash2 } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { removePost, updatePost } from "../redux/postSlice";
import toast from "react-hot-toast";

// How long ago a date was (e.g. "2 min ago", "3 hr ago")
const timeAgo = (dateString) => {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (seconds < 60) return "just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const PostCard = ({ post }) => {
  const { _id, authorId, content, codeSnippet, codeLanguage, imageUrl, createdAt, likes } = post;
  const loggedInUser = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const [isLiking, setIsLiking] = useState(false);
  
  if (!authorId) return null;

  const isMyPost = loggedInUser?._id === authorId._id;
  const hasLiked = likes?.includes(loggedInUser?._id);

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

  const handleLike = async () => {
    if (isLiking) return;
    try {
      setIsLiking(true);
      const res = await axios.post(`${BASE_URL}/post/like/${_id}`, {}, { withCredentials: true });
      dispatch(updatePost(res.data.data));
    } catch (err) {
      toast.error("Failed to like post");
      console.error(err);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 mb-4 hover:border-white/10 transition-all">
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
          {isMyPost && (
            <button 
              onClick={handleDelete}
              className="text-[#a3a3a3] hover:text-red-500 transition-colors p-2 hover:bg-white/5 rounded-full"
              title="Delete Post"
            >
              <FiTrash2 />
            </button>
          )}
          <button className="text-[#a3a3a3] hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
            <FiMoreHorizontal />
          </button>
        </div>
      </div>

      {/* Content */}
      {content && (
        <p className="text-[#e5e5e5] text-sm leading-relaxed mb-4 whitespace-pre-wrap">
          {content}
        </p>
      )}

      {/* Code Snippet */}
      {codeSnippet && (
        <div className="mb-4 rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0a]">
          <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs font-mono text-[#a3a3a3]">{codeLanguage || "code"}</span>
          </div>
          <pre className="p-4 overflow-x-auto">
            <code className="text-sm font-mono text-[#e5e5e5]">{codeSnippet}</code>
          </pre>
        </div>
      )}

      {/* Image */}
      {imageUrl && (
        <div className="mb-4 rounded-xl overflow-hidden border border-white/10">
          <img src={imageUrl} alt="Post attachment" className="w-full h-auto object-cover max-h-[400px]" />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6 pt-3 border-t border-white/5 mt-2">
        <button 
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-2 transition-colors group text-sm font-medium ${
            hasLiked ? "text-pink-500" : "text-[#a3a3a3] hover:text-pink-500"
          }`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            hasLiked ? "bg-pink-500/20" : "group-hover:bg-pink-500/10"
          }`}>
            <FiHeart className={`transition-transform ${hasLiked ? "fill-current" : ""} group-active:scale-90`} />
          </div>
          {likes?.length > 0 ? likes.length : "Like"}
        </button>
        
        <button className="flex items-center gap-2 text-[#a3a3a3] hover:text-blue-400 transition-colors group text-sm font-medium">
          <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-blue-400/10 transition-colors">
            <FiMessageSquare className="group-active:scale-90 transition-transform" />
          </div>
          Comment
        </button>

        <button className="flex items-center gap-2 text-[#a3a3a3] hover:text-[#ccff00] transition-colors group text-sm font-medium ml-auto">
          <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-[#ccff00]/10 transition-colors">
            <FiShare2 className="group-active:scale-90 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
