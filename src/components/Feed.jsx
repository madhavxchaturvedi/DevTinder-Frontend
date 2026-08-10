import React, { useEffect, useState } from "react";
import UserCard from "./UserCard";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addFeed } from "../redux/feedSlice";
import axios from "axios";
import { SkeletonUserCard } from "./Skeletons";
import toast from "react-hot-toast";
import { FiSearch, FiX } from "react-icons/fi";

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [activeSkills, setActiveSkills] = useState(""); // Track currently applied skills

  const getFeed = async (forceRefetch = false, skillsToFetch = "") => {
    // If not forcing, and we already have feed data, and we aren't changing filters, skip
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

  useEffect(() => {
    getFeed(false, activeSkills);
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
    <div className="flex flex-col items-center">
      {/* ── Filter Bar ──────────────────────────────────────────────
      <div className="w-full max-w-sm mt-6 mb-2 px-4 z-10">
        {/* <form 
          onSubmit={handleApplyFilter} 
          className="relative flex items-center w-full"
        >
          <div className="absolute left-4 text-white/40">
            <FiSearch size={18} />
          </div>
          <input
            type="text"
            placeholder="Filter by skills (e.g. React, Node)..."
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            className="w-full bg-[#1a1a1a]/80 backdrop-blur-md text-white text-sm px-11 py-3.5 rounded-2xl border border-white/10 focus:ring-2 focus:ring-[#fe0142] focus:border-transparent outline-none transition placeholder:text-white/30 shadow-xl shadow-black/20"
          />
          {skillInput && (
            <button
              type="button"
              onClick={handleClearFilter}
              className="absolute right-12 p-1.5 text-white/40 hover:text-white transition"
            >
              <FiX size={16} />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
          >
            Apply
          </button>
        </form> */}
        
        {/* Active skills indicator */}
        {/* {activeSkills && (
          <div className="mt-3 flex justify-center items-center gap-2 text-xs text-white/50">
            Showing results for: 
            <span className="text-[#fe5a33] font-medium px-2 py-0.5 rounded-full bg-[#fe5a33]/10 border border-[#fe5a33]/20">
              {activeSkills}
            </span>
          </div>
        )} */}
      {/* </div> */}

      {/* ── Feed Content ────────────────────────────────────────── */}
      {loading ? (
        <div className="mt-4"><SkeletonUserCard /></div>
      ) : (!feed || feed.length === 0) ? (
        <div className="flex flex-col items-center justify-center mt-16 gap-4 text-center px-4">
          <p className="text-6xl">{activeSkills ? "🔍" : "🎉"}</p>
          <h1 className="text-3xl font-bold text-white">
            {activeSkills ? "No matches found" : "You're all caught up!"}
          </h1>
          <p className="text-white/50 text-sm max-w-xs">
            {activeSkills 
              ? "Try adjusting your skill filters to discover more developers."
              : "No more developers to discover right now. Check back later."}
          </p>
          {activeSkills && (
            <button
              onClick={handleClearFilter}
              className="mt-4 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="-mt-10 relative z-0 flex justify-center w-full max-w-sm h-[600px]">
          {feed.slice(0, 2).reverse().map((user) => {
            const isFront = user._id === feed[0]._id;
            return <UserCard key={user._id} user={user} isFront={isFront} />;
          })}
        </div>
      )}
    </div>
  );
};

export default Feed;
