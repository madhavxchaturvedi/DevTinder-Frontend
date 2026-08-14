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
    <div className="flex justify-center items-center min-h-[85vh] w-full px-4 relative">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ccff00]/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-5xl h-[650px] rounded-[32px] overflow-hidden bg-[#121212] flex flex-col md:flex-row shadow-2xl border border-white/5 backdrop-blur-xl"
      >
        
        {/* Left Side: Branding & Visuals */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 relative p-12 bg-[#0a0a0a] border-r border-white/5 overflow-hidden">
          
          <div className="relative z-10 text-center mt-10">
            <h1 className="text-5xl font-bold tracking-tight mb-6 text-white">
              &lt;DevTinder /&gt;
            </h1>
            <p className="text-[#a3a3a3] font-medium text-lg leading-relaxed max-w-xs mx-auto">
              Connect with elite builders. Start building the future together.
            </p>
          </div>
          
          {/* Floating abstract code blocks */}
          <motion.div 
            animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }} 
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute top-[20%] right-[10%] px-5 py-3 bg-[#121212] border border-white/10 shadow-xl rounded-2xl flex items-center justify-center text-xs text-[#ccff00] font-bold font-mono backdrop-blur-sm"
          >
            git commit -m "Match"
          </motion.div>
          <motion.div 
            animate={{ y: [10, -10, 10], rotate: [0, -5, 0] }} 
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[25%] left-[5%] px-5 py-4 bg-[#121212] border border-white/10 shadow-xl rounded-2xl flex flex-col justify-center text-[10px] text-white font-bold font-mono backdrop-blur-sm"
          >
            <span><span className="text-[#a855f7]">if</span> (mutual) {`{`}</span>
            <span className="pl-4 text-blue-400">startBuild<span className="text-white">();</span></span>
            <span>{`}`}</span>
          </motion.div>
          
          {/* Decorative glow inside the left panel */}
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#a855f7]/10 to-transparent pointer-events-none" />
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-14 relative z-10 bg-[#121212]">
          <div className="w-full max-w-sm mx-auto">
            
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
                {isLogin ? "Welcome back" : "Create account"}
              </h2>
              <p className="text-[#a3a3a3] font-medium text-sm">
                {isLogin
                  ? "Enter your credentials to access your matches."
                  : "Start your journey to finding the perfect dev."}
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="flex gap-4">
                  <div className="relative w-1/2">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      onChange={handleChange}
                      required
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3.5 text-[#e5e5e5] font-semibold placeholder-gray-500 focus:outline-none focus:border-[#ccff00]/50 focus:ring-1 focus:ring-[#ccff00]/50 transition-all"
                    />
                  </div>
                  <div className="relative w-1/2">
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      onChange={handleChange}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3.5 text-[#e5e5e5] font-semibold placeholder-gray-500 focus:outline-none focus:border-[#ccff00]/50 focus:ring-1 focus:ring-[#ccff00]/50 transition-all"
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
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3.5 text-[#e5e5e5] font-semibold placeholder-gray-500 focus:outline-none focus:border-[#a855f7]/50 focus:ring-1 focus:ring-[#a855f7]/50 transition-all"
                />
              </div>
              
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3.5 text-[#e5e5e5] font-semibold placeholder-gray-500 focus:outline-none focus:border-[#a855f7]/50 focus:ring-1 focus:ring-[#a855f7]/50 transition-all"
                />
              </div>

              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm font-medium text-center bg-red-400/10 py-2.5 rounded-xl border border-red-400/20"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                className="w-full bg-[#ccff00] text-[#0a0a0a] font-bold text-lg py-3.5 rounded-none mt-6 hover:bg-[#bbf000] transition-all transform active:scale-[0.98]"
              >
                {isLogin ? "Log In" : "Sign Up"}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-[#a3a3a3] font-medium text-sm">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                  }}
                  className="ml-2 text-[#ccff00] hover:text-[#bbf000] font-bold transition-colors focus:outline-none"
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
