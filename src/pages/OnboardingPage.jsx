import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { BASE_URL, DEFAULT_AVATAR } from "../utils/constants";
import { addUser } from "../redux/userSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Camera,
  Code2,
  User,
  Share2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Plus,
  X,
  Sparkles,
} from "lucide-react";

const STEPS = [
  { id: "photo", title: "Profile Photo", icon: Camera, desc: "Add a friendly face to your developer profile." },
  { id: "skills", title: "Tech Stack", icon: Code2, desc: "Select or add the languages & tools you use." },
  { id: "bio", title: "About You", icon: User, desc: "Tell the developer community who you are." },
  { id: "socials", title: "Social Links", icon: Share2, desc: "Connect your links for collaboration." },
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

const OnboardingPage = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || DEFAULT_AVATAR);
  const [skills, setSkills] = useState(user?.skills || ["React", "JavaScript"]);
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
      toast.success("Welcome aboard! Profile setup complete.");
      navigate("/feed");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to complete onboarding.");
      console.error("Onboarding error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-xl z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-semibold mb-3">
            <Sparkles className="h-3.5 w-3.5" /> Welcome to OctoPair
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Complete Your Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Let's get your developer identity set up before diving into the feed.
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="grid grid-cols-4 gap-2 mb-8">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={step.id} className="flex flex-col gap-1">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isCompleted
                      ? "bg-primary"
                      : isCurrent
                      ? "bg-primary/80 ring-2 ring-primary/30"
                      : "bg-muted"
                  }`}
                />
                <span className="text-[11px] font-medium text-center text-muted-foreground truncate hidden sm:block">
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Wizard Card */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          <AnimatePresence mode="wait">
            <Motion.div
              key={currentStep.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Step Header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/40">
                <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold">
                  {React.createElement(currentStep.icon, { className: "w-5 h-5" })}
                </div>
                <div>
                  <h2 className="text-lg font-bold">{currentStep.title}</h2>
                  <p className="text-xs text-muted-foreground">{currentStep.desc}</p>
                </div>
              </div>

              {/* Step 1: Photo */}
              {currentStep.id === "photo" && (
                <div className="flex flex-col items-center gap-6 py-4">
                  <Avatar className="w-28 h-28 border-4 border-primary/20 shadow-xl">
                    <AvatarImage src={photoUrl} alt="Preview" />
                    <AvatarFallback className="text-2xl font-bold bg-muted">
                      {user?.firstName?.[0] || "D"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="w-full space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">Avatar Image URL</label>
                    <Input
                      type="url"
                      placeholder="https://example.com/avatar.jpg"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      className="bg-background/50"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Paste a direct image link from GitHub, Gravatar, or Cloudinary.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Skills */}
              {currentStep.id === "skills" && (
                <div className="space-y-5">
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. Machine Learning, React, Go"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      className="bg-background/50"
                    />
                    <Button
                      type="button"
                      onClick={() => handleAddSkill()}
                      variant="secondary"
                      className="gap-1 font-semibold"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </Button>
                  </div>

                  {/* Active Skills */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-2">
                      Selected Tech Stack ({skills.length})
                    </label>
                    <div className="flex flex-wrap gap-2 min-h-[44px] p-2 bg-muted/30 rounded-xl border border-border/40">
                      {skills.length === 0 ? (
                        <span className="text-xs text-muted-foreground italic p-1">
                          No skills selected yet. Add some above!
                        </span>
                      ) : (
                        skills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="bg-primary/10 text-primary border-primary/20 gap-1 pl-2.5 pr-1.5 py-1 text-xs"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="hover:bg-primary/20 rounded-full p-0.5 ml-1 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-2">
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
                          className="text-xs px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40 transition-colors"
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
                    <label className="text-xs font-semibold text-muted-foreground">Professional Headline</label>
                    <Input
                      placeholder="e.g. Fullstack Engineer @ Startup | OSS Contributor"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      maxLength={100}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">About / Bio</label>
                    <Textarea
                      placeholder="Tell developers what you love building, languages you're exploring, or what projects you want to ship..."
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      rows={4}
                      className="bg-background/50 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Socials */}
              {currentStep.id === "socials" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Portfolio or Website URL</label>
                    <Input
                      type="url"
                      placeholder="https://yourname.dev"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Twitter / X Handle or URL</label>
                    <Input
                      placeholder="https://x.com/yourhandle"
                      value={twitterUrl}
                      onChange={(e) => setTwitterUrl(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                </div>
              )}
            </Motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-border/40">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              disabled={currentStepIndex === 0}
              className="gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>

            <Button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="gap-1.5 bg-primary text-primary-foreground font-bold hover:opacity-90"
            >
              {currentStepIndex === STEPS.length - 1 ? (
                <>
                  Complete Setup <CheckCircle2 className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next Step <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
