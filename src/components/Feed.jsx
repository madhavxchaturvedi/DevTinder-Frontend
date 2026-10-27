import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { setPosts, addPost, appendPosts } from "../redux/postSlice";
import axios from "axios";
import toast from "react-hot-toast";
import { 
  Image as ImageIcon, 
  Code2, 
  FolderGit2, 
  Send, 
  X, 
  Globe, 
  Sparkles, 
  Paperclip, 
  FileText, 
  Inbox, 
  GitFork,
  ArrowUpRight
} from "lucide-react";
import PostCard from "./PostCard";
import ProjectCard from "./ProjectCard";

const COMMON_TAGS = ["react", "node", "javascript", "python", "rustlang", "machinelearning", "webdev"];
const LANGUAGES = ["javascript", "typescript", "python", "html", "css", "rust", "go", "cpp", "java"];

const Feed = () => {
  const posts = useSelector((store) => store.posts);
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [activeTag, setActiveTag] = useState("");

  // Feed Mode: "all" or "projects"
  const [feedMode, setFeedMode] = useState("all");

  // Project Post State
  const [projectTitle, setProjectTitle] = useState("");
  const [projectTechStack, setProjectTechStack] = useState([]);
  const [techInput, setTechInput] = useState("");
  const [projectRoleNeeded, setProjectRoleNeeded] = useState("");
  const [projectCommitment, setProjectCommitment] = useState("ongoing");
  const [projectStage, setProjectStage] = useState("idea");
  
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
  const [type, setType] = useState("standard"); // standard, snippet, project
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
        toast.success("Followed builder");
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

  // Fetch when tag changes
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
    setVisibility(parentPost.visibility || "public");
    
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
      toast.error("You can upload up to 4 images");
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
    
    if (!activeTag) {
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

  const lineCount = Math.max(5, code.split("\n").length);

  return (
    <div className="w-full flex flex-row gap-8 justify-center px-4 pt-6 pb-12">
      
      {/* -- Center Column (Timeline): max-w-2xl mx-auto ------------ */}
      <main className="w-full max-w-2xl min-w-0 flex flex-col">
        
        {/* Create Post Box */}
        <div 
          ref={createPostRef} 
          className="bg-[#111113] border border-white/[0.07] rounded-xl p-4 mb-4 transition-all duration-200 focus-within:border-white/[0.14]"
        >
          {forkedFrom && (
            <div className="flex items-center justify-between bg-[#b266ff]/10 border border-[#b266ff]/20 rounded-lg px-3 py-1.5 mb-3">
              <span className="text-[11px] font-mono text-[#b266ff] flex items-center gap-1.5">
                <GitFork size={12} /> Forking snippet from {forkedFrom.authorId?.firstName}
              </span>
              <button onClick={handleCancelFork} className="text-[#52525b] hover:text-[#f0f0f0] transition-colors">
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex gap-3">
            {/* User Avatar */}
            <div className="shrink-0 pt-0.5">
              <img 
                src={user?.photoUrl || "https://geographyandyou.com/images/user-profile.png"} 
                alt="Your avatar" 
                className="w-7 h-7 rounded-lg object-cover border border-white/[0.07]"
              />
            </div>

            {/* Input Area */}
            <div className="flex-1 min-w-0">
              <textarea 
                placeholder={type === "project" ? "Describe your project and what you are building..." : "What are you building today? Markdown supported..."}
                className="w-full bg-transparent text-[#f0f0f0] placeholder:text-white/20 text-[13px] leading-relaxed outline-none resize-none min-h-[50px] p-0"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />

              {/* Media Previews */}
              {(selectedImages.length > 0 || selectedDocument) && (
                <div className="mt-2 mb-3 flex flex-wrap gap-2">
                  {selectedImages.map((img, idx) => (
                    <div key={idx} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-white/[0.08] bg-black/40">
                      <img src={URL.createObjectURL(img)} alt="preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== idx))} 
                        className="absolute top-1 right-1 bg-black/80 p-0.5 rounded text-white/70 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {selectedDocument && (
                    <div className="relative group flex items-center gap-2 px-2.5 py-1.5 bg-black/40 rounded-lg border border-white/[0.08]">
                      <FileText size={14} className="text-[#ccff00]" />
                      <span className="text-[11px] font-mono text-[#f0f0f0] max-w-[120px] truncate">{selectedDocument.name}</span>
                      <button 
                        onClick={() => setSelectedDocument(null)} 
                        className="text-[#52525b] hover:text-red-400 transition ml-1"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Project Mode Structured Fields */}
          {type === "project" && (
            <div className="mt-3 mb-2 bg-black/40 border border-white/[0.06] rounded-lg p-3 flex flex-col gap-2.5">
              <input 
                type="text" 
                placeholder="Project title..." 
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-[#f0f0f0] placeholder:text-white/20 outline-none focus:border-[#ccff00] transition-colors"
              />
              
              <div className="flex flex-col gap-1.5">
                <input 
                  type="text" 
                  placeholder="Add tech stack (e.g. react, node) and press Enter..." 
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && techInput.trim()) {
                      e.preventDefault();
                      const val = techInput.trim().toLowerCase();
                      if (!projectTechStack.includes(val)) {
                        setProjectTechStack([...projectTechStack, val]);
                      }
                      setTechInput("");
                    }
                  }}
                  className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-[#f0f0f0] placeholder:text-white/20 outline-none focus:border-[#ccff00] transition-colors"
                />
                {projectTechStack.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {projectTechStack.map(t => (
                      <span key={t} className="flex items-center gap-1 text-[10px] font-mono font-bold bg-[#ccff00]/10 text-[#ccff00] px-2 py-0.5 rounded border border-[#ccff00]/20">
                        {t}
                        <button onClick={() => setProjectTechStack(projectTechStack.filter(x => x !== t))} className="hover:text-red-400">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <input 
                type="text" 
                placeholder="Role needed (e.g. Fullstack Engineer, Rust Developer)..." 
                value={projectRoleNeeded}
                onChange={(e) => setProjectRoleNeeded(e.target.value)}
                className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-[#f0f0f0] placeholder:text-white/20 outline-none focus:border-[#ccff00] transition-colors"
              />

              <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-mono text-[#52525b] hover:text-[#f0f0f0]">
                    <input 
                      type="radio" 
                      name="commitment" 
                      checked={projectCommitment === "one-time"} 
                      onChange={() => setProjectCommitment("one-time")} 
                      className="accent-[#ccff00]" 
                    />
                    <span>One-time</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-mono text-[#52525b] hover:text-[#f0f0f0]">
                    <input 
                      type="radio" 
                      name="commitment" 
                      checked={projectCommitment === "ongoing"} 
                      onChange={() => setProjectCommitment("ongoing")} 
                      className="accent-[#ccff00]" 
                    />
                    <span>Ongoing</span>
                  </label>
                </div>
                
                <select 
                  value={projectStage}
                  onChange={(e) => setProjectStage(e.target.value)}
                  className="bg-[#09090b] border border-white/10 text-[#f0f0f0] text-[11px] font-mono uppercase rounded-md px-2 py-1 outline-none cursor-pointer"
                >
                  <option value="idea">Idea</option>
                  <option value="early-build">Early Build</option>
                  <option value="mid-build">Mid Build</option>
                  <option value="needs-review">Needs Review</option>
                </select>
              </div>
            </div>
          )}

          {/* Code Snippet Mode with Language Selector & Line Numbers */}
          {type === "snippet" && (
            <div className="mt-3 mb-2 bg-[#09090b] border border-white/[0.08] rounded-lg overflow-hidden">
              <div className="bg-black/60 px-3 py-1.5 flex items-center justify-between border-b border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-[#52525b]">
                  <Code2 size={13} className="text-[#ccff00]" />
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#f0f0f0]">Code Snippet</span>
                </div>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-transparent text-[11px] font-mono font-bold text-[#ccff00] outline-none uppercase cursor-pointer"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang} value={lang} className="bg-[#111113] text-[#f0f0f0] font-mono">
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* Editor body with line numbers */}
              <div className="flex min-h-[140px] text-[12px] font-mono">
                {/* Line numbers gutter */}
                <div className="select-none text-[#52525b] text-right py-3 pr-2.5 pl-3 bg-black/40 border-r border-white/[0.06] flex flex-col leading-5 shrink-0">
                  {Array.from({ length: lineCount }, (_, i) => (
                    <span key={i + 1}>{i + 1}</span>
                  ))}
                </div>
                {/* Code textarea */}
                <textarea
                  placeholder="// Write or paste your code snippet here..."
                  className="w-full bg-transparent text-[#f0f0f0] font-mono text-[12px] p-3 outline-none resize-none min-h-[140px] leading-5 custom-scrollbar placeholder:text-white/20 whitespace-pre overflow-x-auto"
                  wrap="off"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck="false"
                />
              </div>
            </div>
          )}

          {/* Toolbar below textarea */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
            
            {/* Toolbar Ghost Icon Buttons */}
            <div className="flex items-center gap-1">
              <label 
                className="p-1.5 text-[#52525b] hover:text-[#f0f0f0] hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                title="Add Images"
              >
                <ImageIcon size={16} />
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
              </label>
              
              <label 
                className="p-1.5 text-[#52525b] hover:text-[#f0f0f0] hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                title="Attach Document"
              >
                <Paperclip size={16} />
                <input type="file" className="hidden" onChange={handleDocSelect} />
              </label>

              <button 
                type="button"
                onClick={() => setType(type === "snippet" ? "standard" : "snippet")}
                className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs ${
                  type === "snippet" 
                    ? "bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/30" 
                    : "text-[#52525b] hover:text-[#f0f0f0] hover:bg-white/5"
                }`}
                title="Toggle Code Snippet"
              >
                <Code2 size={16} />
                {type === "snippet" && <span className="text-[11px] font-mono font-bold">Code</span>}
              </button>

              <button 
                type="button"
                onClick={() => setType(type === "project" ? "standard" : "project")}
                className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs ${
                  type === "project" 
                    ? "bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/30" 
                    : "text-[#52525b] hover:text-[#f0f0f0] hover:bg-white/5"
                }`}
                title="Toggle Project Post"
              >
                <FolderGit2 size={16} />
                {type === "project" && <span className="text-[11px] font-mono font-bold">Project</span>}
              </button>
            </div>

            {/* Visibility & Submit Button */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center">
                <Globe size={13} className="text-[#52525b] absolute left-2 pointer-events-none" />
                <select 
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="bg-transparent border border-white/[0.08] hover:border-white/20 rounded-lg pl-6 pr-2.5 py-1 text-[11px] font-mono text-[#52525b] hover:text-[#f0f0f0] outline-none cursor-pointer transition-colors"
                >
                  <option value="public" className="bg-[#111113] text-[#f0f0f0]">Public</option>
                  <option value="followers" className="bg-[#111113] text-[#f0f0f0]">Followers</option>
                  <option value="matches" className="bg-[#111113] text-[#f0f0f0]">Matches</option>
                </select>
              </div>

              {/* Submit button: Lime bg-[#ccff00] text-black text-xs font-bold px-4 py-1.5 rounded-lg */}
              <button 
                onClick={handlePost}
                disabled={
                  isPosting ||
                  !content.trim() ||
                  (type === "snippet" && !code.trim()) ||
                  (type === "project" && (!projectTitle.trim() || !projectRoleNeeded.trim()))
                }
                className="bg-[#ccff00] hover:bg-[#d9ff33] text-black text-xs font-bold px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>{isPosting ? "Shipping..." : type === "project" ? "Post Project" : "Ship It"}</span>
                <Send size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Feed/Projects mode toggle */}
        <div className="flex items-center gap-2 mb-3">
          <button 
            onClick={() => setFeedMode("all")}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
              feedMode === "all" 
                ? "bg-[#ccff00] text-black" 
                : "bg-transparent border border-white/10 text-[#52525b] hover:text-[#f0f0f0]"
            }`}
          >
            All Feed
          </button>
          <button 
            onClick={() => setFeedMode("projects")}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors flex items-center gap-1.5 ${
              feedMode === "projects" 
                ? "bg-[#ccff00] text-black" 
                : "bg-transparent border border-white/10 text-[#52525b] hover:text-[#f0f0f0]"
            }`}
          >
            <FolderGit2 size={13} />
            <span>Projects</span>
          </button>
        </div>

        {/* Tag filter row: Horizontal scrolling pill list */}
        {feedMode !== "projects" && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-2 custom-scrollbar">
            <button 
              onClick={() => setActiveTag("")}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-mono font-bold transition-colors border ${
                activeTag === "" 
                  ? "bg-[#ccff00]/10 border-[#ccff00]/30 text-[#ccff00]" 
                  : "bg-white/[0.03] border-white/[0.07] text-[#52525b] hover:text-[#f0f0f0]"
              }`}
            >
              All Topics
            </button>
            {COMMON_TAGS.map(tag => (
              <button 
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-mono font-bold transition-colors border ${
                  activeTag === tag 
                    ? "bg-[#ccff00]/10 border-[#ccff00]/30 text-[#ccff00]" 
                    : "bg-white/[0.03] border-white/[0.07] text-[#52525b] hover:text-[#f0f0f0]"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Timeline Posts */}
        <div className="w-full flex flex-col">
          {loading && posts.length === 0 ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-5 animate-pulse h-36" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="glass-card p-12 text-center flex flex-col items-center justify-center my-4">
              <Inbox size={32} className="text-[#52525b] mb-3" />
              <h3 className="text-base font-bold text-[#f0f0f0] mb-1">No posts found</h3>
              <p className="text-xs text-[#52525b] max-w-sm">
                {activeTag ? `No posts tagged with #${activeTag} yet.` : "Your feed is quiet. Share what you are building or follow more builders!"}
              </p>
            </div>
          ) : (
            <>
              {posts.map((post) => post.type === "project" ? (
                <ProjectCard 
                  key={post._id} 
                  post={post} 
                  userRequestStatus={userRequestsMap[post._id]} 
                  requestCount={requestCountsMap[post._id]} 
                />
              ) : (
                <PostCard 
                  key={post._id} 
                  post={post} 
                  onFork={handleFork} 
                  followedUsers={followedUsers} 
                />
              ))}

              {/* Infinite Scroll Loader */}
              {hasMore && (
                <div ref={loaderRef} className="py-6 flex justify-center">
                  <div className="w-6 h-6 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              
              {!hasMore && posts.length > 0 && (
                <div className="py-6 text-center text-[#52525b] font-mono text-xs">
                  End of timeline
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* -- Feed right panel: sticky w-72 visible on xl+ screens ---- */}
      <aside className="hidden xl:flex w-72 flex-col gap-4 sticky top-6 shrink-0 self-start">
        
        {/* Pro Member Card */}
        {!user?.isPremium ? (
          <div 
            onClick={() => navigate("/premium")}
            className="rounded-xl p-4 bg-gradient-to-br from-[#b266ff]/20 via-[#111113] to-[#111113] border border-[#b266ff]/30 cursor-pointer hover:border-[#b266ff]/50 transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#b266ff] flex items-center gap-1.5">
                <Sparkles size={12} /> OctoPair Pro
              </span>
              <ArrowUpRight size={14} className="text-[#b266ff] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <p className="text-xs text-[#a0a0a0] mb-3 leading-relaxed">
              Unlock collaborative sandboxes, priority feed placement, and builder badges.
            </p>
            <button className="w-full bg-[#b266ff] hover:bg-[#c280ff] text-black font-bold text-xs py-1.5 rounded-lg transition-colors">
              Upgrade to Pro
            </button>
          </div>
        ) : (
          <div className="rounded-xl p-4 bg-gradient-to-br from-[#b266ff]/20 via-[#111113] to-[#111113] border border-[#b266ff]/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#b266ff]/20 flex items-center justify-center text-[#b266ff]">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#f0f0f0]">Pro Member</h4>
                  <p className="text-[10px] font-mono text-[#52525b]">Active Tier</p>
                </div>
              </div>
              <button 
                onClick={() => navigate("/premium")}
                className="text-[11px] font-mono text-[#b266ff] hover:underline"
              >
                Manage
              </button>
            </div>
          </div>
        )}

        {/* Trending Topics Section */}
        <div className="glass-card p-4">
          <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#52525b] mb-3 font-mono">
            Trending Topics
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {(globalTrendingTags.length > 0 ? globalTrendingTags : COMMON_TAGS.slice(0, 6)).map(tag => (
              <button 
                key={tag}
                onClick={() => setActiveTag(tag)}
                className="rounded-md px-2 py-1 text-[11px] font-mono font-bold bg-white/5 text-white/70 border border-white/[0.07] hover:border-[#ccff00]/40 hover:text-[#ccff00] transition-colors"
              >
                #{tag.replace(/^#/, '')}
              </button>
            ))}
          </div>
        </div>

        {/* Top Builders Section */}
        <div className="glass-card p-4">
          <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#52525b] mb-3 font-mono">
            Top Builders
          </h4>
          <div className="flex flex-col gap-3">
            {globalTopBuilders.length > 0 ? globalTopBuilders.map((builder) => (
              <div key={builder._id} className="flex items-center justify-between gap-2 group">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img 
                    src={builder.photoUrl || "https://geographyandyou.com/images/user-profile.png"} 
                    alt={builder.firstName}
                    className="w-7 h-7 rounded-lg object-cover border border-white/[0.07] shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-[#f0f0f0] truncate group-hover:text-[#ccff00] transition-colors">
                      {builder.firstName} {builder.lastName}
                    </span>
                    <span className="text-[10px] font-mono text-[#52525b] truncate">
                      {builder.skills && builder.skills[0] ? builder.skills[0] : "Developer"}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => handleFollowToggle(builder._id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors shrink-0 ${
                    followedUsers.includes(builder._id)
                      ? "bg-transparent border border-white/10 text-[#52525b] hover:text-red-400"
                      : "bg-[#ccff00] text-black hover:bg-[#d9ff33]"
                  }`}
                >
                  {followedUsers.includes(builder._id) ? "Following" : "Follow"}
                </button>
              </div>
            )) : (
              <p className="text-[11px] font-mono text-[#52525b]">No active builders yet.</p>
            )}
          </div>
        </div>

      </aside>

    </div>
  );
};

export default Feed;
