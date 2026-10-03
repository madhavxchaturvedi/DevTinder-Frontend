import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useSelector } from "react-redux";
import { motion as Motion } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";
import toast from "react-hot-toast";

// Profile section components
import ProfileHeader from "./profile/ProfileHeader";
import AboutSection from "./profile/AboutSection";
import PinnedSnippets from "./profile/PinnedSnippets";
import ShippedTogether from "./profile/ShippedTogether";
import SOSTrackRecord from "./profile/SOSTrackRecord";

// ── Skeleton loader ────────────────────────────────────────────────
const ProfileSkeleton = () => (
  <div className="w-full max-w-4xl mx-auto px-4 animate-pulse">
    {/* Cover skeleton */}
    <div className="h-36 sm:h-48 rounded-3xl bg-white/5 mb-0" />
    {/* Left-aligned Avatar skeleton */}
    <div className="-mt-14 ml-6 mb-4">
      <div className="w-28 h-28 rounded-full bg-white/10 ring-4 ring-[#0a0a0a]" />
    </div>
    {/* Left-aligned Name + headline */}
    <div className="flex flex-col ml-6 gap-3 mb-6">
      <div className="h-7 w-52 rounded-lg bg-white/10" />
      <div className="h-5 w-72 rounded-lg bg-white/5" />
      <div className="flex gap-3">
        <div className="h-5 w-20 rounded-full bg-white/10" />
        <div className="h-5 w-20 rounded-full bg-white/10" />
        <div className="h-5 w-20 rounded-full bg-white/10" />
      </div>
    </div>
    {/* Content sections */}
    <div className="space-y-6 mt-8">
      <div className="h-32 rounded-2xl bg-white/5" />
      <div className="h-48 rounded-2xl bg-white/5" />
      <div className="h-36 rounded-2xl bg-white/5" />
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isOwnProfile = loggedInUser?._id?.toString() === userId?.toString();
  const isOnline = onlineUsers.includes(userId);

  // ── Reactive currentRoom ───────────────────────────────────────
  const currentRoom = useMemo(/* onlineUsers */ () => {
    if (!onlineUsers.includes(userId) || !shippedTogether?.length) return null;
    const activeRoom = shippedTogether.find((r) => r.status === "active");
    return activeRoom
      ? {
          title: activeRoom.title,
          members: activeRoom.members?.map((m) => m.firstName) || [],
        }
      : null;
  }, [onlineUsers, shippedTogether, userId]);

  // Dynamic document title
  useEffect(() => {
    if (profile) {
      const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
      document.title = fullName ? `${fullName} | DevTinder` : 'DevTinder';
    }
    return () => {
      document.title = 'DevTinder';
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

  // ── Connection handlers ────────────────────────────────────────
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

  // ── Follow / Unfollow handlers ─────────────────────────────────
  const handleFollow = async () => {
    try {
      await axios.post(`${BASE_URL}/user/follow/${userId}`, {}, { withCredentials: true });
      setIsFollowingUser(true);
      setProfile((prev) => prev && { ...prev, followersCount: (prev.followersCount || 0) + 1 });
      toast.success(`Followed ${profile?.firstName || 'user'}!`);
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
      toast.success(`Unfollowed ${profile?.firstName || 'user'}`);
    } catch (err) {
      console.error("Unfollow error:", err);
      toast.error(err.response?.data?.message || "Failed to update follow status");
    }
  };

  // ── Open to Pair toggle ────────────────────────────────────────
  const handleTogglePair = async () => {
    try {
      const res = await axios.patch(`${BASE_URL}/profile/toggle-pair`, {}, { withCredentials: true });
      setProfile((prev) => prev && { ...prev, openToPair: res.data.openToPair });
    } catch (err) {
      console.error("Toggle pair error:", err);
      toast.error(err.response?.data?.message || "Failed to toggle pair status");
    }
  };

  // ── Loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col pt-6">
        <div className="w-full max-w-4xl mx-auto px-4 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/40 hover:text-white transition text-sm w-fit"
          >
            <FiArrowLeft size={15} /> Back
          </button>
        </div>
        <ProfileSkeleton />
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center p-10 bg-[#121212] border border-white/10 rounded-3xl max-w-sm">
          <p className="text-5xl mb-4">😕</p>
          <h2 className="text-white font-bold text-xl mb-2">Not found</h2>
          <p className="text-[#a3a3a3] text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-[#ccff00] text-[#0a0a0a] rounded-xl font-bold hover:bg-[#bbf000] transition-colors"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] pb-16 pt-6">
      {/* Back button */}
      <div className="w-full max-w-4xl mx-auto px-4 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/40 hover:text-white transition text-sm w-fit"
        >
          <FiArrowLeft size={15} /> Back
        </button>
      </div>

      {/* ── Profile content ─────────────────────────────────────── */}
      <div className="w-full max-w-4xl mx-auto px-4">
        {/* Hero Header */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
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

        {/* ── Content sections ────────────────────────────────────── */}
        <div className="mt-8 space-y-8">
          {/* About + Skills */}
          <AboutSection about={profile?.about} skills={profile?.skills} isOwnProfile={isOwnProfile} />

          {/* Pinned Snippets / Best Work */}
          <PinnedSnippets
            posts={pinnedPosts}
            isOwnProfile={isOwnProfile}
          />

          {/* Shipped Together */}
          <ShippedTogether rooms={shippedTogether} isOwnProfile={isOwnProfile} />

          {/* Debug SOS Track Record */}
          <SOSTrackRecord sosTrackRecord={sosTrackRecord} isOwnProfile={isOwnProfile} />
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
