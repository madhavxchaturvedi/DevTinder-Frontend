import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';
import { FiSend, FiCheckCircle } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { updatePost } from '../redux/postSlice';
import toast from 'react-hot-toast';

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const CommentsSection = ({ post, isOpen }) => {
  const [comments, setComments] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);

  // Lazy loading logic
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/post/${post._id}/comments`, {
          withCredentials: true,
        });
        setComments(res.data.comments);
        setHasFetched(true);
      } catch (err) {
        console.error("Failed to fetch comments", err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && !hasFetched) {
      fetchComments();
    }
  }, [isOpen, hasFetched, post._id]);

  useEffect(() => {
    if (isOpen && hasFetched) {
      // scroll after a short delay to allow DOM render
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  }, [comments, isOpen, hasFetched]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await axios.post(`${BASE_URL}/post/${post._id}/comment`, 
        { text: inputText }, 
        { withCredentials: true }
      );
      
      setComments((prev) => [...prev, res.data.data]);
      setInputText("");
    } catch (err) {
      console.error("Failed to post comment", err);
      toast.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async (commentId) => {
    try {
      await axios.patch(`${BASE_URL}/comment/${commentId}/resolve`, {}, {
        withCredentials: true
      });
      // Optimistically update the UI to show resolved badge
      setComments(prev => prev.map(c => c._id === commentId ? { ...c, isResolvedAnswer: true } : c));
      
      // We also need to update the post globally so it shows as resolved on the card
      const updatedPost = { ...post, isResolved: true };
      dispatch(updatePost(updatedPost));
      toast.success("Marked as helpful answer!");
      
    } catch (err) {
      console.error("Failed to resolve", err);
      toast.error(err?.response?.data?.message || "Failed to resolve post");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="mt-4 border-t border-border pt-4 animate-in slide-in-from-top-2 duration-300">
      {/* Comments List */}
      <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 custom-scrollbar mb-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center text-foreground/40 py-4">
            <p className="text-sm">No comments yet. Be the first!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className={`flex gap-3 p-3 rounded-xl transition-colors ${comment.isResolvedAnswer ? 'bg-primary/5 border border-primary/20' : 'bg-muted'}`}>
              <img 
                src={comment.authorId?.photoUrl} 
                alt="avatar" 
                className="w-8 h-8 rounded-full object-cover border border-border"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-foreground">{comment.authorId?.firstName} {comment.authorId?.lastName}</span>
                    <span className="text-[10px] font-bold text-foreground/40">{formatTimeAgo(comment.createdAt)}</span>
                    {comment.isResolvedAnswer && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-black bg-primary px-2 py-0.5 rounded-sm uppercase tracking-wider border border-[#ccff00]">
                        <FiCheckCircle /> Resolved
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap break-words">{comment.text}</p>
                
                {/* Resolve Button for SOS Posts */}
                {post.type === 'debug_sos' && 
                 post.authorId._id === user?._id && 
                 comment.authorId?._id !== user?._id && 
                 !post.isResolved && 
                 !comment.isResolvedAnswer && (
                  <button 
                    onClick={() => handleResolve(comment._id)}
                    className="mt-2 text-xs font-bold text-black bg-white border border-white/20 px-3 py-1 rounded-full hover:bg-white/90 active:scale-95 transition-all flex items-center gap-1"
                  >
                    <FiCheckCircle /> Mark as Helpful Answer
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 bg-[#111113] border border-white/10 rounded-lg px-4 py-2 text-sm text-[#f0f0f0] placeholder-white/40 focus:outline-none focus:border-[#ccff00] transition-colors"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSubmitting}
          className={`px-4 py-2 rounded-lg font-bold border border-transparent transition-all flex items-center justify-center ${
            inputText.trim() && !isSubmitting
              ? 'bg-primary text-black hover:bg-[#d9ff33]'
              : 'bg-[#111113] text-white/20 border-white/10'
          }`}
        >
          <FiSend className="text-lg" />
        </button>
      </form>
    </div>
  );
};

export default CommentsSection;
