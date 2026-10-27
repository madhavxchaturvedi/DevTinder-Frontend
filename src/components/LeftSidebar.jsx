import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Home,
  Compass,
  MessageSquare,
  FolderGit2,
  Users,
  Settings,
  LogOut,
  MoreHorizontal,
  Search,
  User,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { OctoPairLogo } from "./brand/OctoPairLogo";
import axios from "axios";
import { BASE_URL, DEFAULT_AVATAR } from "../utils/constants";
import { removeUser } from "../redux/userSlice";
import NotificationsDropdown from "./NotificationsDropdown";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { cn } from "@/lib/utils";

const LeftSidebar = () => {
  const user = useSelector((store) => store.user);
  const requests = useSelector((store) => store.requests);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  const pendingRequestsCount = Array.isArray(requests) ? requests.length : 0;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      try {
        localStorage.removeItem("octopair_auth_hint");
        localStorage.removeItem("octopair_auth");
        localStorage.removeItem("devtinder_auth_hint");
        localStorage.removeItem("devtinder_auth");
      } catch {
        // Ignore storage errors on logout
      }
      dispatch(removeUser());
      navigate("/login");
    }
  };

  const handleOpenCommandPalette = () => {
    window.dispatchEvent(new Event("open-command-palette"));
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
    );
  };

  if (!user) return null;

  const mainNav = [
    { name: "My Feed", path: "/feed", icon: Home },
    { name: "Explore", path: "/discover", icon: Compass },
  ];

  const collaborateNav = [
    { name: "Messages", path: "/chat", icon: MessageSquare },
    { name: "My Projects", path: "/projects", icon: FolderGit2 },
  ];

  const networkNav = [
    {
      name: "Connections",
      path: "/connections",
      icon: Users,
    },
    {
      name: "Requests",
      path: "/requests",
      icon: UserCheck,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : null,
    },
  ];

  const upgradeNav = [
    { name: "Premium", path: "/premium", icon: Sparkles },
  ];

  const renderNavGroup = (items, title) => (
    <div className="mb-5">
      <h4 className="text-[10px] uppercase font-bold tracking-wider text-[#52525b] mb-1.5 px-3">
        {title}
      </h4>
      <div className="flex flex-col gap-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center justify-between px-3 py-2 text-xs font-medium transition-all group relative",
                isActive
                  ? "bg-[#ccff00]/8 text-[#ccff00] border-l-2 border-[#ccff00] font-bold rounded-r-lg [text-shadow:0_0_12px_rgba(204,255,0,0.5)]"
                  : "text-[#52525b] hover:text-[#a0a0a0] hover:bg-white/[0.04] rounded-lg"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform group-hover:scale-105",
                    isActive
                      ? "text-[#ccff00] drop-shadow-[0_0_8px_rgba(204,255,0,0.6)]"
                      : "text-[#52525b] group-hover:text-[#a0a0a0]"
                  )}
                />
                <span className="truncate">{item.name}</span>
              </div>

              {item.badge && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-[#b266ff]/15 text-[#b266ff] border border-[#b266ff]/30 shrink-0">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );

  const initials = (
    (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "")
  ).toUpperCase() || "U";

  return (
    <aside className="hidden lg:flex w-[260px] flex-col h-dvh sticky top-0 bg-[#09090b] border-r border-white/[0.07] py-6 px-4 z-50 select-none flex-shrink-0">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-2 mb-6">
        <Link
          to="/feed"
          className="flex items-center gap-2.5 text-[#f0f0f0] hover:text-[#ccff00] transition-colors group"
        >
          <OctoPairLogo className="h-8 w-auto text-[#f0f0f0] group-hover:text-[#ccff00] transition-colors" />
          <span className="text-lg font-black tracking-tighter">OctoPair</span>
        </Link>
        <NotificationsDropdown />
      </div>

      {/* Quick Search Trigger (Cmd+K) */}
      <div className="px-1 mb-6">
        <button
          onClick={handleOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#111113] border border-white/10 text-xs text-[#52525b] hover:text-[#f0f0f0] hover:border-white/20 transition-all cursor-pointer shadow-sm"
        >
          <span className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5" />
            <span>Search</span>
          </span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-white/5 border border-white/10 text-[#a0a0a0]">
            Cmd+K
          </kbd>
        </button>
      </div>

      {/* 4 Navigation Groups */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1">
        {renderNavGroup(mainNav, "MAIN")}
        {renderNavGroup(collaborateNav, "COLLABORATE")}
        {renderNavGroup(networkNav, "NETWORK")}
        {renderNavGroup(upgradeNav, "UPGRADE")}
      </div>

      {/* User Card & Profile Menu */}
      <div className="relative mt-auto pt-4 border-t border-white/[0.07]" ref={menuRef}>
        {/* Popover Menu */}
        {showProfileMenu && (
          <div className="absolute bottom-[calc(100%+8px)] left-0 w-full bg-[#1a1a1f] border border-white/[0.07] rounded-xl p-1.5 shadow-2xl origin-bottom animate-in fade-in zoom-in-95 duration-150 z-50">
            <Link
              to={`/user/${user?._id}`}
              onClick={() => setShowProfileMenu(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#f0f0f0] hover:bg-white/5 transition-colors"
            >
              <User className="h-3.5 w-3.5 text-[#ccff00]" /> View Public Profile
            </Link>

            <Link
              to="/profile"
              onClick={() => setShowProfileMenu(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#f0f0f0] hover:bg-white/5 transition-colors"
            >
              <Settings className="h-3.5 w-3.5 text-[#52525b]" /> Edit Profile
            </Link>

            <Link
              to="/premium"
              onClick={() => setShowProfileMenu(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#f0f0f0] hover:bg-white/5 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#b266ff]" /> Premium Tier
            </Link>

            <div className="h-px bg-white/[0.07] my-1 mx-1" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full text-left cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        )}

        {/* User Mini Card */}
        <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors group">
          <Link
            to={`/user/${user?._id}`}
            className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-90 transition-opacity"
            title="View public profile"
          >
            <Avatar className="h-8 w-8 rounded-lg border border-white/10 group-hover:border-[#ccff00] transition-colors">
              <AvatarImage src={user.photoUrl || DEFAULT_AVATAR} alt={user.firstName} />
              <AvatarFallback className="bg-[#111113] text-xs font-mono font-bold text-[#f0f0f0]">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col min-w-0 text-left">
              <span className="text-xs font-bold text-[#f0f0f0] truncate group-hover:text-[#ccff00] transition-colors">
                {user.firstName} {user.lastName}
              </span>
              <span className="text-[10px] font-mono text-[#52525b] truncate">
                {user.headline || "Developer"}
              </span>
            </div>
          </Link>

          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="p-1.5 rounded-lg text-[#52525b] hover:text-[#f0f0f0] hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Profile actions"
          >
            <MoreHorizontal
              className={cn(
                "h-4 w-4 transition-transform",
                showProfileMenu && "rotate-90 text-[#f0f0f0]"
              )}
            />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default LeftSidebar;
