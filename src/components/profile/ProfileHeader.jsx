import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  MapPin,
  MessageSquare,
  UserPlus,
  UserCheck,
  Edit2,
  Clock,
  Check,
  X,
  Share2,
  Globe,
  Zap,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { timeAgo } from "../../utils/timeAgo";

const ProfileHeader = ({
  user,
  connectionStatus = "none",
  isFollowing,
  isOwnProfile,
  isOnline,
  currentRoom,
  stats,
  sosTrackRecord,
  onFollow,
  onUnfollow,
  onTogglePair,
  onConnect,
  onAcceptConnection,
  onRejectConnection,
}) => {
  if (!user) return null;

  const {
    _id,
    firstName,
    lastName,
    photoUrl,
    headline,
    location,
    followersCount = 0,
    helpfulAnswers = 0,
    openToPair,
    lastSeen,
    twitterUrl,
    portfolioUrl,
    isPremium,
    skills = [],
  } = user;

  const fullName = `${firstName || ""} ${lastName || ""}`.trim();
  const isUsuallyResponsive = Boolean(
    helpfulAnswers >= 10 ||
      (sosTrackRecord?.isResponsive && sosTrackRecord?.totalSolved >= 10)
  );

  const handleCopyProfileUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Profile link copied to clipboard!");
    } catch {
      toast.error("Failed to copy profile URL");
    }
  };

  const handleAvatarError = (e) => {
    e.target.onerror = null;
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      fullName || "User"
    )}&background=111113&color=ccff00`;
  };

  return (
    <div className="glass-card border border-white/[0.07] rounded-2xl overflow-hidden mb-8">
      {/* Gradient Cover Banner (NOT a photograph) */}
      <div className="h-40 sm:h-52 w-full rounded-t-2xl relative overflow-hidden bg-gradient-to-r from-[#ccff00]/10 via-transparent to-[#b266ff]/10 border-b border-white/[0.07]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-40 pointer-events-none" />
        {isPremium && (
          <div className="absolute top-4 right-4 bg-[#b266ff]/15 text-[#b266ff] border border-[#b266ff]/30 text-[10px] font-mono font-bold px-2.5 py-1 rounded-md tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(178,102,255,0.2)]">
            <Sparkles className="w-3 h-3 text-[#b266ff]" />
            PRO MEMBER
          </div>
        )}
      </div>

      <div className="px-6 pb-6 relative">
        {/* Top Row: Avatar & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-8 sm:-mt-10 mb-4 gap-4">
          {/* 64px rounded-xl square avatar */}
          <div className="relative w-fit z-10">
            <img
              src={
                photoUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  fullName || "User"
                )}&background=111113&color=ccff00`
              }
              alt={fullName}
              onError={handleAvatarError}
              className="w-16 h-16 rounded-xl border-2 border-[#ccff00] object-cover bg-[#111113] shadow-[0_0_15px_rgba(204,255,0,0.15)]"
            />
            {isOnline && (
              <div
                className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#ccff00] rounded-full border-2 border-[#111113] shadow-[0_0_8px_rgba(204,255,0,0.6)]"
                title="Online now"
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCopyProfileUrl}
              title="Share profile"
              className="flex items-center gap-1.5 bg-transparent border border-white/10 text-[#a0a0a0] hover:border-white/20 hover:text-white px-3 py-2 rounded-lg transition-colors text-xs font-semibold cursor-pointer"
            >
              <Share2 size={14} />
              <span className="hidden sm:inline">Share</span>
            </button>

            {isOwnProfile ? (
              <Link
                to="/profile"
                className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-[#f0f0f0] px-4 py-2 rounded-lg transition-colors border border-white/10 text-xs font-semibold"
              >
                <Edit2 size={14} />
                <span>Edit Profile</span>
              </Link>
            ) : (
              <>
                {/* Connection button states */}
                {connectionStatus === "none" && (
                  <button
                    onClick={onConnect}
                    className="flex items-center gap-1.5 bg-[#ccff00] text-black font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#d9ff33] transition-all shadow-[0_0_15px_rgba(204,255,0,0.2)] cursor-pointer"
                  >
                    <UserPlus size={14} />
                    <span>Connect</span>
                  </button>
                )}

                {connectionStatus === "pending" && (
                  <button
                    disabled
                    className="flex items-center gap-1.5 bg-transparent border border-white/10 text-[#52525b] px-4 py-2 rounded-lg text-xs font-mono cursor-not-allowed"
                  >
                    <Clock size={14} />
                    <span>Requested</span>
                  </button>
                )}

                {(connectionStatus === "received" ||
                  connectionStatus === "pending_incoming") && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onAcceptConnection}
                      className="flex items-center gap-1.5 bg-[#ccff00] text-black px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-[#d9ff33] transition-all cursor-pointer"
                    >
                      <Check size={14} />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={onRejectConnection}
                      className="flex items-center gap-1.5 bg-transparent border border-white/10 text-[#52525b] hover:text-red-400 hover:border-red-400/30 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    >
                      <X size={14} />
                      <span>Decline</span>
                    </button>
                  </div>
                )}

                {connectionStatus === "accepted" && (
                  <div className="flex items-center gap-1.5 text-xs font-mono text-[#ccff00] bg-[#ccff00]/10 border border-[#ccff00]/25 px-2.5 py-1.5 rounded-lg">
                    <Check size={13} />
                    <span>Connected</span>
                  </div>
                )}

                {(connectionStatus === "rejected" ||
                  connectionStatus === "ignored") && (
                  <button
                    disabled
                    className="flex items-center gap-1.5 bg-transparent border border-white/10 text-[#52525b] px-3.5 py-2 rounded-lg text-xs font-mono cursor-not-allowed"
                  >
                    <X size={14} />
                    <span>Declined</span>
                  </button>
                )}

                {/* Message button (ghost secondary) */}
                <Link
                  to={`/chat/${_id}`}
                  className="flex items-center gap-1.5 bg-transparent border border-white/10 text-[#a0a0a0] hover:border-white/20 hover:text-white px-4 py-2 rounded-lg transition-colors text-xs font-semibold cursor-pointer"
                >
                  <MessageSquare size={14} />
                  <span>Message</span>
                </Link>

                {/* Follow toggle button */}
                <button
                  onClick={isFollowing ? onUnfollow : onFollow}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isFollowing
                      ? "bg-transparent border border-white/10 text-[#52525b] hover:text-red-400 hover:border-red-400/30"
                      : "border border-[#ccff00]/40 text-[#ccff00] hover:bg-[#ccff00]/10"
                  }`}
                >
                  {isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
                  <span>{isFollowing ? "Following" : "Follow"}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Info: Name (22px bold) & Badges */}
        <div className="mt-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[22px] font-bold text-[#f0f0f0] tracking-tight">
              {fullName}
            </h1>
            {isUsuallyResponsive && (
              <span className="flex items-center gap-1.5 bg-[#ccff00]/10 text-[#ccff00] text-[11px] font-mono px-2.5 py-0.5 rounded-md border border-[#ccff00]/25 font-bold">
                <Zap size={11} className="text-[#ccff00]" />
                Usually responsive
              </span>
            )}
          </div>
          {headline && <p className="text-sm text-[#52525b] mt-0.5">{headline}</p>}

          {/* Skills in header: mono badges */}
          {skills && skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {skills.slice(0, 5).map((skill, idx) => (
                <span
                  key={idx}
                  className="rounded-md px-2 py-0.5 text-[11px] font-mono font-bold bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 5 && (
                <span className="rounded-md px-2 py-0.5 text-[11px] font-mono text-[#52525b] bg-white/5 border border-white/10">
                  +{skills.length - 5}
                </span>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center mt-3 text-xs text-[#52525b] gap-4">
            {location && (
              <div className="flex items-center gap-1">
                <MapPin size={13} className="text-[#b266ff]" />
                <span>{location}</span>
              </div>
            )}

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {twitterUrl && (
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#f0f0f0] transition-colors flex items-center gap-1 text-xs"
                >
                  <Share2 size={13} />
                  <span>Twitter / X</span>
                </a>
              )}
              {portfolioUrl && (
                <a
                  href={portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#f0f0f0] transition-colors flex items-center gap-1 text-xs"
                >
                  <Globe size={13} />
                  <span>Portfolio</span>
                </a>
              )}
            </div>
          </div>

          {/* Live Presence */}
          <div className="mt-4 flex items-center gap-2 text-xs">
            {isOnline && currentRoom ? (
              <div className="bg-[#b266ff]/10 text-[#b266ff] px-3 py-1.5 rounded-lg border border-[#b266ff]/20 flex items-center gap-2 font-mono">
                <span className="w-2 h-2 bg-[#b266ff] rounded-full animate-pulse" />
                <span>
                  In ProjectRoom &quot;{currentRoom.title}&quot; with @
                  {currentRoom.members?.join(", ")}
                </span>
              </div>
            ) : isOnline && openToPair ? (
              <div className="flex items-center gap-3">
                <div className="bg-[#ccff00]/10 text-[#ccff00] px-3 py-1.5 rounded-md border border-[#ccff00]/25 flex items-center gap-2 font-mono text-xs">
                  <Sparkles size={13} className="text-[#ccff00]" />
                  <span>Open to pair</span>
                </div>
                {!isOwnProfile && (
                  <Link
                    to={`/chat/${_id}`}
                    className="text-xs font-mono bg-white/5 border border-white/10 text-[#f0f0f0] hover:text-[#ccff00] hover:border-[#ccff00]/40 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
                  >
                    <Users size={12} />
                    <span>Request to Pair</span>
                  </Link>
                )}
              </div>
            ) : isOnline ? (
              <div className="bg-[#ccff00]/10 text-[#ccff00] px-3 py-1.5 rounded-md border border-[#ccff00]/20 flex items-center gap-2 font-mono text-xs">
                <span className="w-2 h-2 bg-[#ccff00] rounded-full animate-pulse" />
                <span>Online now</span>
              </div>
            ) : (
              <div className="text-[#52525b] flex items-center gap-2 font-mono text-xs">
                <span className="w-2 h-2 bg-zinc-600 rounded-full" />
                <span>{lastSeen ? `Last seen ${timeAgo(lastSeen)}` : "Offline"}</span>
              </div>
            )}
          </div>

          {/* Stats Row */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[#111113] border border-white/[0.07] text-[#f0f0f0]">
            <div className="flex flex-col">
              <span className="font-mono font-bold text-xl text-[#f0f0f0]">
                {followersCount}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#52525b] mt-0.5">
                Followers
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono font-bold text-xl text-[#f0f0f0]">
                {stats?.connectionCount || 0}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#52525b] mt-0.5">
                Connections
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono font-bold text-xl text-[#f0f0f0]">
                {stats?.totalReactions || 0}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#52525b] mt-0.5">
                Reactions
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono font-bold text-xl text-[#f0f0f0]">
                {helpfulAnswers}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#52525b] mt-0.5">
                Problems Solved
              </span>
            </div>
          </div>

          {/* Open to pair toggle for own profile */}
          {isOwnProfile && (
            <div className="mt-6 p-4 bg-[#111113] rounded-xl border border-white/[0.07] flex items-center justify-between max-w-sm">
              <div className="flex flex-col">
                <span className="text-[#f0f0f0] font-semibold text-xs">
                  Open to Pair
                </span>
                <span className="text-[#52525b] text-[11px]">
                  Let others know you&apos;re ready to code
                </span>
              </div>
              <button
                type="button"
                onClick={onTogglePair}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  openToPair ? "bg-[#ccff00]" : "bg-white/10"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                    openToPair
                      ? "translate-x-6 bg-black"
                      : "translate-x-1 bg-white"
                  }`}
                />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
