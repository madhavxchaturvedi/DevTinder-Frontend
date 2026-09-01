import React, { useEffect, useState } from "react";
import UserCard from "./UserCard";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addFeed } from "../redux/feedSlice";
import axios from "axios";
import { SkeletonUserCard } from "./Skeletons";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { FiSearch, FiX, FiCheckCircle, FiArrowUp, FiFilter, FiUsers, FiTarget } from "react-icons/fi";
import MatchSplash from "./MatchSplash";
import { AnimatePresence } from "framer-motion";

const Discover = () => {
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [activeSkills, setActiveSkills] = useState("");
  const [matchedUser, setMatchedUser] = useState(null);
  
  const [showFilter, setShowFilter] = useState(false);
  const [bestMatches, setBestMatches] = useState([]);
  const [networkStats, setNetworkStats] = useState({ connectionCount: 0, pendingCount: 0, connectionsThisWeek: 0 });

  const getFeed = async (forceRefetch = false, skillsToFetch = "") => {
    if (!forceRefetch && feed && feed.length > 0 && skillsToFetch === activeSkills) return;

    try {
      setLoading(true);
      const url = skillsToFetch 
        ? `${BASE_URL}/feed?skills=${encodeURIComponent(skillsToFetch)}` 
        : `${BASE_URL}/feed`;
        
      const res = await axios.get(url, {
        withCredentials: true,
      });
      dispatch(addFeed(res?.data?.data));
    } catch (err) {
      if (err?.response?.status === 401) return;
      toast.error("Could not load feed. Please try again.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const getBestMatches = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/best-matches`, { withCredentials: true });
      setBestMatches(res.data?.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const getNetworkStats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/network-stats`, { withCredentials: true });
      const data = res.data?.data || res.data || {};
      setNetworkStats({
        connectionCount: data.connectionCount || 0,
        pendingCount: data.pendingCount || 0,
        connectionsThisWeek: data.connectionsThisWeek || 0
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getFeed(false, activeSkills);
    getBestMatches();
    getNetworkStats();
  }, []);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    if (skillInput.trim() !== activeSkills) {
      setActiveSkills(skillInput.trim());
      getFeed(true, skillInput.trim());
    }
  };

  const handleClearFilter = () => {
    setSkillInput("");
    setActiveSkills("");
    getFeed(true, "");
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-start gap-8 px-4 pt-10">
      
      {/* ── Center Column (Timeline) ───────────────────────────── */}
      <div className="flex-1 flex flex-col w-full min-h-[800px]">
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white tracking-tight">Explore Developers</h2>
          <p className="text-[#525252] text-sm mt-1">Find developers who share your stack and connect to collaborate.</p>
        </div>

        {/* Discovery Feed */}
        <div className="w-full flex justify-center mt-4">
          {loading ? (
            <div className="mt-4"><SkeletonUserCard /></div>
          ) : (!feed || feed.length === 0) ? (
            <div className="w-full bg-[#141415] border border-[#262626] rounded-xl py-16 px-8 text-center flex flex-col items-center">
              <FiUsers className="text-[#525252] mb-4" size={40} />
              <h2 className="text-xl font-semibold text-white mb-2">You've seen everyone for now</h2>
              <p className="text-sm text-[#525252] max-w-sm mb-2">{networkStats.connectionCount || 0} connections made so far</p>
              <p className="text-sm text-[#525252] max-w-sm mb-6">New developers join every day. Come back tomorrow!</p>
              <div className="flex gap-3">
                <Link to="/connections" className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-[#e1e1e3] transition-colors">Check Connections</Link>
                <Link to="/feed" className="px-4 py-2 bg-[#a855f7] hover:bg-[#9333ea] rounded-lg text-sm text-white font-medium transition-colors">Browse Feed</Link>
              </div>
            </div>
          ) : (
            <div className="relative z-0 flex justify-center w-full max-w-sm h-[600px]">
              {feed.slice(0, 2).reverse().map((user) => {
                const isFront = user._id === feed[0]._id;
                return <UserCard key={user._id} user={user} isFront={isFront} onMatch={setMatchedUser} />;
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Right Sidebar (Widgets) ─────────────────────────────── */}
      <div className="hidden xl:flex w-[320px] flex-col gap-6 sticky top-10">
        
        {/* Upgrade Banner */}
        <div className="bg-[#a855f7]/10 border border-[#a855f7]/20 rounded-xl p-5 relative overflow-hidden group cursor-pointer hover:bg-[#a855f7]/20 transition-colors">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#a855f7]/30 rounded-full blur-xl group-hover:bg-[#a855f7]/50 transition-colors" />
          <h3 className="text-[#a855f7] font-bold mb-2 flex items-center gap-2">
            <FiArrowUp className="text-lg" /> Introducing Pro
          </h3>
          <p className="text-xs text-[#a3a3a3] font-medium mb-4 leading-relaxed">
            Boost your visibility and access live collaborative sandboxes with premium features.
          </p>
          <div className="flex gap-2">
            <button className="flex-1 bg-[#a855f7] text-white font-medium text-xs py-2 rounded-lg hover:bg-[#9240de] transition-colors">
              Upgrade
            </button>
            <button className="flex-1 bg-white/5 text-[#e5e5e5] font-medium text-xs py-2 rounded-lg hover:bg-white/10 transition-colors">
              Explore
            </button>
          </div>
        </div>

        {/* Best Matches */}
        <div className="dev-card p-5 shrink-0">
          <h3 className="text-sm font-bold text-[#e5e5e5] mb-4 flex items-center gap-2">
            <FiTarget className="text-[#a855f7]" /> Best Matches
          </h3>
          
          {bestMatches.length === 0 ? (
            <p className="text-xs text-[#525252]">Connect with more developers to see recommendations</p>
          ) : (
            <div className="flex flex-col gap-4">
              {bestMatches.map(match => {
                const initials = `${(match.firstName || '?')[0]}${(match.lastName || '')[0] || ''}`.toUpperCase();
                return (
                <Link to={`/user/${match._id}`} key={match._id} className="flex items-center gap-3 group">
                   {match.photoUrl ? (
                     <img src={match.photoUrl} alt={match.firstName} className="w-8 h-8 rounded-lg object-cover border border-white/10" />
                   ) : (
                     <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center text-[10px] font-bold text-white border border-white/10">
                       {initials}
                     </div>
                   )}
                   <div className="flex-1 min-w-0 flex flex-col">
                     <span className="text-sm font-medium text-[#e5e5e5] group-hover:text-white truncate transition-colors">
                       {match.firstName} {match.lastName}
                     </span>
                     <div className="flex flex-wrap gap-1 mt-1">
                       {(match.sharedSkills || match.skills || []).slice(0, 2).map((skill, i) => (
                         <span key={i} className="text-[10px] bg-[#ccff00]/10 text-[#ccff00] px-1.5 py-0.5 rounded-md">{skill}</span>
                       ))}
                     </div>
                   </div>
                   {match.compatibilityPercent > 0 && (
                     <span className="text-xs font-bold text-[#ccff00] bg-[#ccff00]/10 px-2 py-1 rounded-md">{match.compatibilityPercent}%</span>
                   )}
                </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Your Network */}
        <div className="dev-card p-5 shrink-0">
           <h3 className="text-sm font-bold text-[#e5e5e5] mb-4 flex items-center gap-2">
             <FiUsers className="text-[#ccff00]" /> Your Network
           </h3>
           <div className="flex flex-col gap-3">
             <div className="flex justify-between items-center text-sm">
                <span className="text-[#a3a3a3]">Connections</span>
                <span className="text-white font-bold">{networkStats.connectionCount || 0}</span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-[#a3a3a3]">Pending</span>
                <span className="text-white font-bold">{networkStats.pendingCount || 0}</span>
             </div>
             <div className="h-px bg-white/5 my-1" />
             {networkStats.connectionsThisWeek > 0 ? (
                <p className="text-xs text-[#ccff00] font-medium">{networkStats.connectionsThisWeek} new this week</p>
             ) : (
                <p className="text-xs text-[#525252]">No new connections this week</p>
             )}
             
             {networkStats.pendingCount > 0 && (
               <Link to="/requests" className="text-xs text-[#a855f7] hover:text-[#9333ea] transition-colors mt-2 inline-block font-medium">
                 View requests →
               </Link>
             )}
           </div>
        </div>
      </div>

      {/* Match Splash Screen */}
      <AnimatePresence>
        {matchedUser && (
          <MatchSplash 
            matchedUser={matchedUser} 
            onClose={() => setMatchedUser(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Discover;
