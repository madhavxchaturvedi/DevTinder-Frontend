import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../redux/userSlice";
import { BASE_URL } from "../utils/constants";
import { motion } from "framer-motion";

const LoginForm = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    emailId: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const endpoint = isLogin ? "/login" : "/signup";
      const bodyData = isLogin
        ? { emailId: formData.emailId, password: formData.password }
        : formData;

      const res = await axios.post(BASE_URL + endpoint, bodyData, {
        withCredentials: true,
      });
      if (!isLogin) {
        dispatch(addUser(res.data?.data));
        navigate("/profile");
      } else {
        dispatch(addUser(res.data));
        navigate("/feed");
      }
    } catch (err) {
      setError(err?.response?.data || "Something went wrong!");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[85vh] w-full px-4">
      
      {/* Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-5xl h-[650px] rounded-[40px] overflow-hidden bg-white flex flex-col md:flex-row shadow-[12px_12px_0px_#0a0a0a] border-4 border-[#0a0a0a]"
      >
        
        {/* Left Side: Branding & Visuals */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 relative p-12 bg-[#ccff00] border-r-4 border-[#0a0a0a] overflow-hidden">
          
          <div className="relative z-10 text-center">
            <h1 className="text-6xl font-black tracking-tighter mb-4 text-[#0a0a0a]">
              &lt;DevTinder /&gt;
            </h1>
            <p className="text-[#0a0a0a] font-bold text-lg leading-relaxed max-w-sm mx-auto">
              Swipe right on great code. Find your next pair-programming partner or co-founder.
            </p>
          </div>
          
          {/* Floating abstract code blocks */}
          <motion.div 
            animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }} 
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute top-[20%] right-[15%] px-4 py-2 bg-white border-2 border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] rounded-lg flex items-center justify-center text-xs text-[#0a0a0a] font-bold font-mono"
          >
            git commit -m "Match"
          </motion.div>
          <motion.div 
            animate={{ y: [10, -10, 10], rotate: [0, -5, 0] }} 
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[25%] left-[10%] px-4 py-3 bg-white border-2 border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] rounded-lg flex flex-col justify-center text-[10px] text-[#0a0a0a] font-bold font-mono"
          >
            <span>if (mutual) {`{`}</span>
            <span className="pl-2">startBuild();</span>
            <span>{`}`}</span>
          </motion.div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-16 bg-white relative z-10">
          <div className="w-full max-w-sm mx-auto">
            
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-4xl font-black text-[#0a0a0a] tracking-tight mb-2">
                {isLogin ? "Welcome back" : "Create account"}
              </h2>
              <p className="text-gray-500 font-bold text-sm">
                {isLogin
                  ? "Enter your details to access your matches."
                  : "Start your journey to finding the perfect dev."}
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="flex gap-4">
                  <div className="relative w-1/2">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      onChange={handleChange}
                      required
                      className="w-full bg-[#f4f4f5] border-2 border-[#0a0a0a] rounded-xl px-4 py-3.5 text-[#0a0a0a] font-bold placeholder-gray-400 focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_#a855f7] transition-all"
                    />
                  </div>
                  <div className="relative w-1/2">
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      onChange={handleChange}
                      className="w-full bg-[#f4f4f5] border-2 border-[#0a0a0a] rounded-xl px-4 py-3.5 text-[#0a0a0a] font-bold placeholder-gray-400 focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_#a855f7] transition-all"
                    />
                  </div>
                </div>
              )}
              
              <div className="relative">
                <input
                  type="email"
                  name="emailId"
                  placeholder="Email address"
                  onChange={handleChange}
                  required
                  className="w-full bg-[#f4f4f5] border-2 border-[#0a0a0a] rounded-xl px-4 py-3.5 text-[#0a0a0a] font-bold placeholder-gray-400 focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_#a855f7] transition-all"
                />
              </div>
              
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  onChange={handleChange}
                  required
                  className="w-full bg-[#f4f4f5] border-2 border-[#0a0a0a] rounded-xl px-4 py-3.5 text-[#0a0a0a] font-bold placeholder-gray-400 focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_#a855f7] transition-all"
                />
              </div>

              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm font-medium text-center bg-red-400/10 py-2 rounded-lg border border-red-400/20"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                className="w-full neo-btn-primary py-4 mt-6"
              >
                {isLogin ? "Log In" : "Sign Up"}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-500 font-bold text-sm">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                  }}
                  className="ml-2 text-[#a855f7] hover:text-[#0a0a0a] font-black transition-colors focus:outline-none"
                >
                  {isLogin ? "Sign Up" : "Log In"}
                </button>
              </p>
            </div>
            
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginForm;
