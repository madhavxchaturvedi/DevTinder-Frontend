import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FiArrowLeft, FiMessageCircle, FiUser } from "react-icons/fi";

const SKILL_COLORS = [
  "bg-[#ccff00] text-[#0a0a0a]",
  "bg-[#a855f7] text-white",
  "bg-white text-[#0a0a0a]",
];

// ── Inline skeleton while loading ──────────────────────────────────
const ProfileSkeleton = () => (
  <div className="w-full max-w-lg mx-auto px-4 animate-pulse">
    {/* Banner skeleton */}
    <div className="h-44 rounded-3xl bg-white/5 mb-0" />
    {/* Avatar skeleton — overlapping */}
    <div className="flex justify-center -mt-14 mb-4">
      <div className="w-28 h-28 rounded-full bg-white/10 ring-4 ring-[#0a0a0a]" />
    </div>
    {/* Name + tags */}
    <div className="flex flex-col items-center gap-3 mb-6">
      <div className="h-7 w-44 rounded-lg bg-white/10" />
      <div className="flex gap-2">
        <div className="h-6 w-16 rounded-full bg-white/10" />
        <div className="h-6 w-16 rounded-full bg-white/10" />
      </div>
    </div>
    {/* Skills */}
    <div className="flex gap-2 justify-center flex-wrap mb-6">
      {[80, 64, 96, 72].map((w, i) => (
        <div key={i} className="h-7 rounded-full bg-white/10" style={{ width: w }} />
      ))}
    </div>
    {/* About */}
    <div className="space-y-2 px-2">
      <div className="h-4 w-full rounded bg-white/10" />
      <div className="h-4 w-5/6 rounded bg-white/10" />
      <div className="h-4 w-4/6 rounded bg-white/10" />
    </div>
  </div>
);

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const loggedInUser = useSelector((store) => store.user);

  const [profile, setProfile] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("none");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/user/${userId}`, {
          withCredentials: true,
        });
        setProfile(res.data.user);
        setConnectionStatus(res.data.connectionStatus);
      } catch (err) {
        setError(
          err?.response?.status === 404
            ? "This user doesn't exist."
            : "Failed to load profile."
        );
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchProfile();
  }, [userId]);

  const isOwnProfile =
    loggedInUser?._id?.toString() === userId?.toString();

  // ── Loading ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col pt-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/40 hover:text-white transition text-sm mb-6 px-4 w-fit"
        >
          <FiArrowLeft size={15} /> Back
        </button>
        <ProfileSkeleton />
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center p-10 bg-white border-4 border-[#0a0a0a] shadow-[8px_8px_0px_#0a0a0a] rounded-3xl max-w-sm">
          <p className="text-5xl mb-4">😕</p>
          <h2 className="text-[#0a0a0a] font-black text-xl mb-2">Not found</h2>
          <p className="text-gray-600 font-bold text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="neo-btn-primary"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const photoUrl =
    profile.photoUrl ||
    "https://geographyandyou.com/images/user-profile.png";

  return (
    <div className="min-h-[80vh] flex flex-col items-center px-4 pb-16 pt-6">
      {/* Back button */}
      <div className="w-full max-w-lg mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/40 hover:text-white transition text-sm w-fit"
        >
          <FiArrowLeft size={15} /> Back
        </button>
      </div>

      {/* ── Profile card ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-lg neo-card p-0"
      >
        {/* ── Hero banner with solid background ───────────── */}
        <div className="relative h-44 overflow-hidden bg-gradient-to-tr from-[#ccff00] to-[#a855f7] border-b-4 border-[#0a0a0a]">
          {/* Abstract background shape */}
          <div className="absolute top-4 left-4 w-20 h-20 border-[6px] border-[#0a0a0a] rounded-full opacity-30" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white border-[6px] border-[#0a0a0a] rounded-xl transform rotate-12 opacity-30" />
        </div>

        {/* ── Card body ────────────────────────────────────────────── */}
        <div className="bg-white pb-8">
          {/* Avatar — overlaps the banner */}
          <div className="flex justify-center -mt-14 mb-5">
            <div className="relative">
              <motion.img
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: imgLoaded ? 1 : 0 }}
                transition={{ duration: 0.35 }}
                src={photoUrl}
                alt={profile.firstName}
                onLoad={() => setImgLoaded(true)}
                className="w-28 h-28 rounded-full object-cover border-4 border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] bg-white"
              />
              {/* Loading placeholder until img loads */}
              {!imgLoaded && (
                <div className="absolute inset-0 w-28 h-28 rounded-full bg-gray-200 animate-pulse border-4 border-[#0a0a0a]" />
              )}
            </div>
          </div>

          {/* Name + meta tags */}
          <div className="flex flex-col items-center gap-2 px-6 mb-5">
            <h1 className="text-3xl font-black text-[#0a0a0a] tracking-tight text-center">
              {profile.firstName} {profile.lastName}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {profile.age && (
                <span className="text-xs font-bold text-[#0a0a0a] bg-white border-2 border-[#0a0a0a] px-3 py-1 rounded-full shadow-[2px_2px_0px_#0a0a0a]">
                  AGE {profile.age}
                </span>
              )}
              {profile.gender && (
                <span className="text-xs font-bold text-[#0a0a0a] bg-white border-2 border-[#0a0a0a] px-3 py-1 rounded-full capitalize shadow-[2px_2px_0px_#0a0a0a]">
                  {profile.gender}
                </span>
              )}
              {profile.helpfulAnswers > 0 && (
                <span className="text-xs font-bold text-[#0a0a0a] bg-[#ccff00] border-2 border-[#0a0a0a] px-3 py-1 rounded-full capitalize shadow-[2px_2px_0px_#0a0a0a] flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  {profile.helpfulAnswers} Helpful Answer{profile.helpfulAnswers > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="mx-6 mb-5 h-[2px] bg-[#0a0a0a]" />

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="px-6 mb-6">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 text-center">
                Skills
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {profile.skills.map((skill, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * i, duration: 0.25 }}
                    className={`text-xs px-4 py-1.5 rounded-full border-2 border-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a] font-bold tracking-wide ${
                      SKILL_COLORS[i % SKILL_COLORS.length]
                    }`}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          {/* About */}
          {profile.about && (
            <div className="mx-6 mb-8 p-6 bg-[#f4f4f5] border-2 border-[#0a0a0a] rounded-xl shadow-[4px_4px_0px_#0a0a0a]">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                About
              </p>
              <p className="text-[#0a0a0a] font-medium text-sm leading-relaxed">
                {profile.about}
              </p>
            </div>
          )}

          {/* Action button */}
          <div className="px-6 flex justify-center">
            {!isOwnProfile && connectionStatus === "accepted" && (
              <Link
                to={`/chat/${userId}`}
                className="flex items-center gap-2.5 px-8 py-3 bg-[#ccff00] text-[#0a0a0a] border-2 border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#0a0a0a] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all rounded-full font-black uppercase tracking-wider text-sm"
              >
                <FiMessageCircle size={18} strokeWidth={3} />
                Message
              </Link>
            )}

            {!isOwnProfile && connectionStatus === "pending" && (
              <div className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#0a0a0a] text-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] rounded-full font-bold text-sm">
                ⏳ Request Pending
              </div>
            )}

            {!isOwnProfile &&
              (connectionStatus === "none" ||
                connectionStatus === "ignored") && (
                <div className="px-6 py-3 bg-gray-200 border-2 border-[#0a0a0a] text-gray-500 rounded-full font-bold text-sm">
                  Not connected
                </div>
              )}

            {isOwnProfile && (
              <Link
                to="/profile"
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#0a0a0a] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all rounded-full text-[#0a0a0a] text-sm font-black uppercase tracking-wider"
              >
                <FiUser size={18} strokeWidth={3} />
                Edit my profile
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfilePage;
