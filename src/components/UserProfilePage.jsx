import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useSelector } from "react-redux";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  FolderGit2,
  FileCode2,
  Cpu,
  User,
  Sparkles,
  Terminal,
  Layers,
  Code2,
} from "lucide-react";
import { toast } from "sonner";

// Profile section components
import ProfileHeader from "./profile/ProfileHeader";
import AboutSection from "./profile/AboutSection";
import PinnedSnippets from "./profile/PinnedSnippets";
import ShippedTogether from "./profile/ShippedTogether";
import SOSTrackRecord from "./profile/SOSTrackRecord";

// Skeleton loader matching actual layout
const ProfileSkeleton = () => (
  <div className="w-full max-w-4xl mx-auto px-4 animate-pulse">
    {/* Cover skeleton */}
    <div className="h-40 sm:h-52 w-full rounded-2xl bg-white/5 border border-white/10 mb-0" />
    {/* Left-aligned 64px square avatar skeleton */}
    <div className="-mt-8 ml-6 mb-4">
      <div className="w-16 h-16 rounded-xl bg-white/10 border-2 border-white/20" />
    </div>
    {/* Left-aligned Name + headline */}
    <div className="flex flex-col ml-6 gap-2.5 mb-6">
      <div className="h-7 w-52 rounded-lg bg-white/10" />
      <div className="h-4 w-72 rounded-lg bg-white/5" />
      <div className="flex gap-2 mt-1">
        <div className="h-5 w-16 rounded-md bg-white/5" />
        <div className="h-5 w-20 rounded-md bg-white/5" />
        <div className="h-5 w-14 rounded-md bg-white/5" />
      </div>
    </div>
    {/* Stats row skeleton */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[#111113] border border-white/[0.07] mb-8">
      <div className="h-10 bg-white/5 rounded-lg" />
      <div className="h-10 bg-white/5 rounded-lg" />
      <div className="h-10 bg-white/5 rounded-lg" />
      <div className="h-10 bg-white/5 rounded-lg" />
    </div>
    {/* Tabs skeleton */}
    <div className="flex gap-6 border-b border-white/[0.07] pb-3 mb-6">
      <div className="h-5 w-16 rounded bg-white/10" />
      <div className="h-5 w-20 rounded bg-white/5" />
      <div className="h-5 w-16 rounded bg-white/5" />
      <div className="h-5 w-16 rounded bg-white/5" />
    </div>
    {/* Content section skeleton */}
    <div className="space-y-6">
      <div className="h-44 rounded-xl bg-[#111113] border border-white/[0.07]" />
      <div className="h-36 rounded-xl bg-[#111113] border border-white/[0.07]" />
    </div>
  </div>
);

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const loggedInUser = useSelector((store) => store.user);
  const onlineUsers = useSelector((store) => store.onlineUsers);

  const [profile, setProfile] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("none");
  const [connectionRequestId, setConnectionRequestId] = useState(null);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [stats, setStats] = useState({ connectionCount: 0, totalReactions: 0, postCount: 0 });
  const [pinnedPosts, setPinnedPosts] = useState([]);
  const [shippedTogether, setShippedTogether] = useState([]);
  const [sosTrackRecord, setSosTrackRecord] = useState(null);
  const [activeTab, setActiveTab] = useState("about"); // "about" | "projects" | "posts" | "stack"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isOwnProfile = loggedInUser?._id?.toString() === userId?.toString();
  const isOnline = onlineUsers.includes(userId);

  // Reactive currentRoom
  const currentRoom = useMemo(() => {
    if (!onlineUsers.includes(userId) || !shippedTogether?.length) return null;
    const activeRoom = shippedTogether.find((r) => r.status === "active");
    return activeRoom
      ? {
          title: activeRoom.title,
          members: activeRoom.members?.map((m) => m.firstName) || [],
        }
      : null;
  }, [onlineUsers, shippedTogether, userId]);

  // Aggregate unique shipped technologies across all collaborative projects
  const shippedTechnologies = useMemo(() => {
    if (!shippedTogether || shippedTogether.length === 0) return [];
    const techSet = new Set();
    shippedTogether.forEach((room) => {
      if (Array.isArray(room.techStack)) {
        room.techStack.forEach((t) => {
          if (t && typeof t === "string") techSet.add(t.trim());
        });
      }
    });
    return Array.from(techSet);
  }, [shippedTogether]);

  // Dynamic document title
  useEffect(() => {
    if (profile) {
      const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
      document.title = fullName ? `${fullName} | OctoPair` : "OctoPair";
    }
    return () => {
      document.title = "OctoPair";
    };
  }, [profile]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${BASE_URL}/user/${userId}`, {
          withCredentials: true,
        });

        setProfile(res.data.user);
        setConnectionStatus(res.data.connectionStatus || "none");
        setConnectionRequestId(res.data.connectionRequestId || null);
        setIsFollowingUser(res.data.isFollowing);
        setStats(res.data.stats || { connectionCount: 0, totalReactions: 0, postCount: 0 });
        setPinnedPosts(res.data.pinnedPosts || []);
        setShippedTogether(res.data.shippedTogether || []);
        setSosTrackRecord(res.data.sosTrackRecord || null);
      } catch (err) {
        setError(
          err?.response?.status === 404
            ? "This developer doesn't exist."
            : "Failed to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchProfile();
  }, [userId]);

  // Connection handlers
  const handleConnect = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/request/send/interested/${userId}`,
        {},
        { withCredentials: true }
      );
      setConnectionStatus("pending");
      if (res.data?.data?._id) {
        setConnectionRequestId(res.data.data._id);
      }
      toast.success("Connection request sent!");
    } catch (err) {
      console.error("Connect error:", err);
      toast.error(err.response?.data?.message || "Failed to send connection request");
    }
  };

  const handleAcceptConnection = async () => {
    if (!connectionRequestId) return;
    try {
      await axios.post(
        `${BASE_URL}/request/review/accepted/${connectionRequestId}`,
        {},
        { withCredentials: true }
      );
      setConnectionStatus("accepted");
      setStats((prev) => ({
        ...prev,
        connectionCount: (prev.connectionCount || 0) + 1,
      }));
      toast.success("Connection request accepted!");
    } catch (err) {
      console.error("Accept connection error:", err);
      toast.error(err.response?.data?.message || "Failed to accept connection");
    }
  };

  const handleRejectConnection = async () => {
    if (!connectionRequestId) return;
    try {
      await axios.post(
        `${BASE_URL}/request/review/rejected/${connectionRequestId}`,
        {},
        { withCredentials: true }
      );
      setConnectionStatus("rejected");
      toast.success("Connection request declined");
    } catch (err) {
      console.error("Reject connection error:", err);
      toast.error(err.response?.data?.message || "Failed to reject connection");
    }
  };

  // Follow / Unfollow handlers
  const handleFollow = async () => {
    try {
      await axios.post(`${BASE_URL}/user/follow/${userId}`, {}, { withCredentials: true });
      setIsFollowingUser(true);
      setProfile((prev) => prev && { ...prev, followersCount: (prev.followersCount || 0) + 1 });
      toast.success(`Followed ${profile?.firstName || "user"}!`);
    } catch (err) {
      console.error("Follow error:", err);
      toast.error(err.response?.data?.message || "Failed to update follow status");
    }
  };

  const handleUnfollow = async () => {
    try {
      await axios.post(`${BASE_URL}/user/unfollow/${userId}`, {}, { withCredentials: true });
      setIsFollowingUser(false);
      setProfile((prev) => prev && { ...prev, followersCount: Math.max(0, (prev.followersCount || 0) - 1) });
      toast.success(`Unfollowed ${profile?.firstName || "user"}`);
    } catch (err) {
      console.error("Unfollow error:", err);
      toast.error(err.response?.data?.message || "Failed to update follow status");
    }
  };

  // Open to Pair toggle
  const handleTogglePair = async () => {
    try {
      const res = await axios.patch(`${BASE_URL}/profile/toggle-pair`, {}, { withCredentials: true });
      setProfile((prev) => prev && { ...prev, openToPair: res.data.openToPair });
    } catch (err) {
      console.error("Toggle pair error:", err);
      toast.error(err.response?.data?.message || "Failed to toggle pair status");
    }
  };

  // Loading view
  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col pt-6">
        <div className="w-full max-w-4xl mx-auto px-4 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#52525b] hover:text-[#f0f0f0] transition text-sm w-fit cursor-pointer"
          >
            <ArrowLeft size={15} /> Back
          </button>
        </div>
        <ProfileSkeleton />
      </div>
    );
  }

  // Error view
  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center p-8 glass-card border border-white/[0.07] rounded-xl max-w-sm w-full">
          <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-[#52525b]">
            <User size={26} />
          </div>
          <h2 className="text-[#f0f0f0] font-bold text-lg mb-1.5 tracking-tight">Developer Not Found</h2>
          <p className="text-[#52525b] text-xs mb-6 leading-relaxed">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-2.5 px-4 bg-[#ccff00] text-black rounded-lg text-xs font-bold uppercase tracking-wider font-mono hover:bg-[#d9ff33] transition-all cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Tabs configuration
  const tabs = [
    { id: "about", label: "About", count: null },
    { id: "projects", label: "Projects", count: shippedTogether?.length || 0 },
    { id: "posts", label: "Posts", count: pinnedPosts?.length || stats?.postCount || 0 },
    { id: "stack", label: "Stack", count: profile?.skills?.length || 0 },
  ];

  return (
    <div className="min-h-[80vh] pb-16 pt-6">
      {/* Top back button */}
      <div className="w-full max-w-4xl mx-auto px-4 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#52525b] hover:text-[#f0f0f0] transition text-sm w-fit cursor-pointer font-medium"
        >
          <ArrowLeft size={15} /> Back
        </button>
      </div>

      {/* Main profile container */}
      <div className="w-full max-w-4xl mx-auto px-4">
        {/* Profile Hero Header */}
        <Motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <ProfileHeader
            user={profile}
            connectionStatus={connectionStatus}
            isFollowing={isFollowingUser}
            isOwnProfile={isOwnProfile}
            isOnline={isOnline}
            currentRoom={currentRoom}
            stats={stats}
            sosTrackRecord={sosTrackRecord}
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
            onTogglePair={handleTogglePair}
            onConnect={handleConnect}
            onAcceptConnection={handleAcceptConnection}
            onRejectConnection={handleRejectConnection}
          />
        </Motion.div>

        {/* Underline Tabs Navigation */}
        <div className="flex items-center gap-6 border-b border-white/[0.07] mb-8 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-sm flex items-center gap-2 cursor-pointer transition-colors shrink-0 ${
                  isActive
                    ? "font-bold border-b-2 border-[#ccff00] text-[#ccff00]"
                    : "font-medium text-[#52525b] hover:text-[#f0f0f0]"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`font-mono text-xs px-2 py-0.5 rounded-full ${
                      isActive
                        ? "bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20"
                        : "bg-white/5 text-[#52525b] border border-white/10"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="space-y-8">
          {/* TAB 1: ABOUT */}
          {activeTab === "about" && (
            <Motion.div
              key="about"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <AboutSection
                about={profile?.about}
                skills={profile?.skills}
                isOwnProfile={isOwnProfile}
              />
              <SOSTrackRecord
                sosTrackRecord={sosTrackRecord}
                isOwnProfile={isOwnProfile}
              />
            </Motion.div>
          )}

          {/* TAB 2: PROJECTS */}
          {activeTab === "projects" && (
            <Motion.div
              key="projects"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ShippedTogether
                rooms={shippedTogether}
                isOwnProfile={isOwnProfile}
                userId={userId}
                user={profile}
              />
            </Motion.div>
          )}

          {/* TAB 3: POSTS / PINNED SNIPPETS */}
          {activeTab === "posts" && (
            <Motion.div
              key="posts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PinnedSnippets
                posts={pinnedPosts}
                isOwnProfile={isOwnProfile}
              />
            </Motion.div>
          )}

          {/* TAB 4: TECH STACK SHOWCASE */}
          {activeTab === "stack" && (
            <Motion.div
              key="stack"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="glass-card p-6 rounded-xl border border-white/[0.07]">
                <div className="flex items-center gap-2 mb-4">
                  <Cpu className="w-5 h-5 text-[#ccff00]" />
                  <h2 className="text-lg font-bold text-[#f0f0f0] tracking-tight">
                    Primary Tech Stack
                  </h2>
                </div>
                <p className="text-xs text-[#52525b] mb-4">
                  Core programming languages, frameworks, and developer tools.
                </p>

                {profile?.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="rounded-md px-3 py-1.5 text-xs font-mono font-bold bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/25 shadow-[0_0_12px_rgba(204,255,0,0.1)]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-mono text-[#52525b]">
                    No skills specified yet.
                  </p>
                )}
              </div>

              {/* Debug SOS Specializations */}
              {sosTrackRecord?.topAreas && sosTrackRecord.topAreas.length > 0 && (
                <div className="glass-card p-6 rounded-xl border border-white/[0.07]">
                  <div className="flex items-center gap-2 mb-4">
                    <Terminal className="w-5 h-5 text-[#b266ff]" />
                    <h2 className="text-lg font-bold text-[#f0f0f0] tracking-tight">
                      Debug SOS Specializations
                    </h2>
                  </div>
                  <p className="text-xs text-[#52525b] mb-4">
                    Verified topics and problem domains where this builder actively helps the community.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sosTrackRecord.topAreas.map((area, idx) => (
                      <span
                        key={idx}
                        className="bg-[#b266ff]/10 border border-[#b266ff]/25 text-[#b266ff] text-xs font-mono px-3 py-1.5 rounded-md flex items-center gap-2"
                      >
                        <span>#{area.tag?.replace(/^#+/, "")}</span>
                        <span className="text-[10px] font-mono font-bold bg-[#b266ff]/20 text-[#f0f0f0] rounded px-1.5 py-0.5">
                          {area.count} {area.count === 1 ? "solve" : "solves"}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Shipped Project Technologies */}
              {shippedTechnologies.length > 0 && (
                <div className="glass-card p-6 rounded-xl border border-white/[0.07]">
                  <div className="flex items-center gap-2 mb-4">
                    <Layers className="w-5 h-5 text-[#f0f0f0]" />
                    <h2 className="text-lg font-bold text-[#f0f0f0] tracking-tight">
                      Technologies Shipped in Projects
                    </h2>
                  </div>
                  <p className="text-xs text-[#52525b] mb-4">
                    Tooling and frameworks utilized in collaborative workspaces and shipped products.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {shippedTechnologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-mono text-[#f0f0f0] bg-white/5 border border-white/[0.08] px-3 py-1.5 rounded-md"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
