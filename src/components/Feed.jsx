import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { setPosts, addPost } from "../redux/postSlice";
import axios from "axios";
import toast from "react-hot-toast";
import { FiImage, FiArrowUp } from "react-icons/fi";
import PostCard from "./PostCard";

const Feed = () => {
  const posts = useSelector((store) => store.posts);
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/feed/posts`, {
        withCredentials: true,
      });
      dispatch(setPosts(res?.data?.data || []));
    } catch (err) {
      if (err?.response?.status === 401) return;
      toast.error("Could not load feed. Please try again.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePost = async () => {
    if (!newPostContent.trim()) return;
    try {
      setIsPosting(true);
      const res = await axios.post(
        `${BASE_URL}/post`,
        { content: newPostContent },
        { withCredentials: true }
      );
      dispatch(addPost(res?.data?.data));
      setNewPostContent("");
      toast.success("Posted successfully!");
    } catch (err) {
      toast.error("Failed to post.");
      console.log(err);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-start gap-8 px-4 pt-10">
      
      {/* ── Center Column (Timeline) ───────────────────────────── */}
      <div className="flex-1 flex flex-col w-full min-h-[800px]">
        
        {/* New Post Input */}
        <div className="dev-card p-4 mb-6">
          <textarea 
            placeholder="What's on your mind? Share a code snippet or idea..."
            className="w-full bg-transparent text-[#e5e5e5] placeholder:text-[#a3a3a3] outline-none resize-none text-sm font-medium mb-3"
            rows="3"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
          ></textarea>
          <div className="flex justify-between items-center border-t border-white/5 pt-3">
            <div className="flex gap-4 text-[#a3a3a3]">
              <button className="hover:text-[#ccff00] transition-colors text-xs font-semibold flex items-center gap-1">
                <span className="text-base">&lt;/&gt;</span> Code
              </button>
              <button className="hover:text-[#ccff00] transition-colors text-xs font-semibold flex items-center gap-1">
                <FiImage className="text-base" /> Image
              </button>
            </div>
            <button 
              onClick={handlePost}
              disabled={isPosting || !newPostContent.trim()}
              className="bg-[#ccff00] text-[#0a0a0a] px-5 py-1.5 rounded-lg font-bold text-xs hover:bg-[#b3e600] disabled:opacity-50 transition-colors"
            >
              {isPosting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>

        {/* Timeline Tabs */}
        <div className="flex gap-6 border-b border-white/10 mb-6 px-2">
          <button className="text-[#ccff00] border-b-2 border-[#ccff00] pb-3 font-semibold text-sm">
            Following
          </button>
          <button className="text-[#a3a3a3] hover:text-white pb-3 font-semibold text-sm transition-colors">
            Featured
          </button>
          <button className="text-[#a3a3a3] hover:text-white pb-3 font-semibold text-sm transition-colors">
            Rising
          </button>
        </div>

        {/* Post Feed */}
        <div className="w-full flex flex-col">
          {loading && posts.length === 0 ? (
            <div className="flex flex-col gap-4 mt-4">
               {/* Skeleton Posts */}
               {[1,2,3].map((i) => (
                 <div key={i} className="dev-card p-5 animate-pulse">
                   <div className="flex gap-3 items-center mb-4">
                     <div className="w-10 h-10 bg-white/5 rounded-full" />
                     <div className="flex flex-col gap-2">
                       <div className="w-24 h-3 bg-white/5 rounded" />
                       <div className="w-16 h-2 bg-white/5 rounded" />
                     </div>
                   </div>
                   <div className="w-full h-4 bg-white/5 rounded mb-2" />
                   <div className="w-3/4 h-4 bg-white/5 rounded" />
                 </div>
               ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-12 gap-4 text-center px-4 dev-card w-full py-16 border-dashed border-2 border-white/10 bg-transparent">
              <p className="text-4xl">📝</p>
              <h1 className="text-xl font-bold text-white mt-2">
                Your feed is quiet
              </h1>
              <p className="text-[#a3a3a3] font-medium text-sm max-w-xs">
                Be the first to post a code snippet or thought, or navigate to Discover to find more builders.
              </p>
            </div>
          ) : (
            posts.map((post) => <PostCard key={post._id} post={post} />)
          )}
        </div>
      </div>

      {/* ── Right Sidebar (Widgets) ─────────────────────────────── */}
      <div className="hidden xl:flex w-[320px] flex-col gap-6 sticky top-10">
        
        {/* Upgrade Banner */}
        {!user?.isPremium ? (
          <div 
            onClick={() => navigate("/premium")}
            className="bg-[#a855f7]/10 border border-[#a855f7]/20 rounded-xl p-5 relative overflow-hidden group cursor-pointer hover:bg-[#a855f7]/20 transition-colors"
          >
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#a855f7]/30 rounded-full blur-xl group-hover:bg-[#a855f7]/50 transition-colors" />
            <h3 className="text-[#a855f7] font-bold mb-2 flex items-center gap-2">
              <FiArrowUp className="text-lg" /> Introducing Pro
            </h3>
            <p className="text-xs text-[#a3a3a3] font-medium mb-4 leading-relaxed">
              Boost your visibility and access live collaborative sandboxes with premium features.
            </p>
            <div className="flex gap-2">
              <button className="flex-1 bg-[#a855f7] text-white font-medium text-xs py-2 rounded-lg hover:bg-[#9240de] transition-colors pointer-events-none">
                Upgrade
              </button>
              <button className="flex-1 bg-white/5 text-[#e5e5e5] font-medium text-xs py-2 rounded-lg hover:bg-white/10 transition-colors pointer-events-none">
                Explore
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#ccff00]/10 border border-[#ccff00]/20 rounded-xl p-5 relative overflow-hidden flex flex-col items-center justify-center text-center">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#ccff00]/30 rounded-full blur-xl" />
            <div className="w-12 h-12 bg-[#ccff00]/20 rounded-full flex items-center justify-center mb-3">
              <span className="text-2xl">⭐</span>
            </div>
            <h3 className="text-[#ccff00] font-bold mb-1">Pro Member</h3>
            <p className="text-xs text-[#a3a3a3] font-medium">You have access to all premium features.</p>
          </div>
        )}

        {/* Trending Topics */}
        <div className="dev-card p-5">
          <h3 className="text-sm font-bold text-[#e5e5e5] mb-4">Trending Topics</h3>
          <div className="flex flex-wrap gap-2">
            {["#react", "#nextjs", "#machinelearning", "#rustlang", "#indiehacker", "#devtinder"].map((tag, i) => (
              <span key={i} className="text-xs font-mono text-[#a3a3a3] bg-white/5 border border-white/5 px-2.5 py-1 rounded-md hover:bg-white/10 hover:text-white cursor-pointer transition-colors">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Official Channels */}
        <div className="dev-card p-5">
          <h3 className="text-sm font-bold text-[#e5e5e5] mb-4 flex items-center gap-2">
            Official Channels <span className="text-[#a855f7]">✓</span>
          </h3>
          <div className="flex flex-col gap-4">
            {["VS Code", "React", "Tailwind CSS"].map((channel, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-xs">
                    {channel[0]}
                  </div>
                  <span className="text-sm font-medium text-[#a3a3a3] group-hover:text-white transition-colors">
                    {channel}
                  </span>
                </div>
                <button className="text-xs font-semibold text-white/50 bg-white/5 px-3 py-1 rounded hover:bg-white/10 transition-colors">
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Feed;
