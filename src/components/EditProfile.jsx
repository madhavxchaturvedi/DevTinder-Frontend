import React, { useState, useRef } from "react";
import UserCard from "./UserCard";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserEdit, FaCamera } from "react-icons/fa";
import { FiUploadCloud, FiX, FiCheck } from "react-icons/fi";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { addUser } from "../redux/userSlice";
import toast from "react-hot-toast";

// ── Photo Upload Section ───────────────────────────────────────────
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
      toast.success("Photo uploaded!", { style: { background: '#121212', color: '#e5e5e5' } });

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
      {/* Clickable photo circle */}
      <div
        className={`relative w-28 h-28 rounded-full cursor-pointer group transition-all duration-300 ${
          dragOver ? "scale-105 ring-4 ring-[#a855f7]/60" : ""
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        {/* Profile image */}
        <div className="w-full h-full rounded-full p-[3px] bg-gradient-to-tr from-[#ccff00] to-[#a855f7] shadow-lg group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all">
          <img
            src={preview || "https://geographyandyou.com/images/user-profile.png"}
            alt="Profile"
            className="w-full h-full rounded-full object-cover border-4 border-[#121212] bg-[#0a0a0a]"
          />
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-[3px] rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 backdrop-blur-sm">
          <FaCamera className="text-white text-xl" />
          <span className="text-white text-[10px] font-semibold">Change</span>
        </div>

        {/* Upload state badge */}
        <AnimatePresence>
          {uploadState === "uploading" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#121212] rounded-full flex items-center justify-center border-2 border-[#a855f7]/40"
            >
              <div className="w-4 h-4 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}
          {uploadState === "success" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#ccff00] rounded-full flex items-center justify-center border-2 border-[#121212]"
            >
              <FiCheck className="text-[#0a0a0a]" size={14} />
            </motion.div>
          )}
          {uploadState === "error" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-2 border-[#121212]"
            >
              <FiX className="text-white" size={14} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Upload hint */}
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadState === "uploading"}
          className="flex items-center gap-1.5 text-xs text-[#a3a3a3] hover:text-white font-semibold transition disabled:opacity-50"
        >
          <FiUploadCloud size={14} />
          {uploadState === "uploading" ? "Uploading..." : "Upload new photo"}
        </button>
        <p className="text-[10px] text-gray-500">JPG, PNG, GIF up to 5 MB</p>
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

// ── Main EditProfile Component ─────────────────────────────────────
const EditProfile = ({ user }) => {
  const { firstName, lastName, age, gender, photoUrl, about, skills } = user;
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    firstName,
    lastName,
    age,
    gender,
    photoUrl,
    about,
    skills: skills || [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "skills" ? value.split(",").map((s) => s.trim()) : value,
    }));
  };

  // Called by PhotoUpload when Cloudinary returns a URL
  const handlePhotoUploaded = (newPhotoUrl) => {
    setFormData((prev) => ({ ...prev, photoUrl: newPhotoUrl }));
  };

  const fields = [
    { label: "First Name", name: "firstName", type: "text", placeholder: "Enter your first name" },
    { label: "Last Name", name: "lastName", type: "text", placeholder: "Enter your last name" },
    { label: "Age", name: "age", type: "number", placeholder: "Enter your age" },
    { label: "Gender", name: "gender", type: "select", options: ["male", "female", "other"] },
    {
      label: "Skills (comma separated)",
      name: "skills",
      type: "text",
      placeholder: "eg: React, Node, MongoDB",
    },
    {
      label: "About You",
      name: "about",
      type: "textarea",
      placeholder: "Write something about yourself...",
    },
  ];

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(BASE_URL + "/profile/edit", formData, {
        withCredentials: true,
      });
      dispatch(addUser(res?.data?.data));
      toast.success("Profile updated successfully!", { style: { background: '#121212', color: '#e5e5e5' } });
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
  };

  return (
    <div className="w-full px-4 flex flex-col md:flex-row items-start justify-center gap-10 py-6 max-w-7xl mx-auto">
      {/* ── Left: Form ───────────────────────────────────────── */}
      <div className="w-full md:w-2/3 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-[#121212] border border-white/10 shadow-2xl rounded-3xl px-8 py-10 w-full max-w-2xl"
        >
          {/* Header */}
          <motion.div
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold text-white flex justify-center items-center gap-3 tracking-tight">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
              >
                <FaUserEdit className="text-[#a855f7]" />
              </motion.span>
              Edit Profile
            </h2>
            <p className="text-sm font-medium text-[#a3a3a3] mt-2">Manage your developer identity</p>
          </motion.div>

          {/* ── Photo Upload ──────────────────────────────────── */}
          <PhotoUpload
            currentPhoto={formData.photoUrl}
            onUploadSuccess={handlePhotoUploaded}
          />

          <div className="border-t border-white/10 mb-8 w-2/3 mx-auto" />

          {/* ── Form Fields ───────────────────────────────────── */}
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field, i) => (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.07, duration: 0.35 }}
                className={field.type === "textarea" ? "md:col-span-2" : ""}
              >
                <label className="block text-xs font-bold text-[#a3a3a3] mb-2 uppercase tracking-wider">
                  {field.label}
                </label>

                {field.type === "select" ? (
                  <select
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    className="w-full bg-[#0a0a0a] text-[#e5e5e5] font-semibold px-4 py-3.5 rounded-xl border border-white/10 focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] outline-none transition-all text-sm appearance-none"
                  >
                    <option value="">Select Gender</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    rows={4}
                    placeholder={field.placeholder}
                    className="w-full bg-[#0a0a0a] text-[#e5e5e5] font-semibold px-4 py-3.5 rounded-xl border border-white/10 focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] outline-none transition-all placeholder:text-gray-600 resize-none text-sm"
                  />
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={
                      field.name === "skills"
                        ? (formData.skills || []).join(", ")
                        : formData[field.name] || ""
                    }
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="w-full bg-[#0a0a0a] text-[#e5e5e5] font-semibold px-4 py-3.5 rounded-xl border border-white/10 focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] outline-none transition-all placeholder:text-gray-600 text-sm"
                  />
                )}
              </motion.div>
            ))}

            {/* Save button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="md:col-span-2 mt-4"
            >
              <button
                type="submit"
                onClick={saveProfile}
                className="w-full bg-[#ccff00] text-[#0a0a0a] font-bold py-4 rounded-xl hover:bg-[#bbf000] transition-colors shadow-lg shadow-[#ccff00]/10"
              >
                Save Changes
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>

      {/* ── Right: Live Preview ───────────────────────────────── */}
      <div className="w-full md:w-1/3 flex flex-col items-center gap-4 pt-2 sticky top-4">
        <p className="text-xs text-[#a3a3a3] uppercase tracking-widest font-bold">
          Live Preview
        </p>
        <UserCard user={formData} />
      </div>
    </div>
  );
};

export default EditProfile;
