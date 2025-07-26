import React, { useState } from "react";
import UserCard from "./UserCard"; // your feed card component
import { motion } from "framer-motion";
import { FaUserEdit } from "react-icons/fa";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { addUser } from "../redux/userSlice";
import toast from "react-hot-toast";

const EditProfile = ({ user }) => {
  const { firstName, lastName, age, gender, photoUrl, about, skills } = user;
  const dispatch = useDispatch();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName,
    lastName,
    age,
    gender,
    photoUrl,
    about,
    skills,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "skills" ? value.split(",").map((s) => s.trim()) : value,
    }));
  };

  const fields = [
    {
      label: "First Name",
      name: "firstName",
      type: "text",
      placeholder: "Enter your first name",
    },
    {
      label: "Last Name",
      name: "lastName",
      type: "text",
      placeholder: "Enter your last name",
    },
    {
      label: "Age",
      name: "age",
      type: "number",
      placeholder: "Enter your age",
    },
    {
      label: "Gender",
      name: "gender",
      type: "select",
      options: ["male", "female", "other"],
    },
    {
      label: "Photo URL",
      name: "photoUrl",
      type: "text",
      placeholder: "Paste your image URL",
    },
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
    setError("");
    try {
      const res = await axios.post(BASE_URL + "/profile/edit", formData, {
        withCredentials: true,
      });
      dispatch(addUser(res?.data?.data));
      toast.success(" Profile is Successfully Updated!");
    } catch (err) {
      toast.error(err.message);
      console.log(err.message);
    }
  };

  return (
    <div
      className="w-full  px-18 flex flex-col md:flex-row items-center justify-center gap-16 bg-cover"
      style={{ backgroundImage: 'url("/your-body-bg.jpg")' }}
    >
      {/* Left: Form */}
      <div className="py-2 bg-[url('/bg.png')] bg-cover bg-center flex justify-center px-4 w-full md:w-2/3">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="backdrop-blur-xl bg-[#0e0e0e]/80 border border-[#fe0142]/20 shadow-xl shadow-[#fe0142]/30 rounded-3xl px-6 py-5 w-full max-w-5xl"
        >
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-4xl font-extrabold text-white flex justify-center items-center gap-2">
              <motion.div
                animate={{
                  opacity: [1, 0.4, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              >
                <FaUserEdit className="text-[#fe0142]" />
              </motion.div>
              <span>
                Edit{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-tr from-[#fe5a33] via-[#fe0142] to-[#fe5a33]">
                  Profile
                </span>
              </span>
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Keep your profile up-to-date!
            </p>
          </motion.div>

          {/* Form */}
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
            {fields.map((field, i) => (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.1, duration: 0.4 }}
                className={field.type === "textarea" ? "md:col-span-2" : ""}
              >
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {field.label}
                </label>

                {field.type === "select" ? (
                  <select
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="w-full bg-[#1b1b1b] text-white px-3 py-2 rounded-lg border border-[#fe0142]/30 focus:ring-2 focus:ring-[#fe0142] outline-none transition"
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
                    value={formData[field.name]}
                    onChange={handleChange}
                    rows="3"
                    placeholder={field.placeholder}
                    className="w-full bg-[#1b1b1b] text-white px-3 py-2 rounded-lg border border-[#fe0142]/30 focus:ring-2 focus:ring-[#fe0142] outline-none transition placeholder:text-gray-500 resize-none"
                  />
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={
                      field.name === "skills"
                        ? formData.skills.join(", ")
                        : formData[field.name]
                    }
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="w-full bg-[#1b1b1b] text-white px-3 py-2 rounded-lg border border-[#fe0142]/30 focus:ring-2 focus:ring-[#fe0142] outline-none transition placeholder:text-gray-500"
                  />
                )}
              </motion.div>
            ))}

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="md:col-span-2"
            >
              <button
                type="submit"
                onClick={saveProfile}
                className="w-full bg-gradient-to-tr from-[#fe5a33] via-[#fe0142] to-[#fe5a33] text-white font-semibold py-3 rounded-xl shadow-lg shadow-[#fe0142]/40 transition"
              >
                Save Changes
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>

      {/* Right: Live Preview */}
      <div className="w-full md:w-1/3 flex justify-center items-start pt-2">
        <UserCard user={formData} />
      </div>
    </div>
  );
};

export default EditProfile;
