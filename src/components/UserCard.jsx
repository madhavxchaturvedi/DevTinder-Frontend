import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion as Motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { removeFeed } from "../redux/feedSlice";
import { X, Heart, Code2, FolderGit2, Sparkles } from "lucide-react";

const UserCard = ({ user, isFront, onMatch }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((store) => store.user);
  const controls = useAnimation();
  const [hasExited, setHasExited] = useState(false);
  const [localFeaturedPost, setLocalFeaturedPost] = useState(user?.featuredPost || null);
  const fetchedUserIdRef = useRef(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-20, 20]);
  const likeOpacity = useTransform(x, [15, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-15, -120], [0, 1]);

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
    const velocityThreshold = 450;
    const draggedRight = info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold;
    const draggedLeft = info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold;

    if (draggedRight) {
      setHasExited(true);
      await controls.start({ 
        x: window.innerWidth + 100, 
        rotate: 25, 
        opacity: 0, 
        transition: { duration: 0.28, ease: "easeOut" } 
      });
      handleSendRequest("interested", user._id);
    } else if (draggedLeft) {
      setHasExited(true);
      await controls.start({ 
        x: -window.innerWidth - 100, 
        rotate: -25, 
        opacity: 0, 
        transition: { duration: 0.28, ease: "easeOut" } 
      });
      handleSendRequest("ignored", user._id);
    } else {
      controls.start({ x: 0, transition: { type: "spring", stiffness: 350, damping: 25 } });
    }
  };

  const handleAction = async (status) => {
    if (!isFront || hasExited) return;
    setHasExited(true);
    if (status === "interested") {
      await controls.start({ 
        x: window.innerWidth + 100, 
        rotate: 20, 
        opacity: 0, 
        transition: { duration: 0.28, ease: "easeOut" } 
      });
      handleSendRequest("interested", user._id);
    } else {
      await controls.start({ 
        x: -window.innerWidth - 100, 
        rotate: -20, 
        opacity: 0, 
        transition: { duration: 0.28, ease: "easeOut" } 
      });
      handleSendRequest("ignored", user._id);
    }
  };

  useEffect(() => {
    if (!hasExited) {
      controls.start(
        isFront
          ? { scale: 1, y: 0, opacity: 1, zIndex: 10, transition: { type: "spring", stiffness: 350, damping: 25 } }
          : { scale: 0.94, y: 16, opacity: 0.65, zIndex: 0, transition: { type: "spring", stiffness: 350, damping: 25 } }
      );
    }
  }, [isFront, hasExited, controls]);

  useEffect(() => {
    if (user?._id && !user.featuredPost && fetchedUserIdRef.current !== user._id) {
      fetchedUserIdRef.current = user._id;
      axios.get(`${BASE_URL}/user/${user._id}/latest-post`, { withCredentials: true })
        .then(res => {
          if (res.data?.data) {
            setLocalFeaturedPost(res.data.data);
          }
        })
        .catch(err => console.log(err));
    }
  }, [user?._id, user?.featuredPost]);

  if (!user) return null;

  // Skills & Compatibility Calculation
  const mySkills = (currentUser?.skills || []).map(s => s.toLowerCase());
  const theirSkills = user.skills || [];
  const sharedSkills = user.sharedSkills || theirSkills.filter(s => mySkills.includes(s.toLowerCase()));
  const compatibility = user.compatibilityPercent !== undefined 
    ? user.compatibilityPercent 
    : (theirSkills.length > 0 ? Math.round((sharedSkills.length / theirSkills.length) * 100) : 0);

  const displayPost = user.featuredPost || localFeaturedPost;

  return (
    <div className={`${isFront !== undefined ? "absolute top-0 left-0" : "relative"} w-full flex flex-col items-center select-none`}>
      {/* -- Holographic Developer ID Card -- */}
      <Motion.div
        className="relative w-[360px] h-[520px] rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing bg-[#111113] border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.7)] flex flex-col"
        drag={isFront && !hasExited ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.9}
        onDragEnd={handleDragEnd}
        style={{ x, rotate }}
        animate={controls}
        initial={
          isFront 
            ? { scale: 1, y: 0, opacity: 1 } 
            : { scale: 0.94, y: 16, opacity: 0 }
        }
      >
        {/* Swipe Right (Interested / Connect) Green/Lime Tint Overlay */}
        <Motion.div
          style={{ opacity: likeOpacity }}
          className="absolute inset-0 bg-[#ccff00]/15 pointer-events-none z-30 border-2 border-[#ccff00] rounded-2xl flex items-center justify-center backdrop-blur-[2px]"
        >
          <div className="bg-[#ccff00] text-black px-5 py-2 rounded-xl font-black text-2xl tracking-widest uppercase transform -rotate-12 shadow-2xl">
            CONNECT
          </div>
        </Motion.div>

        {/* Swipe Left (Ignored / Skip) Red Tint Overlay */}
        <Motion.div
          style={{ opacity: nopeOpacity }}
          className="absolute inset-0 bg-red-500/15 pointer-events-none z-30 border-2 border-red-500 rounded-2xl flex items-center justify-center backdrop-blur-[2px]"
        >
          <div className="bg-red-500 text-white px-5 py-2 rounded-xl font-black text-2xl tracking-widest uppercase transform rotate-12 shadow-2xl">
            SKIP
          </div>
        </Motion.div>

        {/* Top Half: Large profile photo filling card top half, object-cover, no borders */}
        <div className="relative w-full h-[52%] overflow-hidden bg-black/60 shrink-0">
          {user.photoUrl ? (
            <img
              src={user.photoUrl}
              alt={user.firstName}
              className="w-full h-full object-cover pointer-events-none"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#1a1a1f] to-[#111113] text-[#52525b]">
              <Sparkles size={36} className="text-[#ccff00]/40 mb-2" />
              <span className="text-xl font-mono font-bold text-[#f0f0f0]">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </span>
            </div>
          )}

          {/* Floating Compatibility Badge */}
          {compatibility > 0 && (
            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md border border-white/10 rounded-md px-2.5 py-1 text-[11px] font-mono font-bold text-[#ccff00] shadow-lg">
              {compatibility}% Match
            </div>
          )}

          {/* Bottom Gradient Overlay: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 50%) */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(to top, rgba(17,17,19,1) 0%, rgba(0,0,0,0.7) 35%, transparent 60%)"
            }}
          />
        </div>

        {/* Bottom Half (Overlaid on photo gradient): Developer Details */}
        <div className="flex-1 flex flex-col justify-between px-5 pb-5 pt-1 relative z-10 bg-[#111113]">
          
          <div>
            {/* Developer Name & Headline */}
            <h2 className="text-[20px] font-bold text-white tracking-tight leading-tight truncate">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-[13px] text-[#a0a0a0] leading-snug truncate mt-0.5 font-normal">
              {user.about || "Software Developer"}
            </p>

            {/* Skill badges: mono, lime border */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {theirSkills.slice(0, 4).map((skill, idx) => {
                const isShared = mySkills.includes(skill.toLowerCase());
                return (
                  <span 
                    key={idx} 
                    className={`rounded-md px-2 py-0.5 text-[11px] font-mono font-bold ${
                      isShared 
                        ? 'bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/40' 
                        : 'bg-white/5 text-white/70 border border-white/10'
                    }`}
                  >
                    {skill}
                  </span>
                );
              })}
              {theirSkills.length > 4 && (
                <span className="rounded-md px-1.5 py-0.5 text-[10px] font-mono text-[#52525b]">
                  +{theirSkills.length - 4}
                </span>
              )}
            </div>
          </div>

          {/* Featured Code Snippet if available: inset code block bg-black/60 */}
          {displayPost && (
            <div className="bg-black/60 rounded-lg border border-white/[0.06] p-2.5 my-2 overflow-hidden">
              {displayPost.type === 'snippet' && displayPost.codeSnippet ? (
                <>
                  <div className="flex items-center justify-between mb-1 text-[10px] font-mono">
                    <span className="text-[#ccff00] font-bold flex items-center gap-1">
                      <Code2 size={11} /> Snippet
                    </span>
                    <span className="text-[#52525b] uppercase">{displayPost.codeSnippet.language}</span>
                  </div>
                  <pre className="text-[11px] font-mono text-[#d4d4d8] leading-tight line-clamp-2 whitespace-pre-wrap">
                    {displayPost.codeSnippet.code}
                  </pre>
                </>
              ) : displayPost.type === 'project' ? (
                <div className="text-xs">
                  <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#b266ff] mb-0.5">
                    <FolderGit2 size={11} /> Project
                  </div>
                  <p className="font-bold text-[#f0f0f0] truncate text-[12px]">{displayPost.project?.title || "Project"}</p>
                  <p className="text-[11px] text-[#52525b] truncate">{displayPost.content}</p>
                </div>
              ) : (
                <div className="text-xs">
                  <p className="text-[11px] text-[#d4d4d8] line-clamp-2 leading-snug">
                    {displayPost.content}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Bottom Card Footer / Stack Hint */}
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-[#52525b]">
            <span>{sharedSkills.length > 0 ? `${sharedSkills.length} shared skills` : "Discover stack"}</span>
            <span>Swipe or click below</span>
          </div>

        </div>
      </Motion.div>

      {/* Action Buttons: Two large circular buttons at bottom center -- X (ghost, left) and heart/connect (lime fill, right) */}
      <Motion.div 
        className="flex items-center justify-center gap-8 mt-5 relative z-20 pointer-events-auto"
        animate={{ opacity: isFront && !hasExited ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{ pointerEvents: isFront && !hasExited ? "auto" : "none" }}
      >
        {/* X (Ghost, Left) */}
        <button
          onClick={() => handleAction("ignored")}
          disabled={!isFront || hasExited}
          className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#52525b] hover:text-red-400 hover:border-red-400/40 hover:bg-red-500/10 active:scale-95 transition-all shadow-lg group"
          title="Skip"
        >
          <X size={24} className="group-hover:scale-110 transition-transform" />
        </button>

        {/* Heart / Connect (Lime Fill, Right) */}
        <button
          onClick={() => handleAction("interested")}
          disabled={!isFront || hasExited}
          className="w-14 h-14 rounded-full bg-[#ccff00] flex items-center justify-center text-black hover:bg-[#d9ff33] hover:shadow-[0_0_25px_rgba(204,255,0,0.4)] active:scale-95 transition-all shadow-lg group"
          title="Connect"
        >
          <Heart size={24} className="fill-current group-hover:scale-110 transition-transform" />
        </button>
      </Motion.div>
    </div>
  );
};

export default UserCard;
