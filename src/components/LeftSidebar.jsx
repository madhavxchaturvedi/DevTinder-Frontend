import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FiHome, FiUsers, FiMessageSquare, FiCompass, FiSettings, FiLogOut, FiMoreHorizontal, FiUserPlus } from "react-icons/fi";
import { HiCode } from "react-icons/hi";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../redux/userSlice";
import NotificationsDropdown from "./NotificationsDropdown";

const LeftSidebar = () => {
  const user = useSelector((store) => store.user);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const coreNav = [
    { name: "My Feed", path: "/feed", icon: <FiHome size={18} /> },
    { name: "Discover", path: "/discover", icon: <FiCompass size={18} /> },
    { name: "Messages", path: "/chat", icon: <FiMessageSquare size={18} /> },
  ];

  const networkNav = [
    { name: "Connections", path: "/connections", icon: <FiUsers size={18} /> },
    { name: "Requests", path: "/requests", icon: <FiUserPlus size={18} /> },
  ];

  const renderNavGroup = (items, title) => (
    <div className="mb-6">
      <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#555] mb-2 px-4">{title}</h4>
      <div className="flex flex-col gap-1">
        {items.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold tracking-wide transition-all duration-300 ${
                isActive
                  ? "bg-white/5 text-[#ccff00]"
                  : "text-[#737373] hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </span>
              <span className="text-[14px]">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="hidden lg:flex w-[260px] flex-col h-screen sticky top-0 bg-transparent py-8 px-6 z-50">
      {/* Logo and Notifications */}
      <div className="flex items-center justify-between px-3 mb-8">
        <Link to="/feed" className="flex items-center gap-2 text-white hover:text-[#ccff00] transition-colors">
          <HiCode size={26} />
          <span className="text-lg font-black tracking-tight font-mono mt-0.5">DevTinder</span>
        </Link>
        <NotificationsDropdown />
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
        {renderNavGroup(coreNav, "Platform")}
        {renderNavGroup(networkNav, "Network")}
      </div>

      {/* Bottom Profile Action */}
      <div className="relative mt-4" ref={menuRef}>
        
        {/* Popover Menu */}
        {showProfileMenu && (
          <div className="absolute bottom-[calc(100%+12px)] left-0 w-full bg-[#151515] border border-[#262626] rounded-2xl p-2 shadow-2xl origin-bottom animate-in fade-in zoom-in-95 duration-200">
            <Link 
              to="/profile" 
              onClick={() => setShowProfileMenu(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#a3a3a3] hover:text-white hover:bg-white/5 transition-all text-sm font-semibold"
            >
              <FiSettings size={16} /> Settings
            </Link>
            <div className="h-px bg-white/5 my-1 mx-2" />
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#ff5555]/80 hover:text-[#ff5555] hover:bg-[#ff5555]/10 transition-all text-sm font-semibold w-full text-left"
            >
              <FiLogOut size={16} /> Logout
            </button>
          </div>
        )}

        {/* User Profile Mini Trigger */}
        <button 
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl transition-all duration-300 border ${
            showProfileMenu ? 'bg-white/5 border-white/10' : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={user.photoUrl || "https://geographyandyou.com/images/user-profile.png"}
              alt={user.firstName}
              className="w-9 h-9 rounded-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
            />
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-[13px] font-bold text-white truncate group-hover:text-[#ccff00] transition-colors leading-tight">
                {user.firstName} {user.lastName}
              </span>
              <span className="text-[10px] text-[#737373] font-mono tracking-widest uppercase mt-0.5">
                Pro Member
              </span>
            </div>
          </div>
          <FiMoreHorizontal className={`text-[#737373] transition-transform duration-300 ${showProfileMenu ? 'rotate-90 text-white' : ''}`} />
        </button>
      </div>
    </div>
  );
};

export default LeftSidebar;
