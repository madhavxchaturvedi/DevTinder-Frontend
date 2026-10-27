import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { BASE_URL, DEFAULT_AVATAR } from "../utils/constants";
import { addUser } from "../redux/userSlice";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { toast } from "sonner";
import {
  Camera,
  Code2,
  User,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  X,
  Sparkles,
  Share2,
} from "lucide-react";

const STEPS = [
  { id: "photo", title: "Profile Photo", icon: Camera, desc: "Add a profile photo URL to represent your developer profile." },
  { id: "skills", title: "Tech Stack", icon: Code2, desc: "Add languages, frameworks, and tools in your stack." },
  { id: "bio", title: "About You", icon: User, desc: "Share your professional headline and developer background." },
  { id: "review", title: "Ready to Ship", icon: Sparkles, desc: "Review your developer profile and launch into OctoPair." },
];

const SUGGESTED_SKILLS = [
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "Tailwind CSS",
  "Next.js",
  "Go",
  "Rust",
  "PostgreSQL",
  "Docker",
  "GraphQL",
  "Machine Learning",
];

const Onboarding = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || DEFAULT_AVATAR);
  const [skills, setSkills] = useState(user?.skills || ["React", "TypeScript"]);
  const [skillInput, setSkillInput] = useState("");
  const [headline, setHeadline] = useState(user?.headline || "");
  const [about, setAbout] = useState(user?.about || "");
  const [twitterUrl, setTwitterUrl] = useState(user?.twitterUrl || "");
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolioUrl || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStep = STEPS[currentStepIndex];

  const handleAddSkill = (skillToAdd) => {
    const trimmed = (skillToAdd || skillInput).trim();
    if (!trimmed) return;
    if (!skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    try {
      setIsSubmitting(true);
      const payload = {
        photoUrl: photoUrl || DEFAULT_AVATAR,
        skills,
        headline,
        about,
        twitterUrl,
        portfolioUrl,
        profileComplete: true,
      };

      const res = await axios.post(`${BASE_URL}/profile/edit`, payload, {
        withCredentials: true,
      });

      const updatedUser = res?.data?.data || { ...user, ...payload, profileComplete: true };
      dispatch(addUser(updatedUser));
      toast.success("Welcome aboard! Developer profile ready.");
      navigate("/feed");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to complete onboarding.");
      console.error("Onboarding error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const initials = (
    (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "")
  ).toUpperCase() || "D";

  return (
    <div className="min-h-dvh w-full bg-[#09090b] text-[#f0f0f0] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Main Container */}
      <div className="w-full max-w-xl z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00] text-xs font-mono font-bold mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Developer Onboarding
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#f0f0f0]">
            Complete Your Profile
          </h1>
          <p className="text-[#52525b] text-sm mt-1">
            Establish your identity and tech stack to start matching with developers.
          </p>
        </div>

        {/* Lime Step Dots Indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => idx <= currentStepIndex && setCurrentStepIndex(idx)}
                  className={`flex items-center gap-2 transition-all cursor-pointer ${
                    idx <= currentStepIndex ? "opacity-100" : "opacity-40"
                  }`}
                  aria-label={step.title}
                >
                  <div
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      isCurrent
                        ? "bg-[#ccff00] shadow-[0_0_12px_rgba(204,255,0,0.8)] scale-125 ring-2 ring-[#ccff00]/30"
                        : isCompleted
                        ? "bg-[#ccff00]/80"
                        : "bg-white/10"
                    }`}
                  />
                  <span
                    className={`text-xs font-mono hidden sm:inline ${
                      isCurrent ? "text-[#ccff00] font-bold" : "text-[#52525b]"
                    }`}
                  >
                    {step.title}
                  </span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`h-[1px] w-6 sm:w-10 transition-colors duration-300 ${
                      idx < currentStepIndex ? "bg-[#ccff00]/50" : "bg-white/10"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Glass Wizard Card */}
        <div className="glass-card p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.5)] relative">
          <AnimatePresence mode="wait">
            <Motion.div
              key={currentStep.id}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step Header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.07]">
                <div className="w-10 h-10 rounded-xl bg-[#ccff00]/10 text-[#ccff00] flex items-center justify-center font-bold">
                  {React.createElement(currentStep.icon, { className: "w-5 h-5" })}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#f0f0f0]">{currentStep.title}</h2>
                  <p className="text-xs text-[#52525b]">{currentStep.desc}</p>
                </div>
              </div>

              {/* Step 1: Photo */}
              {currentStep.id === "photo" && (
                <div className="flex flex-col items-center gap-6 py-4">
                  <Avatar className="w-24 h-24 rounded-xl border-2 border-[#ccff00] shadow-xl">
                    <AvatarImage src={photoUrl} alt="Preview" />
                    <AvatarFallback className="text-2xl font-bold bg-[#1a1a1f] text-[#f0f0f0]">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="w-full space-y-2">
                    <label className="text-xs font-semibold text-[#52525b] block">
                      Profile Photo URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-... or avatar link"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      className="w-full bg-[#111113] border border-white/10 rounded-lg text-sm px-4 py-2.5 text-[#f0f0f0] placeholder:text-[#52525b] focus:outline-none focus:border-[#ccff00]/60 focus:ring-1 focus:ring-[#ccff00]/50"
                    />
                    <p className="text-[11px] text-[#52525b]">
                      Provide a direct image URL from GitHub, Unsplash, or Cloudinary.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Skills */}
              {currentStep.id === "skills" && (
                <div className="space-y-5">
                  <div className="flex gap-2">
                    <input
                      placeholder="Type a skill (e.g. React, Go, Docker)"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      className="flex-1 bg-[#111113] border border-white/10 rounded-lg text-sm px-4 py-2.5 text-[#f0f0f0] placeholder:text-[#52525b] focus:outline-none focus:border-[#ccff00]/60 focus:ring-1 focus:ring-[#ccff00]/50"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSkill()}
                      className="inline-flex items-center gap-1 bg-[#ccff00] text-black font-bold text-xs px-4 py-2.5 rounded-lg hover:bg-[#d9ff33] transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>

                  {/* Active Skills */}
                  <div>
                    <label className="text-xs font-semibold text-[#52525b] block mb-2">
                      Selected Tech Stack ({skills.length})
                    </label>
                    <div className="flex flex-wrap gap-2 min-h-[44px] p-3 bg-black/40 rounded-xl border border-white/[0.07]">
                      {skills.length === 0 ? (
                        <span className="text-xs text-[#52525b] italic">
                          No skills selected yet. Add some above.
                        </span>
                      ) : (
                        skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-mono font-bold bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="hover:bg-[#ccff00]/20 rounded p-0.5 ml-1 transition-colors cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div>
                    <label className="text-xs font-semibold text-[#52525b] block mb-2">
                      Suggested Tools
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_SKILLS.filter(
                        (s) => !skills.some((userSkill) => userSkill.toLowerCase() === s.toLowerCase())
                      ).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleAddSkill(s)}
                          className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#a0a0a0] hover:text-[#f0f0f0] border border-white/[0.07] transition-colors cursor-pointer font-mono"
                        >
                          + {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Bio */}
              {currentStep.id === "bio" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#52525b] block">
                      Professional Headline
                    </label>
                    <input
                      placeholder="Full-Stack Engineer @ Open Source | Systems & Cloud"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      maxLength={100}
                      className="w-full bg-[#111113] border border-white/10 rounded-lg text-sm px-4 py-2.5 text-[#f0f0f0] placeholder:text-[#52525b] focus:outline-none focus:border-[#ccff00]/60 focus:ring-1 focus:ring-[#ccff00]/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#52525b] block">
                      About / Bio
                    </label>
                    <textarea
                      placeholder="Share what you are building, technologies you enjoy, or projects you want to ship..."
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      rows={4}
                      className="w-full bg-[#111113] border border-white/10 rounded-lg text-sm p-3 text-[#f0f0f0] placeholder:text-[#52525b] focus:outline-none focus:border-[#ccff00]/60 focus:ring-1 focus:ring-[#ccff00]/50 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#52525b] block">
                        Portfolio URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://yourdomain.dev"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        className="w-full bg-[#111113] border border-white/10 rounded-lg text-xs px-3 py-2 text-[#f0f0f0] placeholder:text-[#52525b] focus:outline-none focus:border-[#ccff00]/60"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#52525b] block">
                        Twitter / X Handle
                      </label>
                      <input
                        placeholder="https://x.com/yourhandle"
                        value={twitterUrl}
                        onChange={(e) => setTwitterUrl(e.target.value)}
                        className="w-full bg-[#111113] border border-white/10 rounded-lg text-xs px-3 py-2 text-[#f0f0f0] placeholder:text-[#52525b] focus:outline-none focus:border-[#ccff00]/60"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review / Ready to Ship */}
              {currentStep.id === "review" && (
                <div className="space-y-6 py-2">
                  <div className="p-4 rounded-xl bg-black/40 border border-white/[0.07] flex items-center gap-4">
                    <Avatar className="w-16 h-16 rounded-xl border border-[#ccff00]">
                      <AvatarImage src={photoUrl} alt="Preview" />
                      <AvatarFallback className="text-xl font-bold bg-[#1a1a1f] text-[#f0f0f0]">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-base text-[#f0f0f0] truncate">
                        {user?.firstName} {user?.lastName}
                      </h3>
                      <p className="text-xs text-[#ccff00] font-mono truncate">
                        {headline || "Developer"}
                      </p>
                      <p className="text-xs text-[#52525b] line-clamp-2 mt-1">
                        {about || "Ready to connect and collaborate on OctoPair."}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-mono font-bold text-[#52525b] uppercase tracking-wider block mb-2">
                      Active Tech Stack
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((s) => (
                        <span
                          key={s}
                          className="rounded-md px-2 py-0.5 text-[11px] font-mono font-bold bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-[#52525b] text-center">
                    Everything looks good! Click below to enter your workspace and feed.
                  </p>
                </div>
              )}
            </Motion.div>
          </AnimatePresence>

          {/* Wizard Controls */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/[0.07]">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStepIndex === 0}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                currentStepIndex === 0
                  ? "text-white/20 cursor-not-allowed"
                  : "text-[#a0a0a0] hover:text-[#f0f0f0] hover:bg-white/5"
              }`}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 bg-[#ccff00] text-black font-bold text-xs px-5 py-2.5 rounded-lg hover:bg-[#d9ff33] transition-all cursor-pointer shadow-[0_0_20px_rgba(204,255,0,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStepIndex === STEPS.length - 1 ? (
                <>
                  Complete Setup & Launch <CheckCircle2 className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next Step <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
