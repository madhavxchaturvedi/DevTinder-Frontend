import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { setPosts, addPost } from "../redux/postSlice";
import axios from "axios";
import toast from "react-hot-toast";
import { FiImage, FiArrowUp, FiCode, FiX, FiLock, FiGlobe, FiUsers, FiGitMerge, FiSend, FiInbox, FiStar } from "react-icons/fi";
import PostCard from "./PostCard";

const COMMON_TAGS = ["react", "node", "javascript", "python", "rustlang", "machinelearning", "webdev"];
const LANGUAGES = ["javascript", "html", "css", "python", "java", "rust", "cpp", "go"];

const Feed = () => {
  const posts = useSelector((store) => store.posts);
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [activeTag, setActiveTag] = useState("");
  
  // Create Post State
  const [isPosting, setIsPosting] = useState(false);
  const [content, setContent] = useState("");
  const [type, setType] = useState("standard"); // standard, snippet, debug_sos
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [visibility, setVisibility] = useState("public"); // public, followers, matches
  const [postTags, setPostTags] = useState("");
  const [forkedFrom, setForkedFrom] = useState(null); // Parent post object
  const [followedUsers, setFollowedUsers] = useState([]); // List of followed IDs

  const createPostRef = useRef(null);

  const fetchPosts = async (tag = "") => {
    try {
      setLoading(true);
      const url = tag ? `${BASE_URL}/feed/posts?tag=${tag}` : `${BASE_URL}/feed/posts`;
      const res = await axios.get(url, { withCredentials: true });
      
      const fetchedPosts = res?.data?.data || [];
      const userReactionsMap = res?.data?.userReactionsMap || {};
      
      const postsWithReactions = fetchedPosts.map(p => ({
        ...p,
        userReaction: userReactionsMap[p._id] || null
      }));
      
      dispatch(setPosts(postsWithReactions));
      setFollowedUsers(res?.data?.followedUserIds || []);
    } catch (err) {
      if (err?.response?.status === 401) return;
      toast.error("Could not load feed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(activeTag);
  }, [activeTag]);

  const handleFork = (parentPost) => {
    setForkedFrom(parentPost);
    setType("snippet");
    if (parentPost.codeSnippet) {
      setCode(parentPost.codeSnippet.code);
      setLanguage(parentPost.codeSnippet.language);
    }
    // CRITICAL: Inherit visibility from parent to prevent accidental leak of restricted posts
    setVisibility(parentPost.visibility || "public");
    
    // Scroll to top
    if (createPostRef.current) {
      createPostRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCancelFork = () => {
    setForkedFrom(null);
    setCode("");
    setType("standard");
    setVisibility("public");
  };

  const handlePost = async () => {
    if (!content.trim()) return toast.error("Content is required");
    if (type === "snippet" && !code.trim()) return toast.error("Code snippet is required");

    try {
      setIsPosting(true);
      
      const payload = {
        type,
        content,
        visibility,
        stackTags: postTags.split(",").map(t => t.trim().replace(/^#/, '').toLowerCase()).filter(t => t),
      };

      if (type === "snippet") {
        payload.codeSnippet = { language, code };
      }
      if (forkedFrom) {
        payload.forkedFrom = forkedFrom._id;
      }

      const res = await axios.post(`${BASE_URL}/post`, payload, { withCredentials: true });
      
      // Prepend to Redux state
      dispatch(addPost(res?.data?.data));
      
      // Reset form
      setContent("");
      setCode("");
      setPostTags("");
      setForkedFrom(null);
      setType("standard");
      setVisibility("public");
      toast.success("Posted successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-start gap-8 px-4 pt-10">
      
      {/* ── Center Column (Timeline) ───────────────────────────── */}
      <div className="flex-1 flex flex-col w-full min-h-[800px]">
        
        {/* Create Post Box */}
        <div ref={createPostRef} className="dev-card p-5 mb-6 flex flex-col gap-3">
          
          {forkedFrom && (
            <div className="flex items-center justify-between bg-white/5 border border-[#ccff00]/20 rounded-lg px-3 py-2 mb-2">
              <span className="text-[11px] font-mono text-[#ccff00] flex items-center gap-1.5">
                <FiGitMerge /> Forking snippet from {forkedFrom.authorId?.firstName}
              </span>
              <button onClick={handleCancelFork} className="text-[#a3a3a3] hover:text-red-500 transition-colors">
                <FiX />
              </button>
            </div>
          )}

          {/* Visibility Dropdown (Must include matches!) */}
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <select 
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs font-semibold text-[#a3a3a3] outline-none hover:bg-white/10 transition-colors"
            >
              <option value="public" className="flex items-center gap-2">Public</option>
              <option value="followers">Followers Only</option>
              <option value="matches">Matches Only</option>
            </select>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs font-semibold text-[#a3a3a3] outline-none hover:bg-white/10 transition-colors"
            >
              <option value="standard">Standard Post</option>
              <option value="snippet">Code Snippet</option>
              <option value="debug_sos">Debug SOS</option>
            </select>
          </div>

          <textarea 
            placeholder={type === 'debug_sos' ? "Describe what you're stuck on..." : "Share a thought, markdown supported..."}
            className="w-full bg-transparent text-[#e5e5e5] placeholder:text-white/20 outline-none resize-none text-sm min-h-[60px] focus:ring-1 focus:ring-[#a855f7]/50 rounded-lg p-2 transition-all duration-300"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {type === "snippet" && (
            <div className="flex flex-col gap-2 mt-2 bg-[#0a0a0a] border border-white/10 rounded-lg overflow-hidden">
              <div className="bg-white/5 px-3 py-2 flex items-center justify-between border-b border-white/10">
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-transparent text-xs font-mono text-[#a3a3a3] outline-none uppercase"
                >
                  {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
              </div>
              <textarea
                placeholder="Paste your code here..."
                className="w-full bg-transparent text-[#ccff00] font-mono text-sm p-4 outline-none resize-none min-h-[150px]"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck="false"
              />
            </div>
          )}

          <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-1">
            <input 
              type="text"
              placeholder="Tags (comma separated)..."
              className="bg-transparent border border-white/10 rounded-lg px-3 py-1.5 text-xs text-[#a3a3a3] outline-none w-1/2 focus:border-[#a855f7]/50 focus:ring-1 focus:ring-[#a855f7]/20 transition-all duration-300"
              value={postTags}
              onChange={(e) => setPostTags(e.target.value)}
            />
            <button 
              onClick={handlePost}
              disabled={isPosting || !content.trim()}
              className="bg-[#ccff00] text-[#0a0a0a] px-6 py-2 rounded-lg font-bold text-xs hover:bg-[#b3e600] disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {isPosting ? "Posting..." : "Ship It"} <FiSend className={isPosting ? "animate-pulse" : ""} />
            </button>
          </div>
        </div>

        {/* Stack Tag Filter Bar */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-2 custom-scrollbar items-center">
          <button 
            onClick={() => setActiveTag("")}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
              activeTag === "" ? "bg-gradient-to-r from-[#a855f7] to-[#9240de] text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]" : "bg-white/5 text-[#a3a3a3] hover:bg-[#a855f7]/10 hover:text-[#d8b4fe]"
            }`}
          >
            All Feed
          </button>
          {COMMON_TAGS.map(tag => (
            <button 
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold font-mono transition-all duration-300 border ${
                activeTag === tag 
                  ? "bg-gradient-to-r from-[#a855f7]/20 to-[#9240de]/20 text-[#d8b4fe] border-[#a855f7]/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]" 
                  : "border-white/5 bg-[#121212] text-[#a3a3a3] hover:border-[#a855f7]/30 hover:text-white"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Post Feed */}
        <div className="w-full flex flex-col">
          {loading && posts.length === 0 ? (
            <div className="flex flex-col gap-4 mt-4">
               {/* Skeleton Posts */}
               {[1,2,3].map((i) => (
                 <div key={i} className="dev-card p-5 animate-pulse h-40"></div>
               ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-8 gap-4 text-center px-4 dev-card w-full py-16 bg-transparent border-dashed">
              <FiInbox className="text-4xl text-[#a3a3a3]/50" />
              <h1 className="text-xl font-bold text-white mt-2">No posts found</h1>
              <p className="text-[#a3a3a3] font-medium text-sm max-w-xs">
                {activeTag ? `No one is talking about #${activeTag} right now.` : "Your feed is quiet. Follow more builders or write the first post!"}
              </p>
            </div>
          ) : (
            posts.map((post) => <PostCard key={post._id} post={post} onFork={handleFork} followedUsers={followedUsers} />)
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
            <button className="w-full bg-[#a855f7] text-white font-medium text-xs py-2 rounded-lg hover:bg-[#9240de] transition-colors pointer-events-none">
              Upgrade Now
            </button>
          </div>
        ) : (
          <div className="bg-[#ccff00]/10 border border-[#ccff00]/20 rounded-xl p-5 relative overflow-hidden flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-[#ccff00]/20 rounded-full flex items-center justify-center mb-3 text-[#ccff00]">
              <FiStar className="text-2xl" />
            </div>
            <h3 className="text-[#ccff00] font-bold mb-1">Pro Member</h3>
          </div>
        )}

      </div>
    </div>
  );
};

export default Feed;
