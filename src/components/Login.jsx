import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../redux/userSlice";
import { BASE_URL } from "../utils/constants";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Lock, Mail, User, Sparkles } from "lucide-react";
import { OctoPairLogo } from "./brand/OctoPairLogo";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [activeTab, setActiveTab] = useState(initialMode);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    // When arriving at login unauthenticated, purge any stale auth hints
    try {
      localStorage.removeItem("octopair_auth_hint");
      localStorage.removeItem("octopair_auth");
      localStorage.removeItem("devtinder_auth_hint");
      localStorage.removeItem("devtinder_auth");
    } catch {}
  }, []);

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "signup") {
      setActiveTab("signup");
    } else if (mode === "login") {
      setActiveTab("login");
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    emailId: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const isLogin = activeTab === "login";

    try {
      const endpoint = isLogin ? "/login" : "/signup";
      const bodyData = isLogin
        ? { emailId: formData.emailId, password: formData.password }
        : formData;

      const res = await axios.post(BASE_URL + endpoint, bodyData, {
        withCredentials: true,
      });

      try {
        localStorage.setItem("octopair_auth_hint", "true");
        localStorage.setItem("octopair_auth", "1");
      } catch {
        // Ignore storage errors during login
      }

      if (!isLogin) {
        const newUser = res.data?.data;
        dispatch(addUser(newUser));
        toast.success("Account created successfully.");
        if (newUser && newUser.profileComplete === false) {
          navigate("/onboarding");
        } else {
          navigate("/feed");
        }
      } else {
        const loggedUser = res.data?.data || res.data;
        dispatch(addUser(loggedUser));
        toast.success("Welcome back.");
        if (loggedUser && loggedUser.profileComplete === false) {
          navigate("/onboarding");
        } else {
          navigate("/feed");
        }
      }
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        (typeof err?.response?.data === "string" ? err?.response?.data : null) ||
        "Authentication failed. Please check your credentials.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#09090b] text-[#f0f0f0] select-none">
      {/* 40px Subtle Background Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Centered Auth Card */}
      <Motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="glass-card max-w-md w-full px-8 py-10 shadow-[0_0_60px_rgba(0,0,0,0.5)] z-10 my-8"
      >
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2.5 mb-3 group hover:opacity-90 transition-opacity"
          >
            <OctoPairLogo className="h-12 w-auto text-[#f0f0f0] group-hover:text-[#ccff00] transition-colors" />
            <span className="text-2xl font-black tracking-tighter text-[#f0f0f0]">
              OctoPair
            </span>
          </Link>

          <h2 className="text-xl font-bold tracking-tight text-[#f0f0f0]">
            {activeTab === "login" ? "Welcome Back" : "Join the Dev Network"}
          </h2>
          <p className="text-xs text-[#52525b] mt-1">
            {activeTab === "login"
              ? "Sign in to connect, match, and build with peers."
              : "Create your developer identity to find collaborators."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-[#1a1a1f] border border-white/[0.07] rounded-lg mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab("login");
              setError("");
            }}
            className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === "login"
                ? "bg-[#ccff00] text-black shadow-sm"
                : "text-[#52525b] hover:text-[#f0f0f0]"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("signup");
              setError("");
            }}
            className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === "signup"
                ? "bg-[#ccff00] text-black shadow-sm"
                : "text-[#52525b] hover:text-[#f0f0f0]"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {activeTab === "signup" && (
              <Motion.div
                key="name-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 gap-3 overflow-hidden"
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#52525b]">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-[#52525b]" />
                    <input
                      id="firstName"
                      name="firstName"
                      placeholder="Ada"
                      value={formData.firstName}
                      onChange={handleChange}
                      required={activeTab === "signup"}
                      className="w-full bg-[#111113] border border-white/10 rounded-lg text-sm pl-9 pr-3 py-2 text-[#f0f0f0] placeholder:text-[#52525b] focus:outline-none focus:border-[#ccff00]/60 focus:ring-1 focus:ring-[#ccff00]/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#52525b]">Last Name</label>
                  <input
                    id="lastName"
                    name="lastName"
                    placeholder="Lovelace"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-[#111113] border border-white/10 rounded-lg text-sm px-3 py-2 text-[#f0f0f0] placeholder:text-[#52525b] focus:outline-none focus:border-[#ccff00]/60 focus:ring-1 focus:ring-[#ccff00]/50"
                  />
                </div>
              </Motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#52525b]">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#52525b]" />
              <input
                id="emailId"
                type="email"
                name="emailId"
                placeholder="developer@example.com"
                value={formData.emailId}
                onChange={handleChange}
                required
                className="w-full bg-[#111113] border border-white/10 rounded-lg text-sm pl-9 pr-3 py-2 text-[#f0f0f0] placeholder:text-[#52525b] focus:outline-none focus:border-[#ccff00]/60 focus:ring-1 focus:ring-[#ccff00]/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#52525b]">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#52525b]" />
              <input
                id="password"
                type="password"
                name="password"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-[#111113] border border-white/10 rounded-lg text-sm pl-9 pr-3 py-2 text-[#f0f0f0] placeholder:text-[#52525b] focus:outline-none focus:border-[#ccff00]/60 focus:ring-1 focus:ring-[#ccff00]/50"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* Full-width Lime Primary Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-[#ccff00] text-black font-bold text-sm py-2.5 rounded-lg hover:bg-[#d9ff33] transition-all cursor-pointer shadow-[0_0_20px_rgba(204,255,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              "Processing..."
            ) : activeTab === "login" ? (
              <>
                Log In <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                Create Account <Sparkles className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Switch toggle link */}
        <div className="mt-6 text-center text-xs text-[#52525b]">
          {activeTab === "login" ? "New to OctoPair? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setActiveTab(activeTab === "login" ? "signup" : "login");
              setError("");
            }}
            className="font-bold text-[#ccff00] hover:underline ml-1 cursor-pointer"
          >
            {activeTab === "login" ? "Create an account" : "Sign in here"}
          </button>
        </div>
      </Motion.div>
    </div>
  );
};

export default Login;
