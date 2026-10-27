import React, { useEffect, useState } from "react";
import UserCard from "./UserCard";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addFeed } from "../redux/feedSlice";
import axios from "axios";
import { SkeletonUserCard } from "./Skeletons";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { 
  Orbit, 
  Zap, 
  Users, 
  Target, 
  Sparkles, 
  ArrowUpRight 
} from "lucide-react";
import MatchSplash from "./MatchSplash";
import { AnimatePresence } from "framer-motion";

const Discover = () => {
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [activeSkills] = useState("");
  const [matchedUser, setMatchedUser] = useState(null);
  
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

  return (
    <div className="w-full flex flex-row gap-8 justify-center px-4 pt-6 pb-12">
      
      {/* -- Center Column: max-w-md for card stack ---------------- */}
      <main className="w-full max-w-md min-w-0 flex flex-col items-center">
        
        <div className="w-full mb-4 text-center">
          <h1 className="text-xl font-bold text-[#f0f0f0] tracking-tight">
            Discover Builders
          </h1>
          <p className="text-xs text-[#52525b] mt-0.5">
            Swipe right to connect or left to skip based on stack and proof of work.
          </p>
        </div>

        {/* Discovery Card Stack */}
        <div className="w-full flex justify-center">
          {loading ? (
            <div className="mt-4">
              <SkeletonUserCard />
            </div>
          ) : (!feed || feed.length === 0) ? (
            /* Empty State: Orbit / Zap icon, bold headline, muted description, two CTA buttons */
            <div className="glass-card py-16 px-8 text-center flex flex-col items-center justify-center w-full my-4">
              <div className="w-12 h-12 rounded-xl bg-[#ccff00]/10 flex items-center justify-center text-[#ccff00] mb-4">
                <Orbit size={28} />
              </div>
              <h2 className="text-lg font-bold text-[#f0f0f0] mb-1.5">
                You've seen everyone for now
              </h2>
              <p className="text-xs text-[#52525b] max-w-xs mb-1">
                {networkStats.connectionCount || 0} connections made so far.
              </p>
              <p className="text-xs text-[#52525b] max-w-xs mb-6">
                New developers join daily. Come back soon or check your incoming requests.
              </p>
              <div className="flex items-center gap-3">
                <Link 
                  to="/connections" 
                  className="bg-transparent border border-white/10 hover:border-white/20 text-[#f0f0f0] text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                >
                  Check Connections
                </Link>
                <Link 
                  to="/feed" 
                  className="bg-[#ccff00] hover:bg-[#d9ff33] text-black text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                >
                  Browse Feed
                </Link>
              </div>
            </div>
          ) : (
            <div className="relative z-0 flex justify-center w-full max-w-[360px] h-[600px] mt-2">
              {feed.slice(0, 2).reverse().map((user) => {
                const isFront = user._id === feed[0]._id;
                return (
                  <UserCard 
                    key={user._id} 
                    user={user} 
                    isFront={isFront} 
                    onMatch={setMatchedUser} 
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* -- Right Panel: w-72 on xl+ screens --------------------- */}
      <aside className="hidden xl:flex w-72 flex-col gap-4 sticky top-6 shrink-0 self-start">
        
        {/* Pro Banner */}
        <div className="rounded-xl p-4 bg-gradient-to-br from-[#b266ff]/20 via-[#111113] to-[#111113] border border-[#b266ff]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#b266ff] flex items-center gap-1.5">
              <Sparkles size={12} /> Spotlight
            </span>
            <Link to="/premium" className="text-[#b266ff] hover:underline">
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <p className="text-xs text-[#a0a0a0] leading-relaxed mb-3">
            Get highlighted in Discover card stacks for other engineers looking for your stack.
          </p>
          <Link 
            to="/premium"
            className="block text-center w-full bg-[#b266ff] hover:bg-[#c280ff] text-black font-bold text-xs py-1.5 rounded-lg transition-colors"
          >
            Boost Profile
          </Link>
        </div>

        {/* Best Matches */}
        <div className="glass-card p-4">
          <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#52525b] mb-3 font-mono flex items-center gap-1.5">
            <Target size={13} className="text-[#b266ff]" /> Best Matches
          </h4>
          
          {bestMatches.length === 0 ? (
            <p className="text-[11px] font-mono text-[#52525b]">
              Connect with more developers to get personalized recommendations.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {bestMatches.slice(0, 4).map((match) => (
                <Link 
                  to={`/user/${match._id}`} 
                  key={match._id} 
                  className="flex items-center justify-between gap-2 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img 
                      src={match.photoUrl || "https://geographyandyou.com/images/user-profile.png"} 
                      alt={match.firstName} 
                      className="w-7 h-7 rounded-lg object-cover border border-white/[0.07] shrink-0" 
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-[#f0f0f0] group-hover:text-[#ccff00] transition-colors truncate">
                        {match.firstName} {match.lastName}
                      </span>
                      <span className="text-[10px] font-mono text-[#52525b] truncate">
                        {(match.sharedSkills || match.skills || [])[0] || "Developer"}
                      </span>
                    </div>
                  </div>
                  {match.compatibilityPercent > 0 && (
                    <span className="text-[10px] font-mono font-bold text-[#ccff00] bg-[#ccff00]/10 border border-[#ccff00]/20 px-1.5 py-0.5 rounded-md shrink-0">
                      {match.compatibilityPercent}%
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Your Network */}
        <div className="glass-card p-4">
          <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#52525b] mb-3 font-mono flex items-center gap-1.5">
            <Users size={13} className="text-[#ccff00]" /> Your Network
          </h4>
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#52525b]">Connections</span>
              <span className="font-mono font-bold text-[#f0f0f0]">{networkStats.connectionCount || 0}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#52525b]">Pending</span>
              <span className="font-mono font-bold text-[#b266ff]">{networkStats.pendingCount || 0}</span>
            </div>
            <div className="h-px bg-white/[0.06] my-0.5" />
            {networkStats.connectionsThisWeek > 0 ? (
              <p className="text-[11px] font-mono text-[#ccff00]">{networkStats.connectionsThisWeek} new this week</p>
            ) : (
              <p className="text-[11px] font-mono text-[#52525b]">0 new this week</p>
            )}
            
            {networkStats.pendingCount > 0 && (
              <Link 
                to="/requests" 
                className="text-xs text-[#b266ff] hover:underline transition-colors mt-1 font-medium inline-flex items-center gap-1"
              >
                View requests <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

      </aside>

      {/* Match Splash Modal */}
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
