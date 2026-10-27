import { useState, useRef } from "react";
import UserCard from "./UserCard";
import { Link, useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  UserCheck,
  Camera,
  UploadCloud,
  X,
  Check,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Edit3,
} from "lucide-react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { addUser } from "../redux/userSlice";
import { toast } from "sonner";

// Cover Photo Upload Section
const CoverUpload = ({ currentCover, onUploadSuccess }) => {
  const coverInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadState, setUploadState] = useState("idle"); // idle | uploading | success | error
  const [preview, setPreview] = useState(currentCover);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploadState("uploading");

    try {
      const formData = new FormData();
      formData.append("cover", file);

      const res = await axios.post(BASE_URL + "/profile/upload-cover", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadState("success");
      const coverUrl = res.data.coverPhoto;
      onUploadSuccess(coverUrl);
      toast.success("Cover photo uploaded!");
      setTimeout(() => setUploadState("idle"), 2500);
    } catch (err) {
      setUploadState("error");
      setPreview(currentCover);
      toast.error(err?.response?.data?.message || "Upload failed");
      setTimeout(() => setUploadState("idle"), 2500);
    }
  };

  const onFileChange = (e) => handleFile(e.target.files[0]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="w-full mb-6">
      <label className="block text-xs font-mono font-bold text-[#52525b] mb-2 uppercase tracking-wider text-left">
        Cover Photo
      </label>
      <div
        className={`relative h-36 w-full rounded-xl overflow-hidden cursor-pointer group border border-white/[0.07] transition-all duration-300 ${
          dragOver ? "ring-2 ring-[#b266ff]" : ""
        }`}
        style={
          preview
            ? { backgroundImage: `url(${preview})`, backgroundSize: "cover", backgroundPosition: "center" }
            : {}
        }
        onClick={() => coverInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        {!preview && (
          <div className="w-full h-full bg-gradient-to-r from-[#ccff00]/10 via-transparent to-[#b266ff]/10 flex items-center justify-center">
            <span className="text-xs text-[#52525b] font-mono">No cover photo set (gradient banner active)</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
          <Camera className="text-[#f0f0f0] w-4 h-4" />
          <span className="text-[#f0f0f0] text-xs font-semibold">Change Cover</span>
        </div>

        {uploadState === "uploading" && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#b266ff] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-2 px-1">
        <button
          type="button"
          onClick={() => coverInputRef.current?.click()}
          disabled={uploadState === "uploading"}
          className="flex items-center gap-1.5 text-xs text-[#52525b] hover:text-[#f0f0f0] font-semibold transition disabled:opacity-50 cursor-pointer"
        >
          <UploadCloud size={14} />
          <span>{uploadState === "uploading" ? "Uploading..." : "Upload cover photo"}</span>
        </button>
        <p className="text-[10px] text-[#52525b] font-mono">JPG, PNG up to 5 MB</p>
      </div>

      <input
        ref={coverInputRef}
        type="file"
        name="cover"
        id="cover"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
};

// Photo Upload Section
const PhotoUpload = ({ currentPhoto, onUploadSuccess }) => {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadState, setUploadState] = useState("idle"); // idle | uploading | success | error
  const [preview, setPreview] = useState(currentPhoto);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploadState("uploading");

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const res = await axios.post(BASE_URL + "/profile/upload-photo", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadState("success");
      onUploadSuccess(res.data.photoUrl);
      toast.success("Photo uploaded!");

      // Reset success badge after 2.5s
      setTimeout(() => setUploadState("idle"), 2500);
    } catch (err) {
      setUploadState("error");
      setPreview(currentPhoto); // revert preview
      toast.error(err?.response?.data?.message || "Upload failed");
      setTimeout(() => setUploadState("idle"), 2500);
    }
  };

  const onFileChange = (e) => handleFile(e.target.files[0]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="flex flex-col items-center gap-3 mb-6">
      {/* Clickable photo square (matching 64px rounded-xl design language) */}
      <div
        className={`relative w-24 h-24 rounded-xl cursor-pointer group transition-all duration-300 ${
          dragOver ? "scale-105 ring-2 ring-[#ccff00]" : ""
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <div className="w-full h-full rounded-xl p-[2px] bg-gradient-to-tr from-[#ccff00] to-[#b266ff] shadow-lg group-hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all">
          <img
            src={preview || "https://ui-avatars.com/api/?name=User&background=111113&color=ccff00"}
            alt="Profile"
            className="w-full h-full rounded-xl object-cover border-2 border-[#111113] bg-[#09090b]"
          />
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-[2px] rounded-xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 backdrop-blur-xs">
          <Camera className="text-[#f0f0f0] w-4 h-4" />
          <span className="text-[#f0f0f0] text-[10px] font-semibold">Change</span>
        </div>

        {/* Upload state badge */}
        <AnimatePresence>
          {uploadState === "uploading" && (
            <Motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#111113] rounded-md flex items-center justify-center border border-[#b266ff]/40"
            >
              <div className="w-3.5 h-3.5 border-2 border-[#b266ff] border-t-transparent rounded-full animate-spin" />
            </Motion.div>
          )}
          {uploadState === "success" && (
            <Motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#ccff00] rounded-md flex items-center justify-center border border-black shadow-[0_0_10px_rgba(204,255,0,0.5)]"
            >
              <Check className="text-black" size={13} />
            </Motion.div>
          )}
          {uploadState === "error" && (
            <Motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-red-500 rounded-md flex items-center justify-center border border-black"
            >
              <X className="text-white" size={13} />
            </Motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Upload hint */}
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadState === "uploading"}
          className="flex items-center gap-1.5 text-xs text-[#52525b] hover:text-[#f0f0f0] font-semibold transition disabled:opacity-50 cursor-pointer"
        >
          <UploadCloud size={14} />
          <span>{uploadState === "uploading" ? "Uploading..." : "Upload profile photo"}</span>
        </button>
        <p className="text-[10px] text-[#52525b] font-mono">JPG, PNG, GIF up to 5 MB</p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
};

// Skills Tag / Chip Input Component
const SkillsTagInput = ({ skills = [], onChange }) => {
  const [skillInput, setSkillInput] = useState("");

  const handleAddSkill = (text) => {
    const trimmed = text.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
    }
    setSkillInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddSkill(skillInput);
    } else if (e.key === "Backspace" && !skillInput && skills.length > 0) {
      onChange(skills.slice(0, -1));
    }
  };

  const removeSkill = (indexToRemove) => {
    onChange(skills.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 p-3 bg-[#111113] rounded-lg border border-white/10 focus-within:border-[#ccff00] focus-within:ring-1 focus-within:ring-[#ccff00] transition-all min-h-[50px] items-center">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20"
          >
            <span>{skill}</span>
            <button
              type="button"
              onClick={() => removeSkill(index)}
              className="hover:text-red-400 transition-colors focus:outline-none cursor-pointer"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (skillInput.trim()) handleAddSkill(skillInput);
          }}
          placeholder={skills.length === 0 ? "Type skill & press Enter or comma..." : "Add skill..."}
          className="flex-1 bg-transparent text-[#f0f0f0] font-mono text-xs outline-none placeholder:text-[#52525b] min-w-[140px]"
        />
      </div>
      <p className="text-[10px] font-mono text-[#52525b] mt-1.5">
        Press Enter or comma to add multi-word skills like &quot;Machine Learning&quot;.
      </p>
    </div>
  );
};

// Main EditProfile Component
const EditProfile = ({ user }) => {
  const {
    firstName,
    lastName,
    age,
    gender,
    photoUrl,
    about,
    skills,
    headline,
    location,
    coverPhoto,
    twitterUrl,
    portfolioUrl,
  } = user;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName,
    lastName,
    age,
    gender,
    photoUrl,
    about,
    skills: skills || [],
    headline: headline || "",
    location: location || "",
    coverPhoto: coverPhoto || "",
    twitterUrl: twitterUrl || "",
    portfolioUrl: portfolioUrl || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSkillsChange = (newSkills) => {
    setFormData((prev) => ({
      ...prev,
      skills: newSkills,
    }));
  };

  const handlePhotoUploaded = (newPhotoUrl) => {
    setFormData((prev) => ({ ...prev, photoUrl: newPhotoUrl }));
    dispatch(addUser({ ...user, photoUrl: newPhotoUrl }));
  };

  const handleCoverUploaded = (newCoverUrl) => {
    setFormData((prev) => ({ ...prev, coverPhoto: newCoverUrl }));
    dispatch(addUser({ ...user, coverPhoto: newCoverUrl }));
  };

  const fields = [
    { label: "First Name", name: "firstName", type: "text", placeholder: "Enter your first name" },
    { label: "Last Name", name: "lastName", type: "text", placeholder: "Enter your last name" },
    { label: "Headline", name: "headline", type: "text", placeholder: "e.g. Full-Stack Dev | React & Node.js" },
    { label: "Location", name: "location", type: "text", placeholder: "e.g. Bengaluru, India" },
    { label: "Age", name: "age", type: "number", placeholder: "Enter your age" },
    { label: "Gender", name: "gender", type: "select", options: ["male", "female", "other"] },
    {
      label: "Skills",
      name: "skills",
      type: "skills",
    },
    {
      label: "Twitter / X URL",
      name: "twitterUrl",
      type: "text",
      placeholder: "https://x.com/yourusername",
    },
    {
      label: "Portfolio Website",
      name: "portfolioUrl",
      type: "text",
      placeholder: "https://yourportfolio.com",
    },
    {
      label: "About You",
      name: "about",
      type: "textarea",
      placeholder: "Write something about yourself... (Markdown supported)",
    },
  ];

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(BASE_URL + "/profile/edit", formData, {
        withCredentials: true,
      });
      const updatedUser = res?.data?.data || user;
      dispatch(addUser(updatedUser));
      toast.success("Profile updated successfully!");
      const targetUserId = updatedUser?._id || user?._id;
      if (targetUserId) {
        navigate(`/user/${targetUserId}`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
  };

  return (
    <div className="w-full px-4 flex flex-col md:flex-row items-start justify-center gap-10 py-6 max-w-7xl mx-auto">
      {/* Left: Form */}
      <div className="w-full md:w-2/3 flex justify-center">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="glass-card border border-white/[0.07] rounded-xl px-8 py-10 w-full max-w-2xl bg-[#111113]"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f0f0f0] flex justify-center items-center gap-2.5 tracking-tight">
              <Edit3 className="text-[#ccff00] w-6 h-6" />
              Edit Profile
            </h2>
            <p className="text-xs text-[#52525b] mt-1.5 font-mono">Manage your public developer identity</p>
          </div>

          {/* Cover Photo Upload */}
          <CoverUpload
            currentCover={formData.coverPhoto}
            onUploadSuccess={handleCoverUploaded}
          />

          {/* Photo Upload */}
          <PhotoUpload
            currentPhoto={formData.photoUrl}
            onUploadSuccess={handlePhotoUploaded}
          />

          <div className="border-t border-white/[0.07] mb-8 w-2/3 mx-auto" />

          {/* Form Fields */}
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={saveProfile}>
            {fields.map((field) => (
              <div
                key={field.name}
                className={field.type === "textarea" || field.type === "skills" ? "md:col-span-2" : ""}
              >
                <label className="block text-xs font-mono font-bold text-[#52525b] mb-2 uppercase tracking-wider">
                  {field.label}
                </label>

                {field.type === "skills" ? (
                  <SkillsTagInput
                    skills={formData.skills || []}
                    onChange={handleSkillsChange}
                  />
                ) : field.type === "select" ? (
                  <div className="relative">
                    <select
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                      className="w-full bg-[#111113] text-[#f0f0f0] font-medium px-4 py-3 rounded-lg border border-white/10 focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] outline-none transition-all text-sm appearance-none pr-10 cursor-pointer"
                    >
                      <option value="">Select Gender</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#52525b] w-4 h-4" />
                  </div>
                ) : field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    rows={4}
                    placeholder={field.placeholder}
                    className="w-full bg-[#111113] text-[#f0f0f0] font-normal px-4 py-3 rounded-lg border border-white/10 focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] outline-none transition-all placeholder:text-[#52525b] resize-none text-sm"
                  />
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="w-full bg-[#111113] text-[#f0f0f0] font-normal px-4 py-3 rounded-lg border border-white/10 focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] outline-none transition-all placeholder:text-[#52525b] text-sm"
                  />
                )}
              </div>
            ))}

            {/* Save button */}
            <div className="md:col-span-2 mt-4">
              <button
                type="submit"
                className="w-full bg-[#ccff00] text-black font-bold font-mono uppercase tracking-wider py-3.5 rounded-lg hover:bg-[#d9ff33] transition-all shadow-[0_0_20px_rgba(204,255,0,0.2)] cursor-pointer text-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Motion.div>
      </div>

      {/* Right: Live Preview */}
      <div className="w-full md:w-1/3 flex flex-col items-center gap-4 pt-2 sticky top-6">
        <p className="text-[11px] text-[#52525b] uppercase tracking-widest font-mono font-bold">
          Live Preview
        </p>
        <UserCard user={formData} />
        <Link
          to={`/user/${user?._id}`}
          className="w-full text-center py-2.5 px-4 rounded-lg border border-white/10 hover:border-[#ccff00] text-xs font-mono font-bold uppercase tracking-wider text-[#f0f0f0] hover:text-[#ccff00] transition-all flex items-center justify-center gap-2 cursor-pointer bg-[#111113]"
        >
          <span>View my public profile</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
};

export default EditProfile;
