import React, { useEffect, useState, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { setPosts, addPost, appendPosts } from "../redux/postSlice";
import axios from "axios";
import toast from "react-hot-toast";
import { HiCode } from "react-icons/hi";
import { FiImage, FiArrowUp, FiCode, FiX, FiLock, FiGlobe, FiUsers, FiGitMerge, FiSend, FiInbox, FiStar, FiPaperclip, FiFileText } from "react-icons/fi";
import { FaRocket } from "react-icons/fa";
import PostCard from "./PostCard";
import ProjectCard from "./ProjectCard";

const COMMON_TAGS = ["react", "node", "javascript", "python", "rustlang", "machinelearning", "webdev"];
const LANGUAGES = ["javascript", "html", "css", "python", "java", "rust", "cpp", "go"];

const Feed = () => {
  const posts = useSelector((store) => store.posts);
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [activeTag, setActiveTag] = useState("");

  // Feed Mode
  const [feedMode, setFeedMode] = useState("all");

  // Project Post State
  const [projectTitle, setProjectTitle] = useState("");
  const [projectTechStack, setProjectTechStack] = useState([]);
  const [techInput, setTechInput] = useState("");
  const [projectRoleNeeded, setProjectRoleNeeded] = useState("");
  const [projectCommitment, setProjectCommitment] = useState("Ongoing");
  const [projectStage, setProjectStage] = useState("💡 Idea");
  
  // Projects fetch data
  const [userRequestsMap, setUserRequestsMap] = useState({});
  const [requestCountsMap, setRequestCountsMap] = useState({});

  
  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);
  
  // Create Post State
  const [isPosting, setIsPosting] = useState(false);
  const [content, setContent] = useState("");
  const [type, setType] = useState("standard"); // standard, snippet, debug_sos
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [visibility, setVisibility] = useState("public"); // public, followers, matches
  const [forkedFrom, setForkedFrom] = useState(null); // Parent post object
  const [followedUsers, setFollowedUsers] = useState([]); // List of followed IDs
  const [globalTrendingTags, setGlobalTrendingTags] = useState([]);
  const [globalTopBuilders, setGlobalTopBuilders] = useState([]);

  // Media State
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const createPostRef = useRef(null);
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);

  
  const fetchPosts = async (tag = "", pageNum = 1, currentFeedMode = feedMode) => {
    try {
      setLoading(true);
      const endpoint = currentFeedMode === "projects" ? "/feed/projects" : "/feed/posts";
      const url = tag ? `${BASE_URL}${endpoint}?tag=${tag}&page=${pageNum}` : `${BASE_URL}${endpoint}?page=${pageNum}`;
      const res = await axios.get(url, { withCredentials: true });
      
      const fetchedPosts = res?.data?.data || [];
      const userReactionsMap = res?.data?.userReactionsMap || {};
      
      if (currentFeedMode === "projects") {
        setUserRequestsMap(prev => pageNum === 1 ? (res.data.userRequestsMap || {}) : {...prev, ...(res.data.userRequestsMap || {})});
        setRequestCountsMap(prev => pageNum === 1 ? (res.data.requestCountsMap || {}) : {...prev, ...(res.data.requestCountsMap || {})});
      }
      
      const postsWithReactions = fetchedPosts.map(p => ({
        ...p,
        userReaction: userReactionsMap[p._id] || null
      }));
      
      if (pageNum === 1) {
        dispatch(setPosts(postsWithReactions));
      } else {
        dispatch(appendPosts(postsWithReactions));
      }
      
      setHasMore(fetchedPosts.length > 0);
      setFollowedUsers(res?.data?.followedUserIds || []);
    } catch (err) {
      if (err?.response?.status === 401) return;
      toast.error("Could not load feed. Please try again.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };


  const handleFollowToggle = async (userId) => {
    const isFollowing = followedUsers.includes(userId);
    try {
      if (isFollowing) {
        await axios.post(BASE_URL + "/user/unfollow/" + userId, {}, { withCredentials: true });
        setFollowedUsers(followedUsers.filter(id => id !== userId));
        toast.success("Unfollowed builder");
      } else {
        await axios.post(BASE_URL + "/user/follow/" + userId, {}, { withCredentials: true });
        setFollowedUsers([...followedUsers, userId]);
        toast.success("Followed builder!");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action failed");
    }
  };

  
  // Fetch when mode changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setActiveTag("");
    fetchPosts("", 1, feedMode);
  }, [feedMode]);

  // Fetch when tag changes (reset to page 1)
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchPosts(activeTag, 1, feedMode);
  }, [activeTag]);

  // Fetch when page changes (infinite scroll)
  useEffect(() => {
    if (page > 1) {
      fetchPosts(activeTag, page, feedMode);
    }
  }, [page]);

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );
    
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    
    return () => observer.disconnect();
  }, [hasMore, loading]);

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

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (selectedImages.length + files.length > 4) {
      toast.error("You can only upload up to 4 images");
      return;
    }
    const validFiles = files.filter(f => f.size <= 10 * 1024 * 1024);
    if (validFiles.length < files.length) toast.error("Some images exceeded 10MB");
    setSelectedImages([...selectedImages, ...validFiles]);
  };

  const handleDocSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Document exceeds 10MB limit");
        return;
      }
      setSelectedDocument(file);
    }
  };

  const handlePost = async () => {
    if (!content.trim()) return toast.error("Content is required");
    if (type === "snippet" && !code.trim()) return toast.error("Code snippet is required");

    try {
      setIsPosting(true);

      let uploadedImages = [];
      let uploadedDocumentUrl = null;

      if (selectedImages.length > 0 || selectedDocument) {
        const formData = new FormData();
        selectedImages.forEach(img => formData.append("images", img));
        if (selectedDocument) formData.append("document", selectedDocument);

        const uploadRes = await axios.post(`${BASE_URL}/post/upload-media`, formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" }
        });
        
        uploadedImages = uploadRes.data.images || [];
        uploadedDocumentUrl = uploadRes.data.documentUrl || null;
      }
      
      const extractedTags = content.match(/#[a-z0-9_]+/gi)?.map(t => t.slice(1).toLowerCase()) || [];

      
      let finalTechStack = [...projectTechStack];
      if (type === "project" && techInput.trim()) {
        const newTag = techInput.trim().toLowerCase();
        if (!finalTechStack.includes(newTag)) {
          finalTechStack.push(newTag);
        }
      }

      const payload = {
        type,
        content,
        visibility,
        stackTags: type === "project" ? finalTechStack : extractedTags,
        images: uploadedImages,
        documentUrl: uploadedDocumentUrl
      };

      if (type === "snippet") {
        payload.codeSnippet = { language, code };
      }
      if (type === "project") {
        payload.project = {
          title: projectTitle,
          techStack: finalTechStack,
          roleNeeded: projectRoleNeeded,
          commitment: projectCommitment,
          stage: projectStage
        };
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
      setForkedFrom(null);
      setSelectedImages([]);
      setSelectedDocument(null);
      setType("standard");
      setVisibility("public");
      setProjectTitle("");
      setProjectTechStack([]);
      setTechInput("");
      setProjectRoleNeeded("");
      setProjectCommitment("ongoing");
      setProjectStage("idea");

      toast.success("Posted successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post");
    } finally {
      setIsPosting(false);
    }
  };

  // Compute Global Widgets (Trending Tags & Top Builders)
  useEffect(() => {
    if (!posts || posts.length === 0) return;
    
    // Only recalculate when NOT filtering by a tag, so the sidebar doesn't jump around
    if (!activeTag) {
      // Tags
      const tagCounts = {};
      posts.forEach(post => {
        if (post.stackTags && Array.isArray(post.stackTags)) {
          post.stackTags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });
      const sortedTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([tag]) => tag);
      
      if (sortedTags.length > 0) {
        setGlobalTrendingTags(sortedTags);
      }

      // Builders
      const uniqueBuilders = {};
      posts.forEach(post => {
        if (post.authorId && post.authorId._id !== user?._id && !uniqueBuilders[post.authorId._id]) {
          uniqueBuilders[post.authorId._id] = post.authorId;
        }
      });
      const buildersList = Object.values(uniqueBuilders).slice(0, 3);
      if (buildersList.length > 0) {
        setGlobalTopBuilders(buildersList);
      }
    }
  }, [posts, activeTag, user]);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-start gap-8 px-4 pt-10">
      
      {/* ── Center Column (Timeline) ───────────────────────────── */}
      <div className="flex-1 flex flex-col w-full min-w-0 min-h-[800px]">
        
        {/* Create Post Box */}
        <div ref={createPostRef} className="bg-[#151515] border border-[#262626] rounded-2xl p-5 mb-8 shadow-xl relative transition-all duration-300 focus-within:border-[#444] focus-within:shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
          
          {forkedFrom && (
            <div className="flex items-center justify-between bg-[#ccff00]/10 border border-[#ccff00]/20 rounded-lg px-3 py-2 mb-4">
              <span className="text-[12px] font-mono text-[#ccff00] flex items-center gap-1.5">
                <FiGitMerge /> Forking snippet from {forkedFrom.authorId?.firstName}
              </span>
              <button onClick={handleCancelFork} className="text-[#ccff00] hover:text-[#e6ff33] transition-colors">
                <FiX />
              </button>
            </div>
          )}

          <div className="flex gap-4">
            {/* User Avatar */}
            <div className="shrink-0">
              <img 
                src={user?.photoUrl || "https://geographyandyou.com/images/user-profile.png"} 
                alt="Your avatar" 
                className="w-10 h-10 rounded-full object-cover border border-white/10"
              />
            </div>

            {/* Input Area */}
            <div className="flex-1 min-w-0 pt-1">
              <textarea 
                placeholder={type === "project" ? "Describe your project and what you're looking to build..." : "What are you building today? Markdown is supported..."}
                className="w-full bg-transparent text-[#e5e5e5] placeholder:text-[#555] outline-none resize-none text-[15px] min-h-[60px] p-0 transition-all duration-300 leading-relaxed"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />

              {/* Media Previews */}
              {(selectedImages.length > 0 || selectedDocument) && (
                <div className="mt-2 mb-4 flex flex-wrap gap-3">
                  {selectedImages.map((img, idx) => (
                    <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-white/10 shadow-md">
                      <img src={URL.createObjectURL(img)} alt="preview" className="w-full h-full object-cover" />
                      <button onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-black/70 p-1 rounded-full opacity-0 group-hover:opacity-100 transition text-white hover:text-red-400">
                        <FiX size={12} />
                      </button>
                    </div>
                  ))}
                  {selectedDocument && (
                    <div className="relative group flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10 shadow-md">
                      <FiFileText className="text-[#ccff00]" />
                      <span className="text-xs text-white max-w-[120px] truncate">{selectedDocument.name}</span>
                      <button onClick={() => setSelectedDocument(null)} className="ml-1 opacity-0 group-hover:opacity-100 transition text-white hover:text-red-400">
                        <FiX size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          
          {type === "project" && (
            <div className="mb-4 mt-2 bg-[#121212] border border-[#262626] rounded-xl p-4 flex flex-col gap-4">
              <input 
                type="text" 
                placeholder="Project title..." 
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full bg-transparent text-[#e5e5e5] text-[15px] font-bold outline-none border-b border-[#262626] pb-2 focus:border-[#ccff00]/50 transition-colors"
              />
              
              <div>
                <input 
                  type="text" 
                  placeholder="Add tech (e.g. react, node) and press Enter..." 
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && techInput.trim()) {
                      e.preventDefault();
                      if (!projectTechStack.includes(techInput.trim().toLowerCase())) {
                        setProjectTechStack([...projectTechStack, techInput.trim().toLowerCase()]);
                      }
                      setTechInput("");
                    }
                  }}
                  className="w-full bg-transparent text-[#a3a3a3] text-[13px] outline-none border-b border-[#262626] pb-2 focus:border-[#a855f7]/50 transition-colors"
                />
                {projectTechStack.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {projectTechStack.map(t => (
                      <span key={t} className="flex items-center gap-1 text-[11px] font-mono bg-[#1a1a1a] text-[#e5e5e5] px-2 py-1 rounded-md border border-white/5">
                        {t}
                        <button onClick={() => setProjectTechStack(projectTechStack.filter(x => x !== t))} className="text-[#a3a3a3] hover:text-red-400"><FiX size={12}/></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <input 
                type="text" 
                placeholder="What kind of collaborator do you need? (e.g. Frontend dev for UI)" 
                value={projectRoleNeeded}
                onChange={(e) => setProjectRoleNeeded(e.target.value)}
                className="w-full bg-transparent text-[#a3a3a3] text-[13px] outline-none border-b border-[#262626] pb-2 focus:border-white/50 transition-colors"
              />

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={projectCommitment === "one-time"} onChange={() => setProjectCommitment("one-time")} className="accent-[#ccff00]" />
                    <span className="text-[12px] text-[#a3a3a3]">One-time</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={projectCommitment === "ongoing"} onChange={() => setProjectCommitment("ongoing")} className="accent-[#ccff00]" />
                    <span className="text-[12px] text-[#a3a3a3]">Ongoing</span>
                  </label>
                </div>
                
                <select 
                  value={projectStage}
                  onChange={(e) => setProjectStage(e.target.value)}
                  className="bg-[#1a1a1a] border border-[#262626] text-[#e5e5e5] text-[12px] rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:border-white/20 transition-colors"
                >
                  <option value="idea">💡 Idea</option>
                  <option value="early-build">🔨 Early Build</option>
                  <option value="mid-build">🏗️ Mid Build</option>
                  <option value="needs-review">🔍 Needs Review</option>
                </select>
              </div>
            </div>
          )}


          {/* Full-width Code Snippet Editor */}
          {type === "snippet" && (
            <div className="mt-3 mb-2 bg-[#09090b] border border-[#262626] rounded-xl overflow-hidden group">
              <div className="bg-[#121212] px-4 py-2.5 flex items-center justify-between border-b border-[#262626]">
                <div className="flex items-center gap-2 text-[#737373]">
                  <FiCode size={14} />
                  <span className="text-[11px] font-mono font-bold tracking-widest uppercase">Snippet</span>
                </div>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-transparent text-[11px] font-mono font-bold text-[#a3a3a3] outline-none uppercase cursor-pointer hover:text-white transition-colors"
                >
                  {LANGUAGES.map(lang => <option key={lang} value={lang} className="bg-[#121212]">{lang}</option>)}
                </select>
              </div>
              <textarea
                placeholder="// Write or paste your code here..."
                className="w-full bg-transparent text-[#e5e5e5] font-mono text-[13px] p-4 outline-none resize-none min-h-[140px] leading-relaxed custom-scrollbar placeholder:text-[#444]"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck="false"
              />
            </div>
          )}

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#262626]">
            
            {/* Left Actions (Tools) */}
            <div className="flex items-center gap-1">
              <label className="p-2 text-[#737373] hover:text-[#e5e5e5] hover:bg-white/5 rounded-full cursor-pointer transition-all tooltip-trigger">
                <FiImage size={18} />
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
              </label>
              
              <label className="p-2 text-[#737373] hover:text-[#e5e5e5] hover:bg-white/5 rounded-full cursor-pointer transition-all">
                <FiPaperclip size={18} />
                <input type="file" className="hidden" onChange={(e) => setSelectedDocument(e.target.files[0])} />
              </label>

              <button 
                onClick={() => setType(type === "snippet" ? "standard" : "snippet")}
                className={`p-2 rounded-full transition-all flex items-center gap-1.5 ml-1 ${
                  type === "snippet" 
                    ? "bg-[#ccff00]/10 text-[#ccff00]" 
                    : "text-[#737373] hover:text-[#e5e5e5] hover:bg-white/5"
                }`}
              >
                <FiCode size={18} />
                {type === "snippet" && <span className="text-[11px] font-bold">Snippet</span>}
              </button>
              <button 
                onClick={() => setType(type === "project" ? "standard" : "project")}
                className={`p-2 rounded-full transition-all flex items-center gap-1.5 ml-1 ${
                  type === "project" 
                    ? "bg-[#ccff00]/10 text-[#ccff00]" 
                    : "text-[#737373] hover:text-[#e5e5e5] hover:bg-white/5"
                }`}
              >
                <FaRocket size={18} />
                {type === "project" && <span className="text-[11px] font-bold">Project</span>}
              </button>

            </div>

            {/* Right Actions (Visibility, Ship) */}
            <div className="flex items-center gap-3">
              {/* Visibility Dropdown (Subtle) */}
              <div className="relative group flex items-center">
                <FiGlobe className="absolute left-2.5 text-[#737373] group-hover:text-white transition-colors" size={12} />
                <select 
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="appearance-none bg-transparent border border-transparent hover:border-[#333] hover:bg-[#1a1a1a] rounded-lg pl-7 pr-4 py-1.5 text-[12px] font-semibold text-[#a3a3a3] outline-none transition-all cursor-pointer"
                >
                  <option value="public" className="bg-[#121212]">Public</option>
                  <option value="followers" className="bg-[#121212]">Followers</option>
                  <option value="matches" className="bg-[#121212]">Matches</option>
                </select>
              </div>

              {/* Ship Button */}
              <button 
                onClick={handlePost}
                disabled={isPosting || (!content.trim() && !code.trim() && selectedImages.length === 0 && !selectedDocument)}
                className="bg-[#e5e5e5] text-[#09090b] hover:bg-white px-5 py-1.5 rounded-full font-bold text-[13px] flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_2px_10px_rgba(255,255,255,0.1)] hover:shadow-[0_2px_15px_rgba(255,255,255,0.2)]"
              >
                {isPosting ? "Shipping..." : type === "project" ? "Post Project 🚀" : "Ship It"} <FiSend size={12} />
              </button>
            </div>
          </div>
        </div>

        
        {/* Feed Mode Toggle */}
        <div className="flex gap-3 mb-6">
          <button 
            onClick={() => setFeedMode("all")}
            className={`px-5 py-2 rounded-full text-[14px] font-bold transition-all duration-300 flex items-center gap-2 ${
              feedMode === "all" ? "bg-[#e5e5e5] text-[#09090b] shadow-[0_0_15px_rgba(255,255,255,0.2)]" : "bg-[#151515] text-[#737373] border border-[#262626] hover:text-white"
            }`}
          >
            All Feed
          </button>
          <button 
            onClick={() => setFeedMode("projects")}
            className={`px-5 py-2 rounded-full text-[14px] font-bold transition-all duration-300 flex items-center gap-2 ${
              feedMode === "projects" ? "bg-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.2)]" : "bg-[#151515] text-[#737373] border border-[#262626] hover:text-white"
            }`}
          >
            🚀 Projects
          </button>
        </div>


        {/* Stack Tag Filter Bar */}
        {feedMode !== "projects" && (
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 custom-scrollbar items-center">
          <button 
            onClick={() => setActiveTag("")}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[13px] font-bold transition-all duration-300 border ${
              activeTag === "" ? "bg-[#ccff00]/10 border-[#ccff00]/30 text-[#ccff00]" : "bg-[#121212] border-white/5 text-[#737373] hover:text-white"
            }`}
          >
            All Feed
          </button>
          {COMMON_TAGS.map(tag => (
            <button 
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[13px] font-bold font-mono transition-all duration-300 border ${
                activeTag === tag 
                  ? "bg-[#a855f7]/10 border-[#a855f7]/30 text-[#a855f7]" 
                  : "bg-[#121212] border-white/5 text-[#737373] hover:text-white"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
        )}

        {/* Post Feed */}
        <div className="w-full flex flex-col">
          {loading && posts.length === 0 ? (
            <div className="flex flex-col gap-4 mt-4">
               {/* Skeleton Posts */}
               {[1,2,3].map((i) => (
                 <div key={i} className="animate-pulse h-32 border-b border-white/5 mb-6"></div>
               ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-8 gap-4 text-center px-4 w-full py-16 border-t border-dashed border-white/10">
              <FiInbox className="text-4xl text-[#a3a3a3]/50" />
              <h1 className="text-xl font-bold text-white mt-2">No posts found</h1>
              <p className="text-[#a3a3a3] font-medium text-sm max-w-xs">
                {activeTag ? `No one is talking about #${activeTag} right now.` : "Your feed is quiet. Follow more builders or write the first post!"}
              </p>
            </div>
          ) : (
            <>
              
              {posts.map((post) => post.type === "project" ? (
                <ProjectCard key={post._id} post={post} userRequestStatus={userRequestsMap[post._id]} requestCount={requestCountsMap[post._id]} />
              ) : (
                <PostCard key={post._id} post={post} onFork={handleFork} followedUsers={followedUsers} />
              ))}

              
              {/* Infinite Scroll Loader */}
              {hasMore && (
                <div ref={loaderRef} className="py-8 flex justify-center">
                  <div className="w-8 h-8 border-4 border-[#a855f7] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_#a855f7]"></div>
                </div>
              )}
              
              {!hasMore && posts.length > 0 && (
                <div className="py-8 text-center text-[#a3a3a3] font-mono text-sm">
                  You've reached the end of the feed.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Right Sidebar (Widgets) ─────────────────────────────── */}
      <div className="hidden xl:flex w-[320px] flex-col gap-6 sticky top-10 pb-10">
        
        {/* Upgrade Banner */}
        {!user?.isPremium ? (
          <div 
            onClick={() => navigate("/premium")}
            className="bg-[#a855f7]/10 border border-[#a855f7]/20 rounded-xl p-5 relative overflow-hidden group cursor-pointer hover:bg-[#a855f7]/20 transition-colors shrink-0"
          >
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#a855f7]/30 rounded-full blur-xl group-hover:bg-[#a855f7]/50 transition-colors" />
            <h3 className="text-[#a855f7] font-bold text-[16px] mb-2 flex items-center gap-2">
              <FiArrowUp /> Introducing Pro
            </h3>
            <p className="text-[13px] text-[#a3a3a3] font-medium mb-5 leading-relaxed pr-2">
              Boost your visibility and access live collaborative sandboxes with premium features.
            </p>
            <div className="flex gap-2">
              <button className="flex-1 bg-[#a855f7] text-white font-medium text-xs py-2 rounded-lg hover:bg-[#9240de] transition-colors shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                Upgrade
              </button>
              <button className="flex-1 bg-white/5 text-[#e5e5e5] font-medium text-xs py-2 rounded-lg hover:bg-white/10 transition-colors">
                Explore
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#a855f7]/10 border border-[#a855f7]/20 rounded-xl p-5 relative overflow-hidden shrink-0">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#a855f7]/30 rounded-full blur-xl transition-colors" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#a855f7]/20 rounded-xl flex items-center justify-center text-[#a855f7]">
                  <FiStar className="text-xl" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Pro Member</h3>
                  <p className="text-[11px] text-[#a3a3a3] font-mono mt-0.5">Active Subscription</p>
                </div>
              </div>
              <button 
                onClick={() => navigate("/premium")}
                className="text-[12px] font-bold text-[#a855f7] hover:text-[#b873f8] transition-colors"
              >
                Manage
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Trending Topics */}
        <div className="dev-card p-5 shrink-0">
          <h3 className="text-sm font-bold text-[#e5e5e5] mb-4">Trending Topics</h3>
          <div className="flex flex-wrap gap-2">
            {(globalTrendingTags.length > 0 ? globalTrendingTags : COMMON_TAGS.slice(0,6)).map(tag => (
              <button 
                key={tag}
                onClick={() => setActiveTag(tag)}
                className="text-xs font-mono text-[#a3a3a3] bg-white/5 border border-white/5 px-2.5 py-1 rounded-md hover:bg-white/10 hover:text-white cursor-pointer transition-colors"
              >
                #{tag.replace(/^#/, '')}
              </button>
            ))}
          </div>
        </div>

        {/* Top Builders (Dynamic) */}
        <div className="dev-card p-5 shrink-0">
          <h3 className="text-sm font-bold text-[#e5e5e5] mb-4 flex items-center gap-2">
            Top Builders
          </h3>
          <div className="flex flex-col gap-4">
            {globalTopBuilders.length > 0 ? globalTopBuilders.map((builder) => (
              <div key={builder._id} className="flex items-center justify-between group">
                <div className="flex items-center gap-3 min-w-0">
                  <img 
                    src={builder.photoUrl || "https://geographyandyou.com/images/user-profile.png"} 
                    alt={builder.firstName}
                    className="w-8 h-8 rounded-lg object-cover border border-white/10"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-[#e5e5e5] truncate group-hover:text-white transition-colors">
                      {builder.firstName} {builder.lastName}
                    </span>
                    <span className="text-[11px] text-[#737373] truncate">
                      {builder.skills && builder.skills[0] ? builder.skills[0] : "Developer"}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => handleFollowToggle(builder._id)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ml-2 ${
                    followedUsers.includes(builder._id)
                      ? "text-[#ccff00] bg-[#ccff00]/10"
                      : "text-white/50 bg-white/5 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {followedUsers.includes(builder._id) ? "Following" : "Follow"}
                </button>
              </div>
            )) : (
              <div className="text-xs text-[#737373]">No active builders yet.</div>
            )}
          </div>
        </div>


      </div>
    </div>
  );
};

export default Feed;
