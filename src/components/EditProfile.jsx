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
      {/* Clickable photo circle */}
      <div
        className={`relative w-28 h-28 rounded-full cursor-pointer group transition-all duration-200 ${
          dragOver ? "scale-105 ring-4 ring-[#fe0142]/60" : ""
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        {/* Profile image */}
        <img
          src={preview || "https://geographyandyou.com/images/user-profile.png"}
          alt="Profile"
          className="w-28 h-28 rounded-full object-cover ring-4 ring-[#fe0142]/30 group-hover:ring-[#fe0142]/60 transition-all"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
          <FaCamera className="text-white text-xl" />
          <span className="text-white text-[10px] font-medium">Change</span>
        </div>

        {/* Upload state badge */}
        <AnimatePresence>
          {uploadState === "uploading" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#0e0e0e] rounded-full flex items-center justify-center border-2 border-[#fe0142]/40"
            >
              <div className="w-4 h-4 border-2 border-[#fe0142] border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}
          {uploadState === "success" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#0e0e0e]"
            >
              <FiCheck className="text-white" size={14} />
            </motion.div>
          )}
          {uploadState === "error" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-2 border-[#0e0e0e]"
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
          className="flex items-center gap-1.5 text-xs text-[#fe5a33] hover:text-[#fe0142] transition font-medium disabled:opacity-50"
        >
          <FiUploadCloud size={13} />
          {uploadState === "uploading" ? "Uploading..." : "Upload new photo"}
        </button>
        <p className="text-[10px] text-gray-500">JPG, PNG, GIF up to 5 MB · Auto-cropped to square</p>
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
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    }
  };

  return (
    <div className="w-full px-4 flex flex-col md:flex-row items-start justify-center gap-10 py-6">
      {/* ── Left: Form ───────────────────────────────────────── */}
      <div className="w-full md:w-2/3 flex justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="backdrop-blur-xl bg-[#0e0e0e]/80 border border-[#fe0142]/20 shadow-xl shadow-[#fe0142]/20 rounded-3xl px-6 py-6 w-full max-w-2xl"
        >
          {/* Header */}
          <motion.div
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-center mb-6"
          >
            <h2 className="text-3xl font-extrabold text-white flex justify-center items-center gap-2">
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <FaUserEdit className="text-[#fe0142]" />
              </motion.span>
              Edit{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-tr from-[#fe5a33] via-[#fe0142] to-[#fe5a33]">
                Profile
              </span>
            </h2>
            <p className="text-sm text-gray-400 mt-1">Keep your profile fresh!</p>
          </motion.div>

          {/* ── Photo Upload ──────────────────────────────────── */}
          <PhotoUpload
            currentPhoto={formData.photoUrl}
            onUploadSuccess={handlePhotoUploaded}
          />

          <div className="border-t border-white/10 mb-6" />

          {/* ── Form Fields ───────────────────────────────────── */}
          <form className="grid grid-cols-1 md:grid-cols-2 gap-5 text-white">
            {fields.map((field, i) => (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.07, duration: 0.35 }}
                className={field.type === "textarea" ? "md:col-span-2" : ""}
              >
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
                  {field.label}
                </label>

                {field.type === "select" ? (
                  <select
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    className="w-full bg-[#1a1a1a] text-white px-3 py-2.5 rounded-xl border border-white/10 focus:ring-2 focus:ring-[#fe0142] outline-none transition text-sm"
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
                    rows={3}
                    placeholder={field.placeholder}
                    className="w-full bg-[#1a1a1a] text-white px-3 py-2.5 rounded-xl border border-white/10 focus:ring-2 focus:ring-[#fe0142] outline-none transition placeholder:text-gray-600 resize-none text-sm"
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
                    className="w-full bg-[#1a1a1a] text-white px-3 py-2.5 rounded-xl border border-white/10 focus:ring-2 focus:ring-[#fe0142] outline-none transition placeholder:text-gray-600 text-sm"
                  />
                )}
              </motion.div>
            ))}

            {/* Save button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="md:col-span-2 mt-2"
            >
              <button
                type="submit"
                onClick={saveProfile}
                className="w-full cursor-pointer bg-gradient-to-tr from-[#fe5a33] via-[#fe0142] to-[#fe5a33] text-white font-semibold py-3 rounded-xl shadow-lg shadow-[#fe0142]/30 hover:shadow-[#fe0142]/50 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                Save Changes
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>

      {/* ── Right: Live Preview ───────────────────────────────── */}
      <div className="w-full md:w-1/3 flex flex-col items-center gap-3 pt-2 sticky top-4">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">
          Live Preview
        </p>
        <UserCard user={formData} />
      </div>
    </div>
  );
};

export default EditProfile;
