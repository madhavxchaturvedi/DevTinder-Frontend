import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FiArrowLeft, FiMessageCircle, FiUser } from "react-icons/fi";

const SKILL_COLORS = [
  "bg-violet-500/25 text-violet-300 border-violet-500/40",
  "bg-blue-500/25 text-blue-300 border-blue-500/40",
  "bg-emerald-500/25 text-emerald-300 border-emerald-500/40",
  "bg-amber-500/25 text-amber-300 border-amber-500/40",
  "bg-pink-500/25 text-pink-300 border-pink-500/40",
  "bg-cyan-500/25 text-cyan-300 border-cyan-500/40",
  "bg-orange-500/25 text-orange-300 border-orange-500/40",
  "bg-lime-500/25 text-lime-300 border-lime-500/40",
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
        <div className="text-center p-10 bg-white/5 border border-white/10 rounded-3xl max-w-sm">
          <p className="text-5xl mb-4">😕</p>
          <h2 className="text-white font-bold text-xl mb-2">Not found</h2>
          <p className="text-white/50 text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-[#fe5a33] to-[#fe0142] text-white text-sm font-semibold shadow-lg shadow-[#fe0142]/30"
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
        className="w-full max-w-lg"
      >
        {/* ── Hero banner with blurred photo background ───────────── */}
        <div className="relative h-44 rounded-t-3xl overflow-hidden">
          {/* Blurred background photo */}
          <img
            src={photoUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-60"
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-[#0d0d0d]" />
          {/* Subtle red-orange top glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#fe5a33]/20 via-transparent to-[#fe0142]/10" />
        </div>

        {/* ── Card body ────────────────────────────────────────────── */}
        <div className="bg-[#0d0d0d]/95 border border-white/10 border-t-0 rounded-b-3xl shadow-2xl shadow-black/60 backdrop-blur-xl pb-8">
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
                className="w-28 h-28 rounded-full object-cover ring-4 ring-[#0d0d0d] shadow-2xl shadow-black/80"
              />
              {/* Loading placeholder until img loads */}
              {!imgLoaded && (
                <div className="absolute inset-0 w-28 h-28 rounded-full bg-white/10 animate-pulse ring-4 ring-[#0d0d0d]" />
              )}
              {/* Accent ring */}
              <div className="absolute inset-0 rounded-full ring-2 ring-[#fe0142]/30 ring-offset-2 ring-offset-[#0d0d0d]" />
            </div>
          </div>

          {/* Name + meta tags */}
          <div className="flex flex-col items-center gap-2 px-6 mb-5">
            <h1 className="text-2xl font-extrabold text-white tracking-tight text-center">
              {profile.firstName} {profile.lastName}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {profile.age && (
                <span className="text-xs font-semibold text-white/50 bg-white/8 border border-white/10 px-3 py-1 rounded-full">
                  AGE {profile.age}
                </span>
              )}
              {profile.gender && (
                <span className="text-xs font-semibold text-white/50 bg-white/8 border border-white/10 px-3 py-1 rounded-full capitalize">
                  {profile.gender}
                </span>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="mx-6 mb-5 h-px bg-white/8" />

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="px-6 mb-6">
              <p className="text-[10px] font-bold text-white/25 uppercase tracking-[0.15em] mb-3 text-center">
                Skills
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {profile.skills.map((skill, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * i, duration: 0.25 }}
                    className={`text-xs px-3 py-1.5 rounded-full border font-semibold tracking-wide ${
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
            <div className="mx-6 mb-7 p-4 rounded-2xl bg-white/[0.04] border border-white/8">
              <p className="text-[10px] font-bold text-white/25 uppercase tracking-[0.15em] mb-2">
                About
              </p>
              <p className="text-white/75 text-sm leading-relaxed">
                {profile.about}
              </p>
            </div>
          )}

          {/* Action button */}
          <div className="px-6 flex justify-center">
            {!isOwnProfile && connectionStatus === "accepted" && (
              <Link
                to={`/chat/${userId}`}
                className="flex items-center gap-2.5 px-8 py-3 rounded-2xl bg-gradient-to-r from-[#fe5a33] via-[#fe0142] to-[#fe6d27] text-white font-bold shadow-xl shadow-[#fe0142]/40 hover:scale-[1.03] hover:shadow-[#fe0142]/60 active:scale-[0.97] transition-all text-sm"
              >
                <FiMessageCircle size={17} />
                Message
              </Link>
            )}

            {!isOwnProfile && connectionStatus === "pending" && (
              <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-sm font-semibold">
                ⏳ Request Pending
              </div>
            )}

            {!isOwnProfile &&
              (connectionStatus === "none" ||
                connectionStatus === "ignored") && (
                <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/35 text-sm font-medium">
                  Not connected
                </div>
              )}

            {isOwnProfile && (
              <Link
                to="/profile"
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-sm font-medium transition-all"
              >
                <FiUser size={15} />
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
