import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FiHome, FiUsers, FiMessageSquare, FiBookmark, FiBell, FiSettings, FiLogOut, FiCompass, FiStar } from "react-icons/fi";
import { HiCode } from "react-icons/hi";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../redux/userSlice";

const LeftSidebar = () => {
  const user = useSelector((store) => store.user);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  if (!user) return null;

  const navItems = [
    { name: "My Feed", path: "/feed", icon: <FiHome size={20} /> },
    { name: "Discover", path: "/discover", icon: <FiCompass size={20} /> },
    { name: "Connections", path: "/connections", icon: <FiUsers size={20} /> },
    { name: "Messages", path: "/chat", icon: <FiMessageSquare size={20} /> },
    { name: "Requests", path: "/requests", icon: <FiBell size={20} /> },
    { name: "Premium", path: "/premium", icon: <FiStar size={20} /> },
    { name: "Settings", path: "/profile", icon: <FiSettings size={20} /> },
  ];

  return (
    <div className="hidden lg:flex w-64 flex-col h-screen sticky top-0 bg-[#0a0a0a] border-r border-white/5 py-6 px-4">
      {/* Logo */}
      <Link to="/feed" className="flex items-center gap-2 px-2 mb-10 text-white hover:text-[#ccff00] transition-colors">
        <HiCode size={28} />
        <span className="text-xl font-black tracking-tight font-mono">DevTinder</span>
      </Link>

      {/* Nav Links */}
      <div className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => {
          // Adjust isActive so it exactly matches or starts with (for chat/user)
          const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg font-medium transition-all ${
                isActive
                  ? "bg-[#ccff00]/10 text-[#ccff00]"
                  : "text-[#a3a3a3] hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className={isActive ? "text-[#ccff00]" : "text-[#a3a3a3]"}>
                {item.icon}
              </span>
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-2 mt-4">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 text-[#a3a3a3] hover:text-red-400 hover:bg-white/5 transition-colors font-medium rounded-lg w-full text-left"
        >
          <FiLogOut size={20} />
          Logout
        </button>

        {/* User Profile Mini */}
        <Link to={`/user/${user._id}`} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors group mt-2">
          <img
            src={user.photoUrl || "https://geographyandyou.com/images/user-profile.png"}
            alt={user.firstName}
            className="w-10 h-10 rounded-full object-cover border border-white/10 group-hover:border-[#ccff00] transition-colors"
          />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-semibold text-white truncate group-hover:text-[#ccff00] transition-colors">
              {user.firstName} {user.lastName}
            </span>
            <span className="text-[10px] text-[#a3a3a3] uppercase tracking-wider">
              View Profile
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default LeftSidebar;
