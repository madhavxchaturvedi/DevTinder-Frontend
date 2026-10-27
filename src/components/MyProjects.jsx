import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { timeAgo } from "../utils/timeAgo";
import { toast } from "sonner";
import {
  Folder,
  FolderGit2,
  CheckCircle2,
  Clock,
  ArrowRight,
  Trash2,
  Users,
  RefreshCw,
  AlertCircle,
  FileCode2,
  Plus,
  Terminal,
  Loader2,
  Sparkles,
} from "lucide-react";

const MyProjects = () => {
  // Data states
  const [myPosts, setMyPosts] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [counts, setCounts] = useState({
    active: 0,
    completed: 0,
    posts: 0,
  });

  // UI states
  const [activeTab, setActiveTab] = useState("active"); // 'active' | 'completed' | 'posts'
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);

  // Fetch counts and initial posts
  const fetchStatsAndPosts = async () => {
    try {
      const [activeRes, completedRes, postsRes] = await Promise.all([
        axios.get(`${BASE_URL}/project/my-rooms?status=active`, {
          withCredentials: true,
        }),
        axios.get(`${BASE_URL}/project/my-rooms?status=completed`, {
          withCredentials: true,
        }),
        axios.get(`${BASE_URL}/project/my-posts`, {
          withCredentials: true,
        }),
      ]);

      const activeList = activeRes.data?.data || [];
      const completedList = completedRes.data?.data || [];
      const postsList = postsRes.data?.data || [];

      setCounts({
        active: activeList.length,
        completed: completedList.length,
        posts: postsList.length,
      });

      setMyPosts(postsList);

      // Return current tab data to seed immediately if matching
      return {
        active: activeList,
        completed: completedList,
      };
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
      return null;
    }
  };

  // Fetch rooms for a specific status tab
  const fetchRoomsForTab = async (tab) => {
    if (tab === "posts") return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${BASE_URL}/project/my-rooms?status=${tab}`, {
        withCredentials: true,
      });
      setRooms(res.data?.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load workspaces. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    const cachedRooms = await fetchStatsAndPosts();
    if (cachedRooms && (activeTab === "active" || activeTab === "completed")) {
      setRooms(cachedRooms[activeTab] || []);
      setLoading(false);
    } else if (activeTab !== "posts") {
      fetchRoomsForTab(activeTab);
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === "posts") {
      setLoading(false);
      setError(null);
    } else {
      fetchRoomsForTab(activeTab);
    }
  }, [activeTab]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchStatsAndPosts();
      if (activeTab !== "posts") {
        await fetchRoomsForTab(activeTab);
      }
      toast.success("Dashboard refreshed");
    } catch {
      toast.error("Failed to refresh dashboard");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this project post? Associated join requests will also be removed."
      )
    ) {
      return;
    }

    setDeletingPostId(postId);
    try {
      const res = await axios.delete(`${BASE_URL}/post/${postId}`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        toast.success("Project post deleted successfully");
        setMyPosts((prev) => prev.filter((p) => p._id !== postId));
        setCounts((prev) => ({
          ...prev,
          posts: Math.max(0, prev.posts - 1),
        }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete post");
    } finally {
      setDeletingPostId(null);
    }
  };

  const getFolderColor = (template) => {
    switch (template?.toLowerCase()) {
      case "react":
      case "reactjs":
        return "text-[#61dafb]";
      case "vue":
      case "vuejs":
        return "text-[#42b883]";
      case "angular":
        return "text-[#dd0031]";
      default:
        return "text-[#b266ff]";
    }
  };

  const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : "";
    const last = lastName ? lastName.charAt(0).toUpperCase() : "";
    return `${first}${last}` || "U";
  };

  // Top Stats Bar (3 stat cards in a row: Active Workspaces lime accent, Completed muted, Posts purple accent)
  const renderStatsBar = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* 1. Active Workspaces */}
      <button
        type="button"
        onClick={() => setActiveTab("active")}
        className={`glass-card p-4 text-left transition-all duration-200 cursor-pointer flex items-center justify-between ${
          activeTab === "active"
            ? "border-[#ccff00]/40 ring-1 ring-[#ccff00]/30 shadow-[0_0_20px_rgba(204,255,0,0.06)]"
            : "hover:border-white/20"
        }`}
      >
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#52525b] font-semibold mb-1">
            Active Workspaces
          </p>
          <p className="text-2xl font-bold font-mono tracking-tight text-[#ccff00]">
            {counts.active}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/20 flex items-center justify-center text-[#ccff00] shrink-0">
          <FolderGit2 className="w-5 h-5" />
        </div>
      </button>

      {/* 2. Completed */}
      <button
        type="button"
        onClick={() => setActiveTab("completed")}
        className={`glass-card p-4 text-left transition-all duration-200 cursor-pointer flex items-center justify-between ${
          activeTab === "completed"
            ? "border-white/30 ring-1 ring-white/20 shadow-[0_0_20px_rgba(255,255,255,0.04)]"
            : "hover:border-white/20"
        }`}
      >
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#52525b] font-semibold mb-1">
            Completed
          </p>
          <p className="text-2xl font-bold font-mono tracking-tight text-[#f0f0f0]">
            {counts.completed}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-[#a1a1aa] shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </button>

      {/* 3. Posts */}
      <button
        type="button"
        onClick={() => setActiveTab("posts")}
        className={`glass-card p-4 text-left transition-all duration-200 cursor-pointer flex items-center justify-between ${
          activeTab === "posts"
            ? "border-[#b266ff]/40 ring-1 ring-[#b266ff]/30 shadow-[0_0_20px_rgba(178,102,255,0.08)]"
            : "hover:border-white/20"
        }`}
      >
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#52525b] font-semibold mb-1">
            Posts
          </p>
          <p className="text-2xl font-bold font-mono tracking-tight text-[#b266ff]">
            {counts.posts}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#b266ff]/10 border border-[#b266ff]/20 flex items-center justify-center text-[#b266ff] shrink-0">
          <FileCode2 className="w-5 h-5" />
        </div>
      </button>
    </div>
  );

  // Underline tabs navigation
  const renderTabsNav = () => (
    <div className="flex items-center justify-between border-b border-white/[0.07] mb-6">
      <div className="flex gap-6">
        {[
          { id: "active", label: "Active", count: counts.active },
          { id: "completed", label: "Completed", count: counts.completed },
          { id: "posts", label: "My Posts", count: counts.posts },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 -mb-px text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? "border-b-2 border-[#ccff00] text-[#ccff00]"
                  : "border-b-2 border-transparent text-[#52525b] hover:text-[#f0f0f0]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  isActive
                    ? "bg-[#ccff00]/15 text-[#ccff00]"
                    : "bg-white/[0.05] text-[#52525b]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 pb-2">
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          title="Refresh dashboard"
          className="p-1.5 rounded-lg text-[#52525b] hover:text-[#f0f0f0] hover:bg-white/[0.04] transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </button>

        <Link
          to="/feed"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#f0f0f0] bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.07] px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-[#ccff00]" />
          <span>New Project Post</span>
        </Link>
      </div>
    </div>
  );

  // Skeleton Loader
  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="glass-card p-4 flex flex-col justify-between min-h-[190px] animate-pulse"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 w-3/4">
                <div className="w-5 h-5 rounded bg-white/[0.06] shrink-0" />
                <div className="h-4 bg-white/[0.06] rounded w-2/3" />
              </div>
              <div className="w-2 h-2 rounded-full bg-white/[0.06]" />
            </div>
            <div className="space-y-1.5 mt-2">
              <div className="h-3 bg-white/[0.04] rounded w-full" />
              <div className="h-3 bg-white/[0.04] rounded w-4/5" />
            </div>
            <div className="flex gap-1.5 mt-3">
              <div className="h-4 w-12 bg-white/[0.04] rounded" />
              <div className="h-4 w-14 bg-white/[0.04] rounded" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.07] flex items-center justify-between">
            <div className="h-4 w-20 bg-white/[0.04] rounded" />
            <div className="h-4 w-24 bg-white/[0.04] rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  // Empty State
  const renderEmptyState = () => {
    if (activeTab === "active") {
      return (
        <div className="glass-card border-dashed p-10 text-center flex flex-col items-center justify-center my-6">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-3 text-[#52525b]">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#f0f0f0] mb-1">
            No active workspaces
          </h3>
          <p className="text-xs text-[#52525b] max-w-sm mb-5">
            You don't have any active project workspaces yet. Match with other
            developers or post an idea on the feed to start collaborating.
          </p>
          <Link
            to="/feed"
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold bg-[#ccff00] text-black px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            <span>Explore Feed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      );
    }

    if (activeTab === "completed") {
      return (
        <div className="glass-card border-dashed p-10 text-center flex flex-col items-center justify-center my-6">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-3 text-[#52525b]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#f0f0f0] mb-1">
            No completed projects yet
          </h3>
          <p className="text-xs text-[#52525b] max-w-sm">
            Completed project rooms will be showcased here as your verified
            track record of collaborative achievements.
          </p>
        </div>
      );
    }

    // activeTab === 'posts'
    return (
      <div className="glass-card border-dashed p-10 text-center flex flex-col items-center justify-center my-6">
        <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-3 text-[#52525b]">
          <FileCode2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#f0f0f0] mb-1">
          No project posts yet
        </h3>
        <p className="text-xs text-[#52525b] max-w-sm mb-5">
          Share your project idea, required tech stack, and role needed to
          attract contributors and co-founders.
        </p>
        <Link
          to="/feed"
          className="inline-flex items-center gap-2 text-xs font-mono font-semibold bg-[#ccff00] text-black px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Project Post</span>
        </Link>
      </div>
    );
  };

  // GitHub-style Workspace / Room Card
  const renderWorkspaceCards = () => {
    if (loading) return renderSkeleton();
    if (error) {
      return (
        <div className="glass-card border-red-500/20 bg-red-500/5 p-6 text-center flex flex-col items-center justify-center">
          <AlertCircle className="w-6 h-6 text-red-400 mb-2" />
          <p className="text-xs text-red-300 mb-4">{error}</p>
          <button
            onClick={() => fetchRoomsForTab(activeTab)}
            className="inline-flex items-center gap-1.5 text-xs font-mono bg-white/[0.06] hover:bg-white/[0.1] text-[#f0f0f0] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      );
    }

    if (rooms.length === 0) return renderEmptyState();

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => {
          const title =
            room.title ||
            room.projectPostId?.project?.title ||
            "Untitled Project";
          const description =
            room.projectPostId?.content ||
            "Collaborative development workspace.";
          const tags =
            room.projectPostId?.project?.techStack?.length > 0
              ? room.projectPostId.project.techStack
              : [room.template, room.lastLanguage].filter(Boolean);

          const members = room.members || [];
          const status = room.status || "active";

          return (
            <div
              key={room.roomId || room._id}
              className="glass-card glass-card-hover p-4 flex flex-col justify-between group transition-all duration-200 hover:shadow-[0_0_30px_rgba(178,102,255,0.08)] hover:border-white/[0.14]"
            >
              <div>
                {/* Top row: Folder icon + Project title + status dot */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Folder
                      className={`w-4 h-4 shrink-0 ${getFolderColor(
                        room.template
                      )}`}
                    />
                    <Link
                      to={`/project/room/${room.roomId}`}
                      className="font-bold text-sm text-[#f0f0f0] truncate group-hover:text-white transition-colors"
                      title={title}
                    >
                      {title}
                    </Link>
                  </div>
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      status === "completed"
                        ? "bg-[#52525b]"
                        : "bg-[#ccff00] shadow-[0_0_8px_rgba(204,255,0,0.6)]"
                    }`}
                    title={status === "completed" ? "Completed" : "Active"}
                  />
                </div>

                {/* Middle: Description (12px, muted, 2 lines max) */}
                <p className="text-xs text-[#52525b] line-clamp-2 leading-relaxed min-h-[32px]">
                  {description}
                </p>

                {/* Tags row: Tech stack mono badges */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-zinc-300"
                    >
                      {tag}
                    </span>
                  ))}
                  {tags.length > 3 && (
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[#52525b]">
                      +{tags.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom row: Last updated timestamp + collaborator avatars + Open Workspace button */}
              <div className="mt-4 pt-3 border-t border-white/[0.07] flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Collaborator avatars (stacked 20px) */}
                  <div className="flex items-center -space-x-1.5 overflow-hidden shrink-0">
                    {members.length > 0 ? (
                      members.slice(0, 3).map((member, idx) =>
                        member.photoUrl ? (
                          <img
                            key={member._id || idx}
                            src={member.photoUrl}
                            alt={member.firstName || "Member"}
                            title={`${member.firstName || ""} ${
                              member.lastName || ""
                            }`.trim()}
                            className="w-5 h-5 rounded-full object-cover ring-1 ring-[#111113]"
                          />
                        ) : (
                          <div
                            key={member._id || idx}
                            title={`${member.firstName || ""} ${
                              member.lastName || ""
                            }`.trim()}
                            className="w-5 h-5 rounded-full bg-white/[0.08] text-[9px] font-mono font-semibold text-[#f0f0f0] flex items-center justify-center ring-1 ring-[#111113]"
                          >
                            {getInitials(member.firstName, member.lastName)}
                          </div>
                        )
                      )
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-white/[0.05] ring-1 ring-[#111113] flex items-center justify-center text-[9px] text-[#52525b]">
                        U
                      </div>
                    )}
                    {members.length > 3 && (
                      <div className="w-5 h-5 rounded-full bg-white/[0.08] text-[8px] font-mono text-zinc-400 flex items-center justify-center ring-1 ring-[#111113]">
                        +{members.length - 3}
                      </div>
                    )}
                  </div>

                  {/* Last updated timestamp (mono, muted) */}
                  <span className="font-mono text-[11px] text-[#52525b] truncate">
                    {timeAgo(room.updatedAt || room.createdAt) || "recently"}
                  </span>
                </div>

                {/* Open Workspace button (lime ghost) */}
                <Link
                  to={`/project/room/${room.roomId}`}
                  className="inline-flex items-center gap-1 text-xs font-mono font-medium text-[#ccff00] hover:bg-[#ccff00]/10 px-2.5 py-1 rounded transition-colors group/btn shrink-0"
                >
                  <span>Open Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Condensed List View for Project Posts (My Posts tab)
  const renderMyPostsList = () => {
    if (loading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="glass-card p-4 animate-pulse flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-white/[0.06] rounded w-1/3" />
                <div className="h-3 bg-white/[0.04] rounded w-2/3" />
                <div className="h-3 bg-white/[0.04] rounded w-1/4" />
              </div>
              <div className="h-8 w-32 bg-white/[0.05] rounded" />
            </div>
          ))}
        </div>
      );
    }

    if (myPosts.length === 0) return renderEmptyState();

    return (
      <div className="space-y-3">
        {myPosts.map((post) => {
          const title = post.project?.title || "Untitled Project Post";
          const preview = post.content || "No project overview provided.";
          const techStack = post.project?.techStack || [];
          const dateFormatted = timeAgo(post.createdAt) || "recently";

          return (
            <div
              key={post._id}
              className="glass-card glass-card-hover p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200 hover:shadow-[0_0_30px_rgba(178,102,255,0.08)]"
            >
              {/* Left: post preview info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-bold text-sm text-[#f0f0f0] truncate max-w-md">
                    {title}
                  </span>
                  {post.isMatched ? (
                    <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20 font-medium">
                      Matched
                    </span>
                  ) : post.project?.isOpen ? (
                    <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[#b266ff]/10 text-[#b266ff] border border-[#b266ff]/20 font-medium">
                      Open
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-white/[0.04] text-[#52525b] border border-white/[0.06] font-medium">
                      Closed
                    </span>
                  )}

                  {post.project?.roleNeeded && (
                    <span className="font-mono text-[10px] text-zinc-400 bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.05]">
                      Role: {post.project.roleNeeded}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#52525b] line-clamp-1 mt-1.5 max-w-3xl">
                  {preview}
                </p>

                <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                  {techStack.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {techStack.slice(0, 4).map((tech, idx) => (
                        <span
                          key={idx}
                          className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-zinc-300"
                        >
                          {tech}
                        </span>
                      ))}
                      {techStack.length > 4 && (
                        <span className="font-mono text-[10px] text-[#52525b]">
                          +{techStack.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  <span className="font-mono text-[11px] text-[#52525b] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {dateFormatted}
                  </span>
                </div>
              </div>

              {/* Right: Actions (View Applicants purple outline + Delete button ghost red) */}
              <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                {post.isMatched && post.roomId && (
                  <Link
                    to={`/project/room/${post.roomId}`}
                    className="text-xs font-mono font-medium text-[#ccff00] hover:bg-[#ccff00]/10 px-3 py-1.5 rounded-lg border border-[#ccff00]/30 transition-all flex items-center gap-1.5"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Workspace</span>
                  </Link>
                )}

                <Link
                  to={`/project/${post._id}/requests`}
                  className="border border-[#b266ff]/40 text-[#b266ff] hover:bg-[#b266ff]/10 hover:border-[#b266ff] text-xs font-mono font-medium px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all group/btn"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>View Applicants</span>
                  {post.pendingRequestCount > 0 && (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-[#b266ff] text-black">
                      {post.pendingRequestCount}
                    </span>
                  )}
                </Link>

                <button
                  type="button"
                  onClick={() => handleDeletePost(post._id)}
                  disabled={deletingPostId === post._id}
                  title="Delete project post"
                  className="text-[#52525b] hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {deletingPostId === post._id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#09090b] text-[#f0f0f0] p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#f0f0f0]">
              My Projects
            </h1>
            <p className="text-xs text-[#52525b] mt-1 font-mono">
              Manage collaborative workspaces, track status, and review applicant requests
            </p>
          </div>
        </div>

        {/* Top Stats Bar */}
        {renderStatsBar()}

        {/* Underline Tabs Navigation */}
        {renderTabsNav()}

        {/* Tab Content */}
        {activeTab === "posts" ? renderMyPostsList() : renderWorkspaceCards()}
      </div>
    </div>
  );
};

export default MyProjects;
