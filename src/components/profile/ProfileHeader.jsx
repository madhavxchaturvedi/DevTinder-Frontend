import React from 'react';
import { motion as Motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiMapPin, 
  FiMessageSquare, 
  FiUserPlus, 
  FiUserCheck, 
  FiEdit2, 
  FiClock, 
  FiCheck, 
  FiX, 
  FiShare2 
} from 'react-icons/fi';
import { FaTwitter, FaGlobe } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { timeAgo } from '../../utils/timeAgo';

const ProfileHeader = ({
  user,
  connectionStatus = 'none',
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
    coverPhoto,
    followersCount = 0,
    helpfulAnswers = 0,
    openToPair,
    lastSeen,
    twitterUrl,
    portfolioUrl,
    isPremium,
  } = user;

  const fullName = `${firstName || ''} ${lastName || ''}`.trim();
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
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'User')}&background=random`;
  };

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#121212] rounded-3xl border border-white/10 overflow-hidden"
    >
      {/* Cover Photo */}
      <div 
        className="h-36 sm:h-48 md:h-56 w-full bg-gradient-to-r from-[#ccff00]/20 to-[#a855f7]/20 relative"
        style={coverPhoto ? { backgroundImage: `url(${coverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        {isPremium && (
          <div className="absolute top-4 right-4 bg-[#ccff00] text-[#0a0a0a] text-xs font-bold px-3 py-1 rounded-full shadow-[2px_2px_0px_#0a0a0a]">
            PREMIUM
          </div>
        )}
      </div>

      <div className="px-6 pb-6 relative">
        {/* Top bar: Avatar & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 sm:-mt-20 mb-4 gap-4">
          {/* Avatar */}
          <div className="relative w-fit">
            <img 
              src={photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'User')}&background=random`} 
              alt={fullName} 
              onError={handleAvatarError}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-[#121212] object-cover bg-[#0a0a0a]"
            />
            {isOnline && (
              <div className="absolute bottom-2 right-2 w-5 h-5 bg-[#ccff00] rounded-full border-4 border-[#121212]"></div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCopyProfileUrl}
              title="Share profile"
              className="flex items-center space-x-1.5 bg-white/5 hover:bg-white/10 text-[#a3a3a3] hover:text-white px-3 py-2 rounded-xl transition-colors border border-white/10 text-sm"
            >
              <FiShare2 size={16} />
              <span className="hidden sm:inline">Share</span>
            </button>

            {isOwnProfile ? (
              <Link to="/profile" className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-[#e5e5e5] px-4 py-2 rounded-xl transition-colors border border-white/10 text-sm font-semibold">
                <FiEdit2 />
                <span>Edit Profile</span>
              </Link>
            ) : (
              <>
                {/* Connection button states */}
                {connectionStatus === 'none' && (
                  <button 
                    onClick={onConnect}
                    className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-[#e5e5e5] px-4 py-2 rounded-xl transition-colors border border-white/10 text-sm font-semibold"
                  >
                    <FiUserPlus />
                    <span>Connect</span>
                  </button>
                )}

                {connectionStatus === 'pending' && (
                  <button 
                    disabled 
                    className="flex items-center space-x-2 bg-white/5 text-white/50 px-4 py-2 rounded-xl border border-white/5 cursor-not-allowed text-sm font-semibold"
                  >
                    <FiClock />
                    <span>Requested</span>
                  </button>
                )}

                {(connectionStatus === 'received' || connectionStatus === 'pending_incoming') && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={onAcceptConnection}
                      className="flex items-center space-x-1.5 bg-[#ccff00] text-[#0a0a0a] px-3.5 py-2 rounded-xl font-bold shadow-[2px_2px_0px_#0a0a0a] hover:translate-y-[1px] transition-all text-sm"
                    >
                      <FiCheck />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={onRejectConnection}
                      className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-[#e5e5e5] px-3.5 py-2 rounded-xl transition-colors border border-white/10 text-sm"
                    >
                      <FiX />
                      <span>Reject</span>
                    </button>
                  </div>
                )}

                {connectionStatus === 'accepted' && (
                  <Link to={`/chat/${_id}`} className="flex items-center space-x-2 bg-[#ccff00] text-[#0a0a0a] px-4 py-2 rounded-xl font-bold shadow-[4px_4px_0px_#0a0a0a] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#0a0a0a] transition-all text-sm">
                    <FiMessageSquare />
                    <span>Message</span>
                  </Link>
                )}

                {(connectionStatus === 'rejected' || connectionStatus === 'ignored') && (
                  <button 
                    disabled 
                    className="flex items-center space-x-2 bg-white/5 text-white/40 px-4 py-2 rounded-xl border border-white/5 cursor-not-allowed text-sm"
                  >
                    <FiX />
                    <span>Declined</span>
                  </button>
                )}

                <button 
                  onClick={isFollowing ? onUnfollow : onFollow}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition-all text-sm ${
                    isFollowing 
                      ? 'bg-white/10 text-white hover:bg-white/20 border border-white/10' 
                      : 'bg-[#a855f7] text-white shadow-[4px_4px_0px_#0a0a0a] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#0a0a0a]'
                  }`}
                >
                  {isFollowing ? <FiUserCheck /> : <FiUserPlus />}
                  <span>{isFollowing ? 'Following' : 'Follow'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="mt-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#e5e5e5]">{fullName}</h1>
            {isUsuallyResponsive && (
              <span className="bg-[#ccff00]/10 text-[#ccff00] text-xs px-2.5 py-1 rounded-full border border-[#ccff00]/20 font-medium">
                ⚡ Usually responsive
              </span>
            )}
          </div>
          {headline && <p className="text-base sm:text-lg text-[#a3a3a3] mt-1">{headline}</p>}
          
          <div className="flex flex-wrap items-center mt-3 text-sm text-[#a3a3a3] gap-4">
            {location && (
              <div className="flex items-center space-x-1">
                <FiMapPin className="text-[#a855f7]" />
                <span>{location}</span>
              </div>
            )}
            
            {/* Social Links */}
            <div className="flex items-center space-x-3">
              {twitterUrl && <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><FaTwitter size={18} /></a>}
              {portfolioUrl && <a href={portfolioUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><FaGlobe size={18} /></a>}
            </div>
          </div>

          {/* Live Presence */}
          <div className="mt-4 flex items-center space-x-2 text-sm">
            {isOnline && currentRoom ? (
              <div className="bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-full border border-blue-500/20 flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                <span>In ProjectRoom "{currentRoom.title}" with @{currentRoom.members?.join(', ')}</span>
              </div>
            ) : isOnline && openToPair ? (
              <div className="flex items-center space-x-3">
                <div className="bg-[#ccff00]/10 text-[#ccff00] px-3 py-1.5 rounded-full border border-[#ccff00]/20 flex items-center space-x-2">
                  <span className="w-2 h-2 bg-[#ccff00] rounded-full animate-pulse"></span>
                  <span>💡 Open to pair</span>
                </div>
                {!isOwnProfile && (
                  <Link to={`/chat/${_id}`} className="text-xs bg-[#121212] border border-white/20 text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors">
                    🤝 Request to Pair
                  </Link>
                )}
              </div>
            ) : isOnline ? (
              <div className="bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full border border-green-500/20 flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>Online now</span>
              </div>
            ) : (
              <div className="text-[#a3a3a3] flex items-center space-x-2">
                <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                <span>{lastSeen ? `Last seen ${timeAgo(lastSeen)}` : 'Offline'}</span>
              </div>
            )}
          </div>

          {/* Stats Row */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-[#e5e5e5]">
            <div className="flex flex-col">
              <span className="font-bold text-xl">{followersCount}</span>
              <span className="text-xs text-[#a3a3a3] uppercase tracking-wider">Followers</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl">{stats?.connectionCount || 0}</span>
              <span className="text-xs text-[#a3a3a3] uppercase tracking-wider">Connections</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl">{stats?.totalReactions || 0}</span>
              <span className="text-xs text-[#a3a3a3] uppercase tracking-wider">Reactions</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl">{helpfulAnswers}</span>
              <span className="text-xs text-[#a3a3a3] uppercase tracking-wider">Problems Solved</span>
            </div>
          </div>

          {/* Open to pair toggle for own profile */}
          {isOwnProfile && (
            <div className="mt-6 p-4 bg-[#0a0a0a] rounded-2xl border border-white/5 flex items-center justify-between max-w-sm">
              <div className="flex flex-col">
                <span className="text-[#e5e5e5] font-semibold text-sm">Open to Pair</span>
                <span className="text-[#a3a3a3] text-xs">Let others know you're ready to code</span>
              </div>
              <button 
                onClick={onTogglePair}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${openToPair ? 'bg-[#ccff00]' : 'bg-white/20'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${openToPair ? 'translate-x-6 bg-[#0a0a0a]' : 'translate-x-1'}`} />
              </button>
            </div>
          )}
        </div>
      </div>
    </Motion.div>
  );
};

export default ProfileHeader;
