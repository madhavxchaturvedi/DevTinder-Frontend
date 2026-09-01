import axios from "axios";
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import React, { useState, useEffect } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { removeFeed } from "../redux/feedSlice";
import { FiX, FiUserPlus, FiEdit3, FiCode, FiLayout, FiFileText } from "react-icons/fi";

const UserCard = ({ user, isFront, onMatch }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((store) => store.user);
  const controls = useAnimation();
  const [hasExited, setHasExited] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-25, 25]);
  const likeOpacity = useTransform(x, [10, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-10, -100], [0, 1]);

  const boxShadow = useTransform(
    x,
    [-150, 0, 150],
    [
      "0 0 0px rgba(0,0,0,1)",
      "0 8px 32px rgba(0,0,0,0.4)",
      "0 0 0px rgba(0,0,0,1)"
    ]
  );

  const handleSendRequest = async (status, userId) => {
    dispatch(removeFeed(userId));
    try {
      const res = await axios.post(
        BASE_URL + "/request/send/" + status + "/" + userId,
        {},
        { withCredentials: true }
      );
      if (res.data?.isMatch && onMatch) {
        onMatch(res.data.matchedUser);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDragEnd = async (event, info) => {
    if (!isFront || hasExited) return;
    const swipeThreshold = 100;
    const velocityThreshold = 500;
    const draggedRight = info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold;
    const draggedLeft = info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold;

    if (draggedRight) {
      setHasExited(true);
      await controls.start({ x: window.innerWidth, opacity: 0, transition: { duration: 0.3 } });
      handleSendRequest("interested", user._id);
    } else if (draggedLeft) {
      setHasExited(true);
      await controls.start({ x: -window.innerWidth, opacity: 0, transition: { duration: 0.3 } });
      handleSendRequest("ignored", user._id);
    } else {
      controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
    }
  };

  const handleAction = async (status) => {
    if (!isFront || hasExited) return;
    setHasExited(true);
    if (status === "interested") {
      await controls.start({ x: window.innerWidth, rotate: 20, opacity: 0, transition: { duration: 0.3 } });
      handleSendRequest("interested", user._id);
    } else {
      await controls.start({ x: -window.innerWidth, rotate: -20, opacity: 0, transition: { duration: 0.3 } });
      handleSendRequest("ignored", user._id);
    }
  };

  useEffect(() => {
    if (!hasExited) {
      controls.start(
        isFront
          ? { scale: 1, y: 0, opacity: 1, zIndex: 10, transition: { type: "spring", stiffness: 350, damping: 25 } }
          : { scale: 0.94, y: 25, opacity: 0.7, zIndex: 0, transition: { type: "spring", stiffness: 350, damping: 25 } }
      );
    }
  }, [isFront, hasExited, controls]);

  if (!user) return null;

  const getInitials = (first, last) => {
    return ((first?.[0] || "") + (last?.[0] || "")).toUpperCase();
  };

  // Bulletproof Skill Computation (fallbacks if Redux is stale)
  const mySkills = (currentUser?.skills || []).map(s => s.toLowerCase());
  const theirSkills = user.skills || [];
  const sharedSkills = user.sharedSkills || theirSkills.filter(s => mySkills.includes(s.toLowerCase()));
  const otherSkills = user.otherSkills || theirSkills.filter(s => !mySkills.includes(s.toLowerCase()));
  const compatibility = user.compatibilityPercent !== undefined 
    ? user.compatibilityPercent 
    : (theirSkills.length > 0 ? Math.round((sharedSkills.length / theirSkills.length) * 100) : 0);
  
  const postCount = user.activitySignals?.postCountThisWeek || 0;
  const activeProjects = user.activitySignals?.activeProjectRooms || 0;

  const [localFeaturedPost, setLocalFeaturedPost] = useState(user.featuredPost || null);
  const [fetchingPost, setFetchingPost] = useState(false);

  useEffect(() => {
    if (user && !user.featuredPost && !fetchingPost && !localFeaturedPost) {
      setFetchingPost(true);
      axios.get(`${BASE_URL}/user/${user._id}/latest-post`, { withCredentials: true })
        .then(res => {
          if (res.data?.data) {
            setLocalFeaturedPost(res.data.data);
          }
        })
        .catch(err => console.log(err))
        .finally(() => setFetchingPost(false));
    }
  }, [user]);

  const displayPost = user.featuredPost || localFeaturedPost;

  return (
    <div className={`${isFront !== undefined ? "absolute top-0 left-0" : "relative"} w-full flex flex-col items-center`}>
      <motion.div
        className="relative w-[360px] h-[520px] rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing bg-[#141415] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col p-6"
        drag={isFront && !hasExited ? "x" : false}
        dragConstraints={false}
        dragElastic={1}
        onDragEnd={handleDragEnd}
        style={{ x, rotate, boxShadow }}
        animate={controls}
        initial={
          isFront 
            ? { scale: 1, y: 0, opacity: 1 } 
            : { scale: 0.94, y: 25, opacity: 0 }
        }
      >
        {/* ── CONNECT / SKIP Stamps ── */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute top-12 left-6 z-30 pointer-events-none"
        >
          <div className="border-[3px] border-[#ccff00] rounded-xl px-4 py-1.5 bg-[#ccff00]/10 backdrop-blur-md transform -rotate-12 shadow-2xl">
            <span className="text-[#ccff00] text-3xl font-black tracking-widest uppercase">
              Connect
            </span>
          </div>
        </motion.div>

        <motion.div
          style={{ opacity: nopeOpacity }}
          className="absolute top-12 right-6 z-30 pointer-events-none"
        >
          <div className="border-[3px] border-red-500 rounded-xl px-4 py-1.5 bg-red-500/10 backdrop-blur-md transform rotate-12 shadow-2xl">
            <span className="text-red-500 text-3xl font-black tracking-widest uppercase">
              Skip
            </span>
          </div>
        </motion.div>

        {/* ── Top Bar: Compatibility Indicator ── */}
        <div className="flex justify-end w-full mb-3">
          {compatibility > 0 ? (
            <div className={`px-2 py-1 rounded text-xs font-bold ${
              compatibility >= 50 
                ? 'bg-[#ccff00]/10 text-[#ccff00]' 
                : 'bg-white/5 text-[#a3a3a3]'
            }`}>
              {compatibility}%
            </div>
          ) : (
            <div className="h-6"></div>
          )}
        </div>

        {/* ── Profile Row (Small Avatar) ── */}
        <div className="flex items-center gap-4 mb-5">
          {user.photoUrl ? (
            <img
              src={user.photoUrl}
              alt={user.firstName}
              className="w-14 h-14 rounded-full object-cover pointer-events-none border border-white/5"
            />
          ) : (
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-[#a855f7] to-[#7c3aed] border border-white/5 shadow-inner">
              <span className="text-xl font-bold text-white pointer-events-none">
                {getInitials(user.firstName, user.lastName)}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white truncate leading-tight">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-sm text-[#a3a3a3] truncate mt-0.5">
              {user.about || "Developer"}
            </p>
          </div>
        </div>

        {/* ── Skills Section (Highlighted vs Muted) ── */}
        <div className="mb-5">
          <div className="flex flex-wrap gap-2">
            {sharedSkills.map((skill, idx) => (
              <span key={`s-${idx}`} className="bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide">
                {skill}
              </span>
            ))}
            {otherSkills.slice(0, 6).map((skill, idx) => (
              <span key={`o-${idx}`} className="bg-white/5 text-[#a3a3a3] border border-white/5 px-2.5 py-1 rounded-md text-[11px] font-medium">
                {skill}
              </span>
            ))}
            {otherSkills.length > 6 && (
              <span className="text-[11px] text-[#525252] px-2 py-1 font-medium">
                +{otherSkills.length - 6}
              </span>
            )}
          </div>
        </div>

        {/* ── Activity Signals ── */}
        <div className="mb-4 flex flex-col gap-2">
          {postCount > 0 && (
            <div className="flex items-center gap-2 text-xs text-[#a3a3a3]">
              <FiEdit3 className="text-[#a3a3a3]" size={14} /> {postCount} post{postCount > 1 ? 's' : ''} this week
            </div>
          )}
          {activeProjects > 0 && (
            <div className="flex items-center gap-2 text-xs text-[#a3a3a3]">
              <FiCode className="text-[#a3a3a3]" size={14} /> Active in {activeProjects} repo{activeProjects > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* ── Featured Work Preview ── */}
        {displayPost && (
          <div className="bg-[#0a0a0b] border border-white/5 rounded-lg p-3 relative overflow-hidden mb-4">
            {displayPost.type === 'snippet' && displayPost.codeSnippet ? (
              <>
                 <div className="flex items-center justify-between mb-2">
                   <span className="flex items-center gap-1.5 text-[#a855f7] text-[10px] font-bold uppercase tracking-wider">
                     <FiCode size={12} /> Code Snippet
                   </span>
                   <span className="text-[9px] text-[#525252] font-mono">{displayPost.codeSnippet.language}</span>
                 </div>
                 <pre className="text-[11px] text-[#e5e5e5] font-mono line-clamp-3 leading-relaxed opacity-90 whitespace-pre-wrap">
                   {displayPost.codeSnippet.code}
                 </pre>
              </>
            ) : displayPost.type === 'project' ? (
              <>
                 <div className="flex items-center mb-1.5 text-[#ccff00] text-[10px] font-bold uppercase tracking-wider">
                   <FiLayout size={12} className="mr-1.5" /> Project Showcase
                 </div>
                 <p className="text-[13px] font-bold text-white truncate">{displayPost.project?.title || "New Project"}</p>
                 <p className="text-[11px] text-[#a3a3a3] line-clamp-1 mt-1 leading-relaxed">{displayPost.content}</p>
              </>
            ) : (
              <>
                 <div className="flex items-center mb-1.5 text-[#a3a3a3] text-[10px] font-bold uppercase tracking-wider">
                   <FiFileText size={12} className="mr-1.5" /> Latest Post
                 </div>
                 <p className="text-[12px] text-[#e5e5e5] line-clamp-3 leading-relaxed">{displayPost.content}</p>
              </>
            )}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[#0a0a0b] to-transparent pointer-events-none"></div>
          </div>
        )}

        {/* ── Why This Card ── */}
        <div className="mt-auto pt-3 border-t border-white/5">
          {sharedSkills.length > 0 ? (
            <p className="text-[11px] text-[#a855f7] italic font-medium">
              Matches your {sharedSkills.slice(0, 2).join(' + ')} stack
            </p>
          ) : (
            <p className="text-[11px] text-[#525252] italic">
              Explore new skills
            </p>
          )}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div 
        className="flex justify-center gap-14 mt-6 pointer-events-auto relative z-20"
        animate={{ opacity: isFront && !hasExited ? 1 : 0, scale: isFront && !hasExited ? 1 : 0.8 }}
        transition={{ duration: 0.2 }}
        style={{ pointerEvents: isFront && !hasExited ? "auto" : "none" }}
      >
        <div className="flex flex-col items-center gap-2 group">
          <button
            onClick={() => handleAction("ignored")}
            disabled={!isFront || hasExited}
            className="w-16 h-16 bg-[#141415] border-2 border-[#262626] rounded-full flex items-center justify-center hover:border-red-500/50 hover:bg-red-500/10 active:scale-90 transition-all disabled:opacity-50 shadow-xl group-hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
          >
            <FiX className="text-[#737373] group-hover:text-red-400 transition-colors" size={28} />
          </button>
          <span className="text-[11px] text-[#737373] font-bold uppercase tracking-widest group-hover:text-red-400 transition-colors">Skip</span>
        </div>
        <div className="flex flex-col items-center gap-2 group">
          <button
            onClick={() => handleAction("interested")}
            disabled={!isFront || hasExited}
            className="w-16 h-16 bg-[#ccff00] rounded-full flex items-center justify-center hover:bg-[#bbf000] active:scale-90 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(204,255,0,0.4)] group-hover:shadow-[0_0_30px_rgba(204,255,0,0.6)]"
          >
            <FiUserPlus className="text-black" size={26} />
          </button>
          <span className="text-[11px] text-[#ccff00] font-bold uppercase tracking-widest opacity-90 group-hover:opacity-100 transition-opacity">Connect</span>
        </div>
      </motion.div>
    </div>
  );
};

export default UserCard;
